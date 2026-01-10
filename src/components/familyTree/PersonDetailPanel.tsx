import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  X, 
  Edit, 
  Trash2, 
  UserPlus, 
  Baby, 
  Heart,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  FileText,
  ChevronRight,
  AlertTriangle,
  Check,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FamilyPerson } from '@/types/familyTree';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { PersonPhotoUpload } from './PersonPhotoUpload';
import { toast } from 'sonner';

interface PersonDetailPanelProps {
  person: FamilyPerson;
  parents: FamilyPerson[];
  children: FamilyPerson[];
  spouses: FamilyPerson[];
  onClose: () => void;
  onAddParent: () => void;
  onAddChild: () => void;
  onAddSpouse: () => void;
  onDelete: () => void;
  onPersonClick: (person: FamilyPerson) => void;
  onUpdate: () => void;
}

export function PersonDetailPanel({
  person,
  parents,
  children,
  spouses,
  onClose,
  onAddParent,
  onAddChild,
  onAddSpouse,
  onDelete,
  onPersonClick,
  onUpdate
}: PersonDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<{
    first_names: string;
    last_name: string;
    maiden_name: string;
    gender: 'male' | 'female' | 'other' | 'unknown' | '';
    birth_date: string;
    birth_place: string;
    is_alive: boolean;
    death_date: string;
    death_place: string;
    occupation: string;
    nationality: string;
    biography: string;
  }>({
    first_names: person.first_names,
    last_name: person.last_name,
    maiden_name: person.maiden_name || '',
    gender: person.gender || '',
    birth_date: person.birth_date || '',
    birth_place: person.birth_place || '',
    is_alive: person.is_alive ?? true,
    death_date: person.death_date || '',
    death_place: person.death_place || '',
    occupation: person.occupation || '',
    nationality: person.nationality || '',
    biography: person.biography || ''
  });

  const { updatePerson } = useFamilyTree();

  const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: fr });
    } catch {
      return date;
    }
  };

  const calculateAge = () => {
    if (!person.birth_date) return null;
    const birth = new Date(person.birth_date);
    const end = person.death_date ? new Date(person.death_date) : new Date();
    const age = Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const age = calculateAge();

  const handleStartEdit = () => {
    setEditData({
      first_names: person.first_names,
      last_name: person.last_name,
      maiden_name: person.maiden_name || '',
      gender: person.gender || '',
      birth_date: person.birth_date || '',
      birth_place: person.birth_place || '',
      is_alive: person.is_alive ?? true,
      death_date: person.death_date || '',
      death_place: person.death_place || '',
      occupation: person.occupation || '',
      nationality: person.nationality || '',
      biography: person.biography || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      first_names: person.first_names,
      last_name: person.last_name,
      maiden_name: person.maiden_name || '',
      gender: person.gender || '',
      birth_date: person.birth_date || '',
      birth_place: person.birth_place || '',
      is_alive: person.is_alive ?? true,
      death_date: person.death_date || '',
      death_place: person.death_place || '',
      occupation: person.occupation || '',
      nationality: person.nationality || '',
      biography: person.biography || ''
    });
  };

  const handleSave = async () => {
    if (!editData.first_names.trim() || !editData.last_name.trim()) {
      toast.error('Le prénom et le nom sont obligatoires');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updatePerson(person.id, {
        first_names: editData.first_names.trim(),
        last_name: editData.last_name.trim(),
        maiden_name: editData.maiden_name.trim() || null,
        gender: editData.gender || null,
        birth_date: editData.birth_date || null,
        birth_place: editData.birth_place.trim() || null,
        is_alive: editData.is_alive,
        death_date: !editData.is_alive ? editData.death_date || null : null,
        death_place: !editData.is_alive ? editData.death_place.trim() || null : null,
        occupation: editData.occupation.trim() || null,
        nationality: editData.nationality.trim() || null,
        biography: editData.biography.trim() || null
      });

      if (success) {
        toast.success('Personne mise à jour avec succès');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const RelatedPersonCard = ({ relatedPerson }: { relatedPerson: FamilyPerson }) => (
    <button
      onClick={() => onPersonClick(relatedPerson)}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={relatedPerson.profile_photo_url || undefined} />
        <AvatarFallback className="text-sm">
          {`${relatedPerson.first_names[0] || ''}${relatedPerson.last_name[0] || ''}`}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {relatedPerson.first_names} {relatedPerson.last_name}
        </p>
        {relatedPerson.birth_date && (
          <p className="text-xs text-muted-foreground">
            {new Date(relatedPerson.birth_date).getFullYear()}
            {!relatedPerson.is_alive && relatedPerson.death_date && 
              ` - ${new Date(relatedPerson.death_date).getFullYear()}`}
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );

  return (
    <div className="w-[400px] border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <PersonPhotoUpload person={person} onUpdate={onUpdate} />
          ) : (
            <Avatar className="w-16 h-16 border-2 border-secondary">
              <AvatarImage src={person.profile_photo_url || undefined} />
              <AvatarFallback className="bg-secondary/20 text-secondary text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editData.first_names}
                  onChange={(e) => setEditData(prev => ({ ...prev, first_names: e.target.value }))}
                  placeholder="Prénom(s)"
                  className="h-8 text-sm"
                />
                <Input
                  value={editData.last_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Nom"
                  className="h-8 text-sm"
                />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">
                  {person.first_names} {person.last_name}
                </h2>
                {person.maiden_name && person.maiden_name !== person.last_name && (
                  <p className="text-sm text-muted-foreground">
                    née {person.maiden_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {!person.is_alive && (
                    <Badge variant="secondary" className="text-xs">Décédé(e)</Badge>
                  )}
                  {age !== null && (
                    <span className="text-xs text-muted-foreground">
                      {person.is_alive ? `${age} ans` : `Décédé(e) à ${age} ans`}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-b flex gap-2">
        {isEditing ? (
          <>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Enregistrer
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <XCircle className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={handleStartEdit}
            >
              <Edit className="w-3 h-3" />
              Modifier
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="overview">Infos</TabsTrigger>
          <TabsTrigger value="relations">Famille</TabsTrigger>
          <TabsTrigger value="capsules">Capsules</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 space-y-4 m-0">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-4">
                {/* Gender & Maiden Name */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Genre</Label>
                  <Select
                    value={editData.gender}
                    onValueChange={(value: 'male' | 'female' | 'other' | 'unknown') => setEditData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Nom de naissance</Label>
                  <Input
                    value={editData.maiden_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, maiden_name: e.target.value }))}
                    placeholder="Nom de jeune fille"
                    className="h-9"
                  />
                </div>

                <Separator />

                {/* Birth info */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Date de naissance</Label>
                  <Input
                    type="date"
                    value={editData.birth_date}
                    onChange={(e) => setEditData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Lieu de naissance</Label>
                  <Input
                    value={editData.birth_place}
                    onChange={(e) => setEditData(prev => ({ ...prev, birth_place: e.target.value }))}
                    placeholder="Ville, Pays"
                    className="h-9"
                  />
                </div>

                <Separator />

                {/* Living status */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">En vie</Label>
                  <Switch
                    checked={editData.is_alive}
                    onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_alive: checked }))}
                  />
                </div>

                {/* Death info - only if not alive */}
                {!editData.is_alive && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Date de décès</Label>
                      <Input
                        type="date"
                        value={editData.death_date}
                        onChange={(e) => setEditData(prev => ({ ...prev, death_date: e.target.value }))}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Lieu de décès</Label>
                      <Input
                        value={editData.death_place}
                        onChange={(e) => setEditData(prev => ({ ...prev, death_place: e.target.value }))}
                        placeholder="Ville, Pays"
                        className="h-9"
                      />
                    </div>
                  </>
                )}

                <Separator />

                {/* Professional info */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Profession</Label>
                  <Input
                    value={editData.occupation}
                    onChange={(e) => setEditData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Métier ou profession"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Nationalité</Label>
                  <Input
                    value={editData.nationality}
                    onChange={(e) => setEditData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="Nationalité"
                    className="h-9"
                  />
                </div>

                <Separator />

                {/* Biography */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Biographie</Label>
                  <Textarea
                    value={editData.biography}
                    onChange={(e) => setEditData(prev => ({ ...prev, biography: e.target.value }))}
                    placeholder="Informations biographiques..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <>
                {/* Dates */}
                <div className="space-y-2">
                  {person.birth_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Naissance</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(person.birth_date)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {person.birth_place && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Lieu de naissance</p>
                        <p className="text-sm text-muted-foreground">{person.birth_place}</p>
                      </div>
                    </div>
                  )}

                  {!person.is_alive && person.death_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Décès</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(person.death_date)}
                          {person.death_place && ` à ${person.death_place}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Professional info */}
                {person.occupation && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Profession</p>
                      <p className="text-sm text-muted-foreground">{person.occupation}</p>
                    </div>
                  </div>
                )}

                {person.nationality && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Nationalité</p>
                      <p className="text-sm text-muted-foreground">{person.nationality}</p>
                    </div>
                  </div>
                )}

                {/* Biography */}
                {person.biography && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Biographie</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {person.biography}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Relations Tab */}
          <TabsContent value="relations" className="p-4 space-y-4 m-0">
            {/* Parents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">Parents</h4>
                <Button variant="ghost" size="sm" onClick={onAddParent} className="h-7 text-xs">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              {parents.length > 0 ? (
                <div className="space-y-1">
                  {parents.map(parent => (
                    <RelatedPersonCard key={parent.id} relatedPerson={parent} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucun parent renseigné</p>
              )}
            </div>

            <Separator />

            {/* Spouses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">Conjoint(s)</h4>
                <Button variant="ghost" size="sm" onClick={onAddSpouse} className="h-7 text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              {spouses.length > 0 ? (
                <div className="space-y-1">
                  {spouses.map(spouse => (
                    <RelatedPersonCard key={spouse.id} relatedPerson={spouse} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucun conjoint renseigné</p>
              )}
            </div>

            <Separator />

            {/* Children */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">Enfants</h4>
                <Button variant="ghost" size="sm" onClick={onAddChild} className="h-7 text-xs">
                  <Baby className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              {children.length > 0 ? (
                <div className="space-y-1">
                  {children.map(child => (
                    <RelatedPersonCard key={child.id} relatedPerson={child} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucun enfant renseigné</p>
              )}
            </div>
          </TabsContent>

          {/* Capsules Tab */}
          <TabsContent value="capsules" className="p-4 m-0">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Les capsules liées à cette personne apparaîtront ici.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Lier une capsule
              </Button>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer cette personne ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {person.first_names} {person.last_name} de l'arbre ? 
              Cette action supprimera également toutes ses relations avec les autres membres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
