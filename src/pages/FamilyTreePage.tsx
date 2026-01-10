import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TreeDeciduous, Users, Calendar, MoreVertical, Trash2, Edit, Share2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { CreateTreeDialog } from '@/components/familyTree/CreateTreeDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FamilyTree } from '@/types/familyTree';

export default function FamilyTreePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscribed, tier } = useSubscription();
  const { fetchTrees, deleteTree, loading } = useFamilyTree();
  
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<string | null>(null);

  // Check premium access
  const isPremium = subscribed && (tier === 'premium' || tier === 'heritage');

  useEffect(() => {
    if (user && isPremium) {
      loadTrees();
    }
  }, [user, isPremium]);

  const loadTrees = async () => {
    const data = await fetchTrees();
    setTrees(data);
  };

  const handleDeleteTree = async () => {
    if (!treeToDelete) return;
    const success = await deleteTree(treeToDelete);
    if (success) {
      setTrees(trees.filter(t => t.id !== treeToDelete));
    }
    setTreeToDelete(null);
  };

  const handleTreeCreated = (tree: FamilyTree) => {
    setTrees([tree, ...trees]);
    setShowCreateDialog(false);
    navigate(`/family-tree/${tree.id}`);
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          user={user} 
          profile={null} 
          onSignOut={signOut} 
        />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
              <Lock className="w-12 h-12 text-secondary" />
            </div>
            <h1 className="text-3xl font-display font-bold">
              Arbre Généalogique
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Créez et explorez l'histoire de votre famille avec notre module d'arbre généalogique interactif. 
              Cette fonctionnalité est réservée aux abonnés Premium.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/premium')}
                className="gap-2"
              >
                <TreeDeciduous className="w-5 h-5" />
                Passer Premium pour débloquer
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={user} 
        profile={null} 
        onSignOut={signOut} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <TreeDeciduous className="w-8 h-8 text-secondary" />
                Mes Arbres Généalogiques
              </h1>
              <p className="text-muted-foreground mt-1">
                Construisez et explorez l'histoire de votre famille
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un arbre
            </Button>
          </div>

          {/* Trees grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <TreeDeciduous className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Aucun arbre généalogique
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Commencez à construire l'histoire de votre famille en créant votre premier arbre généalogique.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer mon premier arbre
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trees.map((tree) => (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle 
                          className="text-lg flex items-center gap-2"
                          onClick={() => navigate(`/family-tree/${tree.id}`)}
                        >
                          <TreeDeciduous className="w-5 h-5 text-secondary" />
                          {tree.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/family-tree/${tree.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setTreeToDelete(tree.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {tree.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tree.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent 
                      className="pt-4"
                      onClick={() => navigate(`/family-tree/${tree.id}`)}
                    >
                      {/* Tree preview placeholder */}
                      <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
                        <TreeDeciduous className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tree.persons_count || 0} personnes
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(tree.updated_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Tree Dialog */}
      <CreateTreeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTreeCreated={handleTreeCreated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!treeToDelete} onOpenChange={() => setTreeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet arbre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les personnes et relations de cet arbre seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTree} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
