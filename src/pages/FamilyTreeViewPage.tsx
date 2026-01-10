import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Maximize2,
  Minimize2,
  TreeDeciduous,
  Users,
  Download,
  X,
  Map,
  Search,
  Link2,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { LinkPersonDialog } from '@/components/familyTree/LinkPersonDialog';
import { PersonsListSheet } from '@/components/familyTree/PersonsListSheet';
import { TreeVisualization, type PersonPositionData } from '@/components/familyTree/TreeVisualization';
import { TreeMinimap } from '@/components/familyTree/TreeMinimap';
import { TreeSearchCommand } from '@/components/familyTree/TreeSearchCommand';
import { exportFamilyTreeToPDF } from '@/lib/exportFamilyTree';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  const { user, signOut, loading: authLoading } = useAuth();
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

  // New dialogs state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkSourcePerson, setLinkSourcePerson] = useState<FamilyPerson | null>(null);
  const [showPersonsList, setShowPersonsList] = useState(false);

  // Fullscreen and minimap states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = useState({ width: 800, height: 600 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [personPositions, setPersonPositions] = useState<PersonPositionData[]>([]);
  const [pendingCenterId, setPendingCenterId] = useState<string | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    if (!treeId) return;
    const data = await fetchTree(treeId);
    setTree(data.tree);
    setPersons(data.persons);
    setRelationships(data.relationships);
    setUnions(data.unions);
  }, [treeId, fetchTree]);

  useEffect(() => {
    if (authLoading) return;

    // Sur refresh, on attend la restauration de session avant d'appeler le backend.
    if (!user) {
      navigate('/login');
      return;
    }

    loadTree();
  }, [authLoading, user, loadTree, navigate]);

  // Track scroll position and viewport size for minimap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition({ x: container.scrollLeft, y: container.scrollTop });
    };

    const handleResize = () => {
      setViewportSize({ width: container.clientWidth, height: container.clientHeight });
      // Estimate content size
      if (container.scrollWidth > 0 && container.scrollHeight > 0) {
        setContentSize({ 
          width: Math.max(container.scrollWidth, 800), 
          height: Math.max(container.scrollHeight, 600) 
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Update content size when persons change
    const observer = new MutationObserver(handleResize);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [persons, isFullscreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleMinimapNavigation = (x: number, y: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ left: x, top: y, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Center on person when positions are available
  const centerOnPerson = useCallback((personId: string) => {
    const container = scrollContainerRef.current;
    if (!container || personPositions.length === 0) {
      // Positions not yet available, set pending
      setPendingCenterId(personId);
      return;
    }

    const position = personPositions.find(p => p.personId === personId);
    if (!position) return;

    // Calculate scroll position to center the person
    const cardWidth = 160;
    const cardHeight = 80;
    const scrollX = (position.x + cardWidth / 2) * zoom - container.clientWidth / 2;
    const scrollY = (position.y + cardHeight / 2) * zoom - container.clientHeight / 2;

    container.scrollTo({
      left: Math.max(0, scrollX),
      top: Math.max(0, scrollY),
      behavior: 'smooth',
    });

    setPendingCenterId(null);
  }, [personPositions, zoom]);

  // Handle pending center request when positions become available
  useEffect(() => {
    if (pendingCenterId && personPositions.length > 0) {
      centerOnPerson(pendingCenterId);
    }
  }, [pendingCenterId, personPositions, centerOnPerson]);

  // Handler for search selection - select, center, and highlight
  const handleSearchSelect = useCallback((person: FamilyPerson) => {
    setSelectedPerson(person);
    setShowDetailPanel(true);
    centerOnPerson(person.id);
    
    // Trigger highlight animation
    setHighlightedPersonId(person.id);
    // Clear highlight after animation completes
    setTimeout(() => {
      setHighlightedPersonId(null);
    }, 1500);
  }, [centerOnPerson]);

  const handleAddPerson = (type: 'parent' | 'child' | 'spouse' | 'sibling', targetPerson?: FamilyPerson) => {
    setAddRelationType(type);
    setAddRelationTarget(targetPerson || null);
    setShowAddDialog(true);
  };

  const handlePersonAdded = async (newPerson: FamilyPerson, secondParentId?: string) => {
    // Add relationship if there's a target
    if (addRelationTarget && addRelationType) {
      if (addRelationType === 'parent') {
        await addRelationship(newPerson.id, addRelationTarget.id);
      } else if (addRelationType === 'child') {
        // Find the union between the two parents
        let unionId: string | null = null;
        if (secondParentId) {
          const union = unions.find(u => 
            (u.person1_id === addRelationTarget.id && u.person2_id === secondParentId) ||
            (u.person1_id === secondParentId && u.person2_id === addRelationTarget.id)
          );
          unionId = union?.id || null;
        }
        
        // Link to first parent (the target) with union reference
        await addRelationship(addRelationTarget.id, newPerson.id, 'biological', unionId);
        // Link to second parent if selected with same union reference
        if (secondParentId) {
          await addRelationship(secondParentId, newPerson.id, 'biological', unionId);
        }
      } else if (addRelationType === 'spouse') {
        await addUnion(addRelationTarget.id, newPerson.id);
      } else if (addRelationType === 'sibling') {
        // For siblings, we need to find the parents and add this person as their child too
        // Keep the same union_id as the sibling
        const parentRelations = relationships.filter(r => r.child_id === addRelationTarget.id);
        for (const rel of parentRelations) {
          await addRelationship(rel.parent_id, newPerson.id, 'biological', rel.union_id);
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

  // Handle linking existing persons
  const handleLinkPerson = (person: FamilyPerson) => {
    setLinkSourcePerson(person);
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = async (targetPersonId: string, relationType: 'parent' | 'child' | 'spouse') => {
    if (!linkSourcePerson) return;

    if (relationType === 'parent') {
      await addRelationship(targetPersonId, linkSourcePerson.id);
    } else if (relationType === 'child') {
      await addRelationship(linkSourcePerson.id, targetPersonId);
    } else if (relationType === 'spouse') {
      await addUnion(linkSourcePerson.id, targetPersonId);
    }

    setShowLinkDialog(false);
    setLinkSourcePerson(null);
    await loadTree();
  };

  // Handle persons list item click
  const handlePersonsListClick = (person: FamilyPerson) => {
    handleSearchSelect(person);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <TreeDeciduous className="w-12 h-12 mx-auto text-secondary animate-pulse" />
          <p className="text-muted-foreground">Chargement de l'arbre...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, l'effet ci-dessus redirige vers /login.
  if (!user) return null;

  if (!tree) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardHeader user={user} onSignOut={signOut} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <TreeDeciduous className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Arbre généalogique introuvable</p>
            <Button onClick={() => navigate('/family-tree')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à mes arbres
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen view
  const renderFullscreenView = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Fullscreen toolbar */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <TreeDeciduous className="w-5 h-5 text-secondary" />
                <h1 className="font-semibold">{tree?.name || 'Arbre'}</h1>
                <Badge variant="outline" className="text-xs">
                  {persons.length} personnes
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <TreeSearchCommand 
                  persons={persons} 
                  onPersonSelect={handleSearchSelect}
                />

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
                    onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
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

                {/* Minimap toggle */}
                <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <Switch
                    checked={showMinimap}
                    onCheckedChange={setShowMinimap}
                    className="scale-75"
                  />
                </div>

                {/* Exit fullscreen */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleFullscreen}
                  className="gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  Quitter
                </Button>
              </div>
            </div>
          </div>

          {/* Fullscreen content */}
          <div 
            ref={scrollContainerRef}
            className="absolute inset-0 top-12 overflow-auto bg-muted/20"
          >
            <motion.div 
              className="min-w-max p-8"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              <TreeVisualization
                persons={persons}
                relationships={relationships}
                unions={unions}
                rootPersonId={tree?.root_person_id || undefined}
                viewMode={viewMode}
                selectedPersonId={selectedPerson?.id}
                highlightedPersonId={highlightedPersonId || undefined}
                onPersonClick={handlePersonClick}
                onAddPerson={handleAddPerson}
                onPositionsCalculated={setPersonPositions}
              />
            </motion.div>

            {/* Minimap */}
            {showMinimap && persons.length > 0 && (
              <TreeMinimap
                persons={persons}
                relationships={relationships}
                unions={unions}
                rootPersonId={tree?.root_person_id || undefined}
                viewportRect={{
                  x: scrollPosition.x,
                  y: scrollPosition.y,
                  width: viewportSize.width,
                  height: viewportSize.height,
                }}
                contentBounds={contentSize}
                onViewportChange={handleMinimapNavigation}
                selectedPersonId={selectedPerson?.id}
              />
            )}
          </div>

          {/* ESC hint */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
            Appuyez sur <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Échap</kbd> pour quitter
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {renderFullscreenView()}
      
      <div className={cn("min-h-screen bg-background flex flex-col", isFullscreen && "hidden")}>
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
                {/* Search */}
                <TreeSearchCommand 
                  persons={persons} 
                  onPersonSelect={handleSearchSelect}
                />

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

                {/* Fullscreen button */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleFullscreen}
                  title="Mode plein écran"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                {/* Export button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={async () => {
                    if (tree && persons.length > 0) {
                      toast.promise(
                        exportFamilyTreeToPDF({
                          tree,
                          persons,
                          relationships,
                          unions,
                          includeDetails: true,
                          includeTree: true,
                        }),
                        {
                          loading: 'Génération du PDF...',
                          success: 'PDF exporté avec succès !',
                          error: 'Erreur lors de l\'export',
                        }
                      );
                    }
                  }}
                  disabled={!tree || persons.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>

                {/* Persons list button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowPersonsList(true)}
                  disabled={persons.length === 0}
                >
                  <List className="w-4 h-4" />
                  Liste
                </Button>

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
          <div 
            ref={!isFullscreen ? scrollContainerRef : undefined}
            className="flex-1 overflow-auto p-4 bg-muted/20 relative"
          >
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
                  highlightedPersonId={highlightedPersonId || undefined}
                  onPersonClick={handlePersonClick}
                  onAddPerson={handleAddPerson}
                  onPositionsCalculated={setPersonPositions}
                />
              )}
            </motion.div>

            {/* Minimap in normal view */}
            {showMinimap && persons.length > 0 && !isFullscreen && (
              <TreeMinimap
                persons={persons}
                relationships={relationships}
                unions={unions}
                rootPersonId={tree?.root_person_id || undefined}
                viewportRect={{
                  x: scrollPosition.x,
                  y: scrollPosition.y,
                  width: viewportSize.width,
                  height: viewportSize.height,
                }}
                contentBounds={contentSize}
                onViewportChange={handleMinimapNavigation}
                selectedPersonId={selectedPerson?.id}
              />
            )}
          </div>

          {/* Detail panel */}
          {showDetailPanel && selectedPerson && (
            <PersonDetailPanel
              person={selectedPerson}
              parents={getPersonParents(selectedPerson.id)}
              children={getPersonChildren(selectedPerson.id)}
              spouses={getPersonSpouses(selectedPerson.id)}
              unions={unions}
              onClose={() => setShowDetailPanel(false)}
              onAddParent={() => handleAddPerson('parent', selectedPerson)}
              onAddChild={() => handleAddPerson('child', selectedPerson)}
              onAddSpouse={() => handleAddPerson('spouse', selectedPerson)}
              onLinkPerson={() => handleLinkPerson(selectedPerson)}
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
          availableSpouses={addRelationTarget ? getPersonSpouses(addRelationTarget.id) : []}
          existingUnions={unions}
        />

        {/* Link Person Dialog */}
        {linkSourcePerson && (
          <LinkPersonDialog
            open={showLinkDialog}
            onOpenChange={setShowLinkDialog}
            sourcePerson={linkSourcePerson}
            availablePersons={persons}
            onLink={handleLinkSubmit}
          />
        )}

        {/* Persons List Sheet */}
        <PersonsListSheet
          open={showPersonsList}
          onOpenChange={setShowPersonsList}
          persons={persons}
          onPersonClick={handlePersonsListClick}
        />
      </div>
    </>
  );
}
