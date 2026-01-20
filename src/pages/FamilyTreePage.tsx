import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Maximize2,
  Minimize2,
  TreeDeciduous,
  Download,
  Upload,
  Map,
  Lock,
  List,
  FileText,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { PersonDetailPanel } from '@/components/familyTree/PersonDetailPanel';
import { AddPersonDialog } from '@/components/familyTree/AddPersonDialog';
import { LinkPersonDialog } from '@/components/familyTree/LinkPersonDialog';
import { PersonsListSheet } from '@/components/familyTree/PersonsListSheet';
import { TreeVisualization, type PersonPositionData } from '@/components/familyTree/TreeVisualization';
import { TreeMinimap } from '@/components/familyTree/TreeMinimap';
import { TreeSearchCommand } from '@/components/familyTree/TreeSearchCommand';
import { GedcomImportDialog } from '@/components/familyTree/GedcomImportDialog';
import { exportFamilyTreeToPDF } from '@/lib/exportFamilyTree';
import { downloadGedcom } from '@/lib/gedcomExporter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  FamilyTree, 
  FamilyPerson, 
  ParentChildRelationship, 
  FamilyUnion,
  TreeViewMode 
} from '@/types/familyTree';
import type { GedcomParseResult } from '@/lib/gedcomParser';

export default function FamilyTreePage() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { subscribed, tier, loading: subLoading } = useSubscription();
  const { fetchTrees, createTree, fetchTree, addPerson, addRelationship, addUnion, deletePerson, importFromGedcom, loading } = useFamilyTree();

  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [persons, setPersons] = useState<FamilyPerson[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [unions, setUnions] = useState<FamilyUnion[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [viewMode, setViewMode] = useState<TreeViewMode>('descendant');
  const [zoom, setZoom] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addRelationType, setAddRelationType] = useState<'parent' | 'child' | 'spouse' | 'sibling' | null>(null);
  const [addRelationTarget, setAddRelationTarget] = useState<FamilyPerson | null>(null);

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkSourcePerson, setLinkSourcePerson] = useState<FamilyPerson | null>(null);
  const [showPersonsList, setShowPersonsList] = useState(false);
  const [showGedcomImport, setShowGedcomImport] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = useState({ width: 800, height: 600 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [personPositions, setPersonPositions] = useState<PersonPositionData[]>([]);
  const [pendingCenterId, setPendingCenterId] = useState<string | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);

  const isPremium = subscribed && (tier === 'premium' || tier === 'heritage');

  // Initialize: fetch or create the single tree
  const initializeTree = useCallback(async () => {
    if (!user || !isPremium) return;
    
    setIsInitializing(true);
    try {
      const trees = await fetchTrees();
      
      if (trees.length > 0) {
        // Use existing tree
        const treeId = trees[0].id;
        const data = await fetchTree(treeId);
        setTree(data.tree);
        setPersons(data.persons);
        setRelationships(data.relationships);
        setUnions(data.unions);
      } else {
        // Create default tree
        const newTree = await createTree('Mon arbre généalogique', 'Mon histoire familiale');
        if (newTree) {
          setTree(newTree);
          setPersons([]);
          setRelationships([]);
          setUnions([]);
        }
      }
    } catch (error) {
      console.error('Error initializing tree:', error);
      toast.error('Erreur lors du chargement de l\'arbre');
    } finally {
      setIsInitializing(false);
    }
  }, [user, isPremium, fetchTrees, fetchTree, createTree]);

  useEffect(() => {
    if (!authLoading && !subLoading && user && isPremium) {
      initializeTree();
    } else if (!authLoading && !subLoading) {
      setIsInitializing(false);
    }
  }, [authLoading, subLoading, user, isPremium, initializeTree]);

  const loadTree = useCallback(async () => {
    if (!tree?.id) return;
    const data = await fetchTree(tree.id);
    setTree(data.tree);
    setPersons(data.persons);
    setRelationships(data.relationships);
    setUnions(data.unions);
  }, [tree?.id, fetchTree]);

  // Track scroll position and viewport size for minimap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition({ x: container.scrollLeft, y: container.scrollTop });
    };

    const handleResize = () => {
      setViewportSize({ width: container.clientWidth, height: container.clientHeight });
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

    const observer = new MutationObserver(handleResize);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [persons, isFullscreen]);

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

  const centerOnPerson = useCallback((personId: string) => {
    const container = scrollContainerRef.current;
    if (!container || personPositions.length === 0) {
      setPendingCenterId(personId);
      return;
    }

    const position = personPositions.find(p => p.personId === personId);
    if (!position) return;

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

  useEffect(() => {
    if (pendingCenterId && personPositions.length > 0) {
      centerOnPerson(pendingCenterId);
    }
  }, [pendingCenterId, personPositions, centerOnPerson]);

  const handleSearchSelect = useCallback((person: FamilyPerson) => {
    setSelectedPerson(person);
    setShowDetailPanel(true);
    centerOnPerson(person.id);
    
    setHighlightedPersonId(person.id);
    setTimeout(() => {
      setHighlightedPersonId(null);
    }, 1500);
  }, [centerOnPerson]);

  const handleAddPerson = (type: 'parent' | 'child' | 'spouse' | 'sibling', targetPerson?: FamilyPerson) => {
    setAddRelationType(type);
    setAddRelationTarget(targetPerson || null);
    setShowAddDialog(true);
  };

  const handlePersonAdded = useCallback(
    async (person: FamilyPerson, secondParentId?: string, unionId?: string) => {
      if (!tree?.id || !person.id) return;

      if (addRelationTarget && addRelationType) {
        if (addRelationType === 'parent') {
          await addRelationship(person.id, addRelationTarget.id);
        } else if (addRelationType === 'child') {
          let finalUnionId: string | null = unionId || null;
          if (!finalUnionId && secondParentId) {
            const union = unions.find(u => 
              (u.person1_id === addRelationTarget.id && u.person2_id === secondParentId) ||
              (u.person1_id === secondParentId && u.person2_id === addRelationTarget.id)
            );
            finalUnionId = union?.id || null;
          }
          
          await addRelationship(addRelationTarget.id, person.id, 'biological', finalUnionId);
          if (secondParentId) {
            await addRelationship(secondParentId, person.id, 'biological', finalUnionId);
          }
        } else if (addRelationType === 'spouse') {
          await addUnion(addRelationTarget.id, person.id);
        } else if (addRelationType === 'sibling') {
          const parentRelations = relationships.filter(r => r.child_id === addRelationTarget.id);
          for (const rel of parentRelations) {
            await addRelationship(rel.parent_id, person.id, 'biological', rel.union_id);
          }
        }
      }
      
      setShowAddDialog(false);
      setAddRelationType(null);
      setAddRelationTarget(null);
      await loadTree();
    },
    [tree?.id, addRelationTarget, addRelationType, unions, relationships, addRelationship, addUnion, loadTree]
  );

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

  const handlePersonsListClick = (person: FamilyPerson) => {
    handleSearchSelect(person);
  };

  const handlePersonClick = (person: FamilyPerson) => {
    setSelectedPerson(person);
    setShowDetailPanel(true);
  };

  const handleGedcomImport = async (gedcomData: GedcomParseResult) => {
    if (!tree?.id) return;
    
    const result = await importFromGedcom(tree.id, gedcomData);
    if (result.success) {
      await loadTree();
      setShowGedcomImport(false);
    }
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

  // Loading state
  if (authLoading || subLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <TreeDeciduous className="w-12 h-12 mx-auto text-secondary animate-pulse" />
          <p className="text-muted-foreground">Chargement de l'arbre...</p>
        </div>
      </div>
    );
  }

  // Premium gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-0">
        <DashboardHeader user={user} onSignOut={signOut} />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
              <Lock className="w-12 h-12 text-secondary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Arbre Généalogique</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Créez et explorez l'histoire de votre famille avec notre module d'arbre généalogique interactif. 
              Cette fonctionnalité est réservée aux abonnés Premium.
            </p>
            <div className="pt-4">
              <Button size="lg" onClick={() => navigate('/premium')} className="gap-2">
                <TreeDeciduous className="w-5 h-5" />
                Passer Premium pour débloquer
              </Button>
            </div>
          </motion.div>
          <MobileBottomNav />
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
          <div className="absolute top-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <TreeDeciduous className="w-5 h-5 text-secondary" />
                <h1 className="font-semibold">{tree?.name || 'Mon arbre'}</h1>
                <Badge variant="outline" className="text-xs">
                  {persons.length} personnes
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <TreeSearchCommand persons={persons} onPersonSelect={handleSearchSelect} />

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

                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(1)}>
                    <Home className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <Switch checked={showMinimap} onCheckedChange={setShowMinimap} className="scale-75" />
                </div>

                <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
                  <Minimize2 className="w-4 h-4" />
                  Quitter
                </Button>
              </div>
            </div>
          </div>

          <div ref={scrollContainerRef} className="absolute inset-0 top-12 overflow-auto bg-muted/20">
            <motion.div 
              className="min-w-max p-8"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
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
          </div>

          {showMinimap && persons.length > 0 && (
            <TreeMinimap
              persons={persons}
              relationships={relationships}
              unions={unions}
              selectedPersonId={selectedPerson?.id}
              viewportRect={{ ...scrollPosition, width: viewportSize.width / zoom, height: viewportSize.height / zoom }}
              contentBounds={contentSize}
              onViewportChange={handleMinimapNavigation}
            />
          )}

          <AnimatePresence>
            {showDetailPanel && selectedPerson && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="absolute top-12 right-0 bottom-0 w-96 bg-card border-l shadow-lg overflow-auto"
              >
                <PersonDetailPanel
                  person={selectedPerson}
                  parents={getPersonParents(selectedPerson.id)}
                  children={getPersonChildren(selectedPerson.id)}
                  spouses={getPersonSpouses(selectedPerson.id)}
                  unions={unions.filter(u => u.person1_id === selectedPerson.id || u.person2_id === selectedPerson.id)}
                  relationships={relationships.filter(r => r.parent_id === selectedPerson.id || r.child_id === selectedPerson.id)}
                  allPersons={persons}
                  onClose={() => setShowDetailPanel(false)}
                  onAddParent={() => handleAddPerson('parent', selectedPerson)}
                  onAddChild={() => handleAddPerson('child', selectedPerson)}
                  onAddSpouse={() => handleAddPerson('spouse', selectedPerson)}
                  onLinkPerson={() => handleLinkPerson(selectedPerson)}
                  onDelete={() => handleDeletePerson(selectedPerson.id)}
                  onUpdate={loadTree}
                  onPersonClick={handleSearchSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", isFullscreen && "overflow-hidden")}>
      {!isFullscreen && <DashboardHeader user={user} onSignOut={signOut} />}
      
      {renderFullscreenView()}

      {!isFullscreen && (
        <>
          {/* Toolbar */}
          <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TreeDeciduous className="w-6 h-6 text-secondary" />
                  <div>
                    <h1 className="font-semibold">{tree?.name || 'Mon arbre généalogique'}</h1>
                    <p className="text-sm text-muted-foreground">{persons.length} personnes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TreeSearchCommand persons={persons} onPersonSelect={handleSearchSelect} />

                  <Button variant="outline" size="sm" onClick={() => setShowPersonsList(true)} className="gap-2">
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </Button>

                  <Select value={viewMode} onValueChange={(v) => setViewMode(v as TreeViewMode)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descendant">Vue descendante</SelectItem>
                      <SelectItem value="ascendant">Vue ascendante</SelectItem>
                      <SelectItem value="hourglass">Vue sablier</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
                      <Home className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" title="Exporter">
                        <Download className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => tree && exportFamilyTreeToPDF({ tree, persons, relationships, unions })}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Exporter en PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => tree && downloadGedcom({ tree, persons, relationships, unions })}
                        className="gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        Exporter en GEDCOM
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowGedcomImport(true)}
                    title="Importer GEDCOM"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>

                  <Button onClick={() => handleAddPerson('child')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Tree visualization */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-auto bg-muted/20 relative"
            >
              {persons.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-4 p-8">
                    <TreeDeciduous className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">Votre arbre est vide</h3>
                    <p className="text-muted-foreground max-w-md">
                      Commencez par ajouter la première personne ou importez un arbre existant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => handleAddPerson('child')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter une personne
                      </Button>
                      <Button variant="outline" onClick={() => setShowGedcomImport(true)} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Importer GEDCOM
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  className="min-w-max p-8"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
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
              )}

              {showMinimap && persons.length > 3 && (
                <TreeMinimap
                  persons={persons}
                  relationships={relationships}
                  unions={unions}
                  selectedPersonId={selectedPerson?.id}
                  viewportRect={{ ...scrollPosition, width: viewportSize.width / zoom, height: viewportSize.height / zoom }}
                  contentBounds={contentSize}
                  onViewportChange={handleMinimapNavigation}
                />
              )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {showDetailPanel && selectedPerson && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 384, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="border-l bg-card overflow-hidden"
                >
                  <div className="w-96 h-full overflow-auto">
                    <PersonDetailPanel
                      person={selectedPerson}
                      parents={getPersonParents(selectedPerson.id)}
                      children={getPersonChildren(selectedPerson.id)}
                      spouses={getPersonSpouses(selectedPerson.id)}
                      unions={unions.filter(u => u.person1_id === selectedPerson.id || u.person2_id === selectedPerson.id)}
                      relationships={relationships.filter(r => r.parent_id === selectedPerson.id || r.child_id === selectedPerson.id)}
                      allPersons={persons}
                      onClose={() => setShowDetailPanel(false)}
                      onAddParent={() => handleAddPerson('parent', selectedPerson)}
                      onAddChild={() => handleAddPerson('child', selectedPerson)}
                      onAddSpouse={() => handleAddPerson('spouse', selectedPerson)}
                      onLinkPerson={() => handleLinkPerson(selectedPerson)}
                      onDelete={() => handleDeletePerson(selectedPerson.id)}
                      onUpdate={loadTree}
                      onPersonClick={handleSearchSelect}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <MobileBottomNav />
        </>
      )}

      {/* Dialogs */}
      {tree && (
        <AddPersonDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          treeId={tree.id}
          relationType={addRelationType}
          targetPerson={addRelationTarget}
          availableSpouses={addRelationTarget ? getPersonSpouses(addRelationTarget.id) : []}
          existingUnions={unions}
          onPersonAdded={handlePersonAdded}
        />
      )}

      {linkSourcePerson && (
        <LinkPersonDialog
          open={showLinkDialog}
          onOpenChange={setShowLinkDialog}
          sourcePerson={linkSourcePerson}
          availablePersons={persons.filter(p => p.id !== linkSourcePerson.id)}
          onLink={handleLinkSubmit}
        />
      )}

      <PersonsListSheet
        open={showPersonsList}
        onOpenChange={setShowPersonsList}
        persons={persons}
        onPersonClick={handlePersonsListClick}
      />

      <GedcomImportDialog
        open={showGedcomImport}
        onOpenChange={setShowGedcomImport}
        onImport={handleGedcomImport}
        existingPersonsCount={persons.length}
      />
    </div>
  );
}