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
import { Search, Trash2, TreePine, Users, Heart, Loader2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
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

    // Single RPC call gets all tree stats server-side
    const { data: statsData, error: statsError } = await supabase
      .rpc("get_admin_tree_stats" as any);

    if (statsError || !statsData) {
      toast({ title: "Erreur", description: "Impossible de charger les arbres", variant: "destructive" });
      setLoading(false);
      return;
    }

    const rows = statsData as Array<{
      tree_id: string;
      tree_name: string;
      tree_user_id: string;
      tree_created_at: string;
      persons_count: number;
      unions_count: number;
      relations_count: number;
    }>;

    if (rows.length === 0) {
      setTrees([]);
      setLoading(false);
      return;
    }

    // Fetch profiles and emails in parallel
    const userIds = [...new Set(rows.map((r) => r.tree_user_id))];

    const [profilesRes, ...emailResults] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      ...userIds.map(async (uid) => {
        const { data } = await supabase.rpc("get_user_email", { _user_id: uid });
        return [uid, data as string | null] as const;
      }),
    ]);

    const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p.display_name]) ?? []);
    const emailMap = new Map(emailResults as Array<readonly [string, string | null]>);

    const enriched: TreeWithStats[] = rows.map((r) => ({
      id: r.tree_id,
      name: r.tree_name,
      user_id: r.tree_user_id,
      created_at: r.tree_created_at,
      owner_name: profileMap.get(r.tree_user_id) ?? null,
      owner_email: emailMap.get(r.tree_user_id) ?? null,
      persons_count: Number(r.persons_count),
      unions_count: Number(r.unions_count),
      relations_count: Number(r.relations_count),
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        <>
          {/* Mobile card layout */}
          <div className="lg:hidden space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucun arbre trouvé</div>
            ) : (
              filtered.map((tree) => (
                <div key={tree.id} className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tree.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tree.owner_name || "—"}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link to={`/family-tree?viewTreeId=${tree.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(tree)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{tree.persons_count} pers.</Badge>
                    <Badge variant="outline" className="text-[10px]">{tree.unions_count} unions</Badge>
                    <Badge variant="outline" className="text-[10px]">{tree.relations_count} rel.</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(tree.created_at), "dd MMM yyyy", { locale: fr })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Desktop table */}
          <div className="hidden lg:block rounded-lg border">
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
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun arbre trouvé</TableCell></TableRow>
                ) : (
                  filtered.map((tree) => (
                    <TableRow key={tree.id}>
                      <TableCell>
                        <div><p className="font-medium">{tree.owner_name || "—"}</p><p className="text-xs text-muted-foreground">{tree.owner_email}</p></div>
                      </TableCell>
                      <TableCell className="font-medium">{tree.name}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary">{tree.persons_count}</Badge></TableCell>
                      <TableCell className="text-center"><Badge variant="outline">{tree.unions_count}</Badge></TableCell>
                      <TableCell className="text-center"><Badge variant="outline">{tree.relations_count}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(tree.created_at), "dd MMM yyyy", { locale: fr })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild><Link to={`/family-tree?viewTreeId=${tree.id}`}><Eye className="h-4 w-4" /></Link></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(tree)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
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
