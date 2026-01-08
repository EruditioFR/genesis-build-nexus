import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, MoreVertical, Ban, CheckCircle, Trash2, Eye, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_level: string;
  storage_used_mb: number;
  storage_limit_mb: number;
  created_at: string;
  suspended: boolean;
  suspended_reason: string | null;
}

export default function AdminUsers() {
  const { isAdmin } = useAdminAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.display_name?.toLowerCase().includes(searchLower) ||
      user.user_id.toLowerCase().includes(searchLower)
    );
  });

  const handleSuspend = async () => {
    if (!selectedUser || !isAdmin) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_reason: suspendReason || null,
      })
      .eq("id", selectedUser.id);

    if (error) {
      toast.error("Erreur lors de la suspension");
    } else {
      toast.success("Utilisateur suspendu");
      fetchUsers();
    }

    setSuspendDialogOpen(false);
    setSuspendReason("");
    setSelectedUser(null);
  };

  const handleUnsuspend = async (user: Profile) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: false,
        suspended_at: null,
        suspended_reason: null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur lors de la réactivation");
    } else {
      toast.success("Utilisateur réactivé");
      fetchUsers();
    }
  };

  const getSubscriptionBadge = (level: string) => {
    switch (level) {
      case "premium":
        return <Badge className="bg-primary">Premium</Badge>;
      case "legacy":
        return <Badge variant="secondary">Legacy</Badge>;
      default:
        return <Badge variant="outline">Gratuit</Badge>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Gestion des utilisateurs</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredUsers.length} utilisateur(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Stockage</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <div className="h-12 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.suspended ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.display_name || "Sans nom"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.user_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getSubscriptionBadge(user.subscription_level)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.storage_used_mb} / {user.storage_limit_mb} MB
                        </div>
                        <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min((user.storage_used_mb / user.storage_limit_mb) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(user.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {user.suspended ? (
                          <Badge variant="destructive">Suspendu</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Actif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.suspended ? (
                                <DropdownMenuItem onClick={() => handleUnsuspend(user)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Réactiver
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setSuspendDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspendre
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            <DialogDescription>
              L'utilisateur ne pourra plus accéder à son compte.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Raison (optionnel)</label>
            <Textarea
              placeholder="Raison de la suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
