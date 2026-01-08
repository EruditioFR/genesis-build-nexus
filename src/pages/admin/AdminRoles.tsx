import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Shield, UserPlus, Trash2, Crown, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    display_name: string | null;
  };
}

interface Profile {
  user_id: string;
  display_name: string | null;
}

export default function AdminRoles() {
  const { isAdmin } = useAdminAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<string>("moderator");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchRoles();
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRoles(data);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name");
    
    if (data) {
      setProfiles(data);
    }
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find((p) => p.user_id === userId);
    return profile?.display_name || userId.slice(0, 8) + "...";
  };

  const handleAddRole = async () => {
    if (!newUserId.trim()) {
      toast.error("Veuillez entrer un ID utilisateur");
      return;
    }

    setAdding(true);

    // Check if user exists
    const { data: profileExists } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", newUserId.trim())
      .single();

    if (!profileExists) {
      toast.error("Utilisateur non trouvé");
      setAdding(false);
      return;
    }

    // Check if role already exists
    const existingRole = roles.find(
      (r) => r.user_id === newUserId.trim() && r.role === newRole
    );

    if (existingRole) {
      toast.error("Cet utilisateur a déjà ce rôle");
      setAdding(false);
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert([{
        user_id: newUserId.trim(),
        role: newRole as "admin" | "moderator" | "user",
      }]);

    if (error) {
      toast.error("Erreur lors de l'ajout du rôle");
    } else {
      toast.success("Rôle ajouté avec succès");
      fetchRoles();
      setAddDialogOpen(false);
      setNewUserId("");
      setNewRole("moderator");
    }

    setAdding(false);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", selectedRole.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Rôle supprimé");
      fetchRoles();
    }

    setDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            Modérateur
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Accès refusé</h2>
        <p className="text-muted-foreground">Seuls les administrateurs peuvent gérer les rôles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Gestion des rôles</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter un rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un rôle</DialogTitle>
              <DialogDescription>
                Attribuez un rôle à un utilisateur existant.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">ID Utilisateur</Label>
                <Input
                  id="userId"
                  placeholder="UUID de l'utilisateur"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="moderator">Modérateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddRole} disabled={adding}>
                {adding ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Explanation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rôles et permissions</CardTitle>
          <CardDescription>
            Les rôles déterminent les permissions d'accès au backoffice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <Crown className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Administrateur</p>
                <p className="text-sm text-muted-foreground">
                  Accès complet : gestion des utilisateurs, suppression de contenu, modification des abonnements, gestion des rôles.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
              <ShieldCheck className="h-5 w-5 text-secondary-foreground mt-0.5" />
              <div>
                <p className="font-medium">Modérateur</p>
                <p className="text-sm text-muted-foreground">
                  Accès limité : voir tous les contenus, supprimer les commentaires inappropriés.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {roles.length} rôle(s) attribué(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Attribué le</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <div className="h-12 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun rôle attribué
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getProfileName(role.user_id)}</p>
                          <p className="text-xs text-muted-foreground">{role.user_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(role.role)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(role.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedRole(role);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur perdra les permissions associées à ce rôle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground">
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
