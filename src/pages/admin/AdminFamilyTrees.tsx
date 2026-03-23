import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Trash2, TreePine, Users, Heart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TreeWithStats {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  persons_count: number;
  unions_count: number;
  relations_count: number;
}

export default function AdminFamilyTrees() {
  const { toast } = useToast();
  const [trees, setTrees] = useState<TreeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TreeWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrees = async () => {
    setLoading(true);

    // Fetch trees with owner profiles
    const { data: treesData, error: treesError } = await supabase
      .from("family_trees")
      .select("id, name, user_id, created_at")
      .order("created_at", { ascending: false });

    if (treesError || !treesData) {
      toast({ title: "Erreur", description: "Impossible de charger les arbres", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (treesData.length === 0) {
      setTrees([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for owner names
    const userIds = [...new Set(treesData.map((t) => t.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) ?? []);

    // Fetch counts per tree
    const treeIds = treesData.map((t) => t.id);

    const [personsRes, unionsRes, relationsRes] = await Promise.all([
      supabase.from("family_persons").select("tree_id").in("tree_id", treeIds),
      supabase.from("family_unions").select("id, person1_id").in(
        "person1_id",
        (await supabase.from("family_persons").select("id").in("tree_id", treeIds)).data?.map((p) => p.id) ?? []
      ),
      supabase.from("family_parent_child").select("id, parent_id").in(
        "parent_id",
        (await supabase.from("family_persons").select("id").in("tree_id", treeIds)).data?.map((p) => p.id) ?? []
      ),
    ]);

    // Count persons per tree
    const personsCountMap = new Map<string, number>();
    personsRes.data?.forEach((p) => {
      personsCountMap.set(p.tree_id, (personsCountMap.get(p.tree_id) || 0) + 1);
    });

    // For unions and relations, we need person->tree mapping
    const personTreeMap = new Map<string, string>();
    personsRes.data?.forEach((p) => {
      personTreeMap.set(p.tree_id, p.tree_id); // This won't work, need person id
    });

    // Simpler approach: fetch persons with their ids to build person->tree map
    const { data: personsWithIds } = await supabase
      .from("family_persons")
      .select("id, tree_id")
      .in("tree_id", treeIds);

    const personToTree = new Map<string, string>();
    personsWithIds?.forEach((p) => {
      personToTree.set(p.id, p.tree_id);
    });

    const unionsCountMap = new Map<string, number>();
    unionsRes.data?.forEach((u) => {
      const treeId = personToTree.get(u.person1_id);
      if (treeId) unionsCountMap.set(treeId, (unionsCountMap.get(treeId) || 0) + 1);
    });

    const relationsCountMap = new Map<string, number>();
    relationsRes.data?.forEach((r) => {
      const treeId = personToTree.get(r.parent_id);
      if (treeId) relationsCountMap.set(treeId, (relationsCountMap.get(treeId) || 0) + 1);
    });

    // Fetch emails via get_user_email function
    const emailPromises = userIds.map(async (uid) => {
      const { data } = await supabase.rpc("get_user_email", { _user_id: uid });
      return [uid, data as string | null] as const;
    });
    const emailResults = await Promise.all(emailPromises);
    const emailMap = new Map(emailResults);

    const enriched: TreeWithStats[] = treesData.map((t) => ({
      ...t,
      owner_name: profileMap.get(t.user_id) ?? null,
      owner_email: emailMap.get(t.user_id) ?? null,
      persons_count: personsCountMap.get(t.id) || 0,
      unions_count: unionsCountMap.get(t.id) || 0,
      relations_count: relationsCountMap.get(t.id) || 0,
    }));

    setTrees(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Delete persons first (cascade will handle unions/relations via FK)
    await supabase.from("family_persons").delete().eq("tree_id", deleteTarget.id);
    
    const { error } = await supabase.from("family_trees").delete().eq("id", deleteTarget.id);
    
    if (error) {
      toast({ title: "Erreur", description: "Suppression échouée", variant: "destructive" });
    } else {
      toast({ title: "Arbre supprimé", description: `"${deleteTarget.name}" a été supprimé.` });
      setTrees((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filtered = trees.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.owner_name?.toLowerCase().includes(q) ?? false) ||
      (t.owner_email?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalPersons = trees.reduce((s, t) => s + t.persons_count, 0);
  const largestTree = trees.length > 0 ? trees.reduce((a, b) => (a.persons_count > b.persons_count ? a : b)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Arbres généalogiques</h1>
        <p className="text-muted-foreground">Gérer les arbres de tous les utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TreePine className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{trees.length}</p>
              <p className="text-sm text-muted-foreground">Arbres</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalPersons}</p>
              <p className="text-sm text-muted-foreground">Personnes total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{largestTree?.persons_count ?? 0}</p>
              <p className="text-sm text-muted-foreground">
                Plus grand arbre{largestTree ? ` (${largestTree.name})` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou propriétaire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Arbre</TableHead>
                <TableHead className="text-center">Personnes</TableHead>
                <TableHead className="text-center">Unions</TableHead>
                <TableHead className="text-center">Relations</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Aucun arbre trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tree) => (
                  <TableRow key={tree.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tree.owner_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{tree.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tree.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tree.persons_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{tree.unions_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{tree.relations_count}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(tree.created_at), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(tree)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet arbre ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'arbre « {deleteTarget?.name} » ({deleteTarget?.persons_count} personnes) sera
              définitivement supprimé avec toutes ses données. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
