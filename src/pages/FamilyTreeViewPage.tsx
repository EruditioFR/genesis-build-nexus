import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Maximize2,
  TreeDeciduous,
  Users,
  Settings,
  Download,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { PersonDetailPanel } from '@/components/familyTree/PersonDetailPanel';
import { AddPersonDialog } from '@/components/familyTree/AddPersonDialog';
import { TreeVisualization } from '@/components/familyTree/TreeVisualization';
import type { 
  FamilyTree, 
  FamilyPerson, 
  ParentChildRelationship, 
  FamilyUnion,
  TreeViewMode 
} from '@/types/familyTree';

export default function FamilyTreeViewPage() {
  const { id: treeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { fetchTree, addPerson, addRelationship, addUnion, deletePerson, loading } = useFamilyTree();

  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [persons, setPersons] = useState<FamilyPerson[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [unions, setUnions] = useState<FamilyUnion[]>([]);
  
  const [viewMode, setViewMode] = useState<TreeViewMode>('descendant');
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addRelationType, setAddRelationType] = useState<'parent' | 'child' | 'spouse' | 'sibling' | null>(null);
  const [addRelationTarget, setAddRelationTarget] = useState<FamilyPerson | null>(null);

  const loadTree = useCallback(async () => {
    if (!treeId) return;
    const data = await fetchTree(treeId);
    setTree(data.tree);
    setPersons(data.persons);
    setRelationships(data.relationships);
    setUnions(data.unions);
  }, [treeId, fetchTree]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleAddPerson = (type: 'parent' | 'child' | 'spouse' | 'sibling', targetPerson?: FamilyPerson) => {
    setAddRelationType(type);
    setAddRelationTarget(targetPerson || null);
    setShowAddDialog(true);
  };

  const handlePersonAdded = async (newPerson: FamilyPerson) => {
    // Add relationship if there's a target
    if (addRelationTarget && addRelationType) {
      if (addRelationType === 'parent') {
        await addRelationship(newPerson.id, addRelationTarget.id);
      } else if (addRelationType === 'child') {
        await addRelationship(addRelationTarget.id, newPerson.id);
      } else if (addRelationType === 'spouse') {
        await addUnion(addRelationTarget.id, newPerson.id);
      } else if (addRelationType === 'sibling') {
        // For siblings, we need to find the parents and add this person as their child too
        const parentRelations = relationships.filter(r => r.child_id === addRelationTarget.id);
        for (const rel of parentRelations) {
          await addRelationship(rel.parent_id, newPerson.id);
        }
      }
    }
    
    setShowAddDialog(false);
    setAddRelationType(null);
    setAddRelationTarget(null);
    await loadTree();
  };

  const handleDeletePerson = async (personId: string) => {
    const success = await deletePerson(personId);
    if (success) {
      setPersons(persons.filter(p => p.id !== personId));
      if (selectedPerson?.id === personId) {
        setSelectedPerson(null);
        setShowDetailPanel(false);
      }
    }
  };

  const handlePersonClick = (person: FamilyPerson) => {
    setSelectedPerson(person);
    setShowDetailPanel(true);
  };

  const getPersonParents = (personId: string): FamilyPerson[] => {
    const parentIds = relationships.filter(r => r.child_id === personId).map(r => r.parent_id);
    return persons.filter(p => parentIds.includes(p.id));
  };

  const getPersonChildren = (personId: string): FamilyPerson[] => {
    const childIds = relationships.filter(r => r.parent_id === personId).map(r => r.child_id);
    return persons.filter(p => childIds.includes(p.id));
  };

  const getPersonSpouses = (personId: string): FamilyPerson[] => {
    const spouseIds = unions
      .filter(u => u.person1_id === personId || u.person2_id === personId)
      .map(u => u.person1_id === personId ? u.person2_id : u.person1_id);
    return persons.filter(p => spouseIds.includes(p.id));
  };

  if (loading && !tree) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <TreeDeciduous className="w-12 h-12 mx-auto text-secondary animate-pulse" />
          <p className="text-muted-foreground">Chargement de l'arbre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader user={user} onSignOut={signOut} />
      
      {/* Toolbar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/family-tree')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              
              <div className="flex items-center gap-2">
                <TreeDeciduous className="w-5 h-5 text-secondary" />
                <h1 className="font-semibold text-lg">{tree?.name || 'Arbre'}</h1>
                <Badge variant="outline" className="text-xs">
                  {persons.length} personnes
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode selector */}
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as TreeViewMode)}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="descendant">Vue descendante</SelectItem>
                  <SelectItem value="ascendant">Vue ascendante</SelectItem>
                  <SelectItem value="hourglass">Vue sablier</SelectItem>
                </SelectContent>
              </Select>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setZoom(1)}
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>

              {/* Add person button */}
              <Button size="sm" className="gap-2" onClick={() => handleAddPerson('child')}>
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree visualization area */}
        <div className="flex-1 overflow-auto p-4 bg-muted/20">
          <motion.div 
            className="min-w-max"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {persons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Aucune personne</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par ajouter la première personne de votre arbre
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter une personne
                </Button>
              </div>
            ) : (
              <TreeVisualization
                persons={persons}
                relationships={relationships}
                unions={unions}
                rootPersonId={tree?.root_person_id || undefined}
                viewMode={viewMode}
                selectedPersonId={selectedPerson?.id}
                onPersonClick={handlePersonClick}
                onAddPerson={handleAddPerson}
              />
            )}
          </motion.div>
        </div>

        {/* Detail panel */}
        {showDetailPanel && selectedPerson && (
          <PersonDetailPanel
            person={selectedPerson}
            parents={getPersonParents(selectedPerson.id)}
            children={getPersonChildren(selectedPerson.id)}
            spouses={getPersonSpouses(selectedPerson.id)}
            onClose={() => setShowDetailPanel(false)}
            onAddParent={() => handleAddPerson('parent', selectedPerson)}
            onAddChild={() => handleAddPerson('child', selectedPerson)}
            onAddSpouse={() => handleAddPerson('spouse', selectedPerson)}
            onDelete={() => handleDeletePerson(selectedPerson.id)}
            onPersonClick={(p) => {
              setSelectedPerson(p);
            }}
            onUpdate={loadTree}
          />
        )}
      </div>

      {/* Add Person Dialog */}
      <AddPersonDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        treeId={treeId!}
        relationType={addRelationType}
        targetPerson={addRelationTarget}
        onPersonAdded={handlePersonAdded}
      />
    </div>
  );
}
