import { useState, useEffect } from 'react';
import { Link2, X, Search, Package, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FamilyPerson } from '@/types/familyTree';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Capsule {
  id: string;
  title: string;
  description: string | null;
  capsule_type: string;
  status: string;
  created_at: string;
  thumbnail_url: string | null;
}

interface LinkedCapsule extends Capsule {
  link_id: string;
}

interface LinkCapsuleDialogProps {
  person: FamilyPerson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked: () => void;
  linkedCapsuleIds: string[];
}

export function LinkCapsuleDialog({ 
  person, 
  open, 
  onOpenChange, 
  onLinked,
  linkedCapsuleIds 
}: LinkCapsuleDialogProps) {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      fetchCapsules();
    }
  }, [open]);

  const fetchCapsules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('id, title, description, capsule_type, status, created_at, thumbnail_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error) {
      console.error('Error fetching capsules:', error);
      toast.error('Erreur lors du chargement des capsules');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (capsuleId: string) => {
    setLinking(capsuleId);
    try {
      const { error } = await supabase
        .from('capsule_person_links')
        .insert({
          capsule_id: capsuleId,
          person_id: person.id
        });

      if (error) throw error;
      
      toast.success('Capsule liée avec succès');
      onLinked();
    } catch (error) {
      console.error('Error linking capsule:', error);
      toast.error('Erreur lors de la liaison');
    } finally {
      setLinking(null);
    }
  };

  const filteredCapsules = capsules.filter(capsule => 
    !linkedCapsuleIds.includes(capsule.id) &&
    (capsule.title.toLowerCase().includes(search.toLowerCase()) ||
     capsule.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const getCapsuleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: 'Texte',
      photo: 'Photo',
      video: 'Vidéo',
      audio: 'Audio',
      mixed: 'Mixte'
    };
    return types[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Lier une capsule
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une capsule à lier à {person.first_names} {person.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une capsule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCapsules.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search ? 'Aucune capsule trouvée' : 'Aucune capsule disponible'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredCapsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {capsule.thumbnail_url ? (
                      <img
                        src={capsule.thumbnail_url}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{capsule.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCapsuleTypeLabel(capsule.capsule_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(capsule.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLink(capsule.id)}
                      disabled={linking === capsule.id}
                    >
                      {linking === capsule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PersonCapsulesListProps {
  person: FamilyPerson;
  onUpdate: () => void;
}

export function PersonCapsulesList({ person, onUpdate }: PersonCapsulesListProps) {
  const [linkedCapsules, setLinkedCapsules] = useState<LinkedCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkedCapsules();
  }, [person.id]);

  const fetchLinkedCapsules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('capsule_person_links')
        .select(`
          id,
          capsule_id,
          capsules (
            id,
            title,
            description,
            capsule_type,
            status,
            created_at,
            thumbnail_url
          )
        `)
        .eq('person_id', person.id);

      if (error) throw error;

      const capsules: LinkedCapsule[] = (data || [])
        .filter(link => link.capsules)
        .map(link => ({
          ...link.capsules as Capsule,
          link_id: link.id
        }));

      setLinkedCapsules(capsules);
    } catch (error) {
      console.error('Error fetching linked capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (linkId: string) => {
    setUnlinking(linkId);
    try {
      const { error } = await supabase
        .from('capsule_person_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      
      toast.success('Capsule déliée');
      fetchLinkedCapsules();
      onUpdate();
    } catch (error) {
      console.error('Error unlinking capsule:', error);
      toast.error('Erreur lors de la suppression du lien');
    } finally {
      setUnlinking(null);
    }
  };

  const getCapsuleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: 'Texte',
      photo: 'Photo',
      video: 'Vidéo',
      audio: 'Audio',
      mixed: 'Mixte'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {linkedCapsules.length > 0 ? (
        <div className="space-y-2">
          {linkedCapsules.map((capsule) => (
            <div
              key={capsule.link_id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {capsule.thumbnail_url ? (
                <img
                  src={capsule.thumbnail_url}
                  alt=""
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{capsule.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {getCapsuleTypeLabel(capsule.capsule_type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(capsule.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleUnlink(capsule.link_id)}
                disabled={unlinking === capsule.link_id}
              >
                {unlinking === capsule.link_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune capsule liée à cette personne
          </p>
        </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2"
        onClick={() => setShowLinkDialog(true)}
      >
        <Link2 className="w-4 h-4" />
        Lier une capsule
      </Button>

      <LinkCapsuleDialog
        person={person}
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onLinked={() => {
          fetchLinkedCapsules();
          onUpdate();
        }}
        linkedCapsuleIds={linkedCapsules.map(c => c.id)}
      />
    </div>
  );
}
