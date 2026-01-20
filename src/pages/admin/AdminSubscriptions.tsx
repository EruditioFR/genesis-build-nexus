import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, CreditCard, Check } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_level: string;
  storage_limit_mb: number;
  created_at: string;
}

const subscriptionLevels = [
  { value: "free", label: "Gratuit", storage: 500, color: "bg-muted" },
  { value: "premium", label: "Premium", storage: 10240, color: "bg-primary" },
  { value: "legacy", label: "Legacy", storage: 51200, color: "bg-secondary" },
];

export default function AdminSubscriptions() {
  const { isAdmin } = useAdminAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("subscription_level", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = levelFilter === "all" || user.subscription_level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const handleSubscriptionChange = async (userId: string, profileId: string, newLevel: string) => {
    if (!isAdmin) return;

    setUpdating(profileId);
    
    const newStorageLimit = subscriptionLevels.find((l) => l.value === newLevel)?.storage || 500;

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_level: newLevel as "free" | "premium" | "legacy",
        storage_limit_mb: newStorageLimit,
      })
      .eq("id", profileId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Abonnement mis à jour");
      fetchUsers();
    }

    setUpdating(null);
  };

  const getSubscriptionBadge = (level: string) => {
    const sub = subscriptionLevels.find((l) => l.value === level);
    return (
      <Badge className={sub?.color || "bg-muted"}>
        {sub?.label || level}
      </Badge>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Stats
  const stats = {
    total: users.length,
    free: users.filter((u) => u.subscription_level === "free").length,
    premium: users.filter((u) => u.subscription_level === "premium").length,
    legacy: users.filter((u) => u.subscription_level === "legacy").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Gestion des abonnements</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">{stats.free}</div>
            <p className="text-xs text-muted-foreground">Gratuit</p>
          </CardContent>
        </Card>
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary-foreground">{stats.legacy}</div>
            <p className="text-xs text-muted-foreground">Legacy</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="free">Gratuit</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="legacy">Legacy</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
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
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {filteredUsers.length} utilisateur(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Niveau actuel</TableHead>
                  <TableHead>Stockage</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  {isAdmin && <TableHead>Changer</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <div className="h-12 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.display_name || "Sans nom"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getSubscriptionBadge(user.subscription_level)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{user.storage_limit_mb} MB</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(user.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Select
                            value={user.subscription_level}
                            onValueChange={(value) => handleSubscriptionChange(user.user_id, user.id, value)}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {subscriptionLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
