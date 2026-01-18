import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, MoreVertical, Eye, Trash2, FileText, Image, Video, Music, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Capsule {
  id: string;
  title: string;
  user_id: string;
  capsule_type: string;
  status: string;
  created_at: string;
  description: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  photo: <Image className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  mixed: <Layers className="h-4 w-4" />,
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publiée",
  scheduled: "Programmée",
  archived: "Archivée",
};

export default function AdminCapsules() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCapsules(data);
    }
    setLoading(false);
  };

  const filteredCapsules = capsules.filter((capsule) => {
    const matchesSearch = 
      capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || capsule.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!selectedCapsule || !isAdmin) return;

    const { error } = await supabase
      .from("capsules")
      .delete()
      .eq("id", selectedCapsule.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Souvenir supprimé");
      fetchCapsules();
    }

    setDeleteDialogOpen(false);
    setSelectedCapsule(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publiée</Badge>;
      case "scheduled":
        return <Badge className="bg-amber-500">Programmée</Badge>;
      case "archived":
        return <Badge variant="secondary">Archivée</Badge>;
      default:
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Gestion des souvenirs</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="published">Publiées</SelectItem>
              <SelectItem value="scheduled">Programmées</SelectItem>
              <SelectItem value="archived">Archivées</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredCapsules.length} souvenir(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créée le</TableHead>
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
                ) : filteredCapsules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun souvenir trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCapsules.map((capsule) => (
                    <TableRow key={capsule.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {typeIcons[capsule.capsule_type]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{capsule.title}</p>
                          {capsule.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {capsule.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {capsule.user_id}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(capsule.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(capsule.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/capsules/${capsule.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCapsule(capsule);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <AlertDialogTitle>Supprimer le souvenir ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le souvenir et tous ses médias seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
