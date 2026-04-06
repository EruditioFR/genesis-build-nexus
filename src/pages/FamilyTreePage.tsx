import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Home, 
  Maximize2,
  Minimize2,
  TreeDeciduous,
  Download,
  Upload,
  Lock,
  List,
  FileText,
  FileDown,
  Focus,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
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
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PersonDetailPanel } from '@/components/familyTree/PersonDetailPanel';
import { AddPersonDialog } from '@/components/familyTree/AddPersonDialog';
import { LinkPersonDialog } from '@/components/familyTree/LinkPersonDialog';
import { PersonsListSheet } from '@/components/familyTree/PersonsListSheet';
import { TreeVisualization, type PersonPositionData } from '@/components/familyTree/TreeVisualization';
import { TreeBreadcrumb } from '@/components/familyTree/TreeBreadcrumb';
import { TreeSearchCommand } from '@/components/familyTree/TreeSearchCommand';
import { GedcomImportDialog } from '@/components/familyTree/GedcomImportDialog';
import { MergePersonsDialog } from '@/components/familyTree/MergePersonsDialog';
import { exportFamilyTreeToPDF } from '@/lib/exportFamilyTree';
import { downloadGedcom } from '@/lib/gedcomExporter';
import { validateFamilyTree } from '@/lib/familyTreeValidation';
import { TreeValidationPanel } from '@/components/familyTree/TreeValidationPanel';
import { BirthPlaceMap } from '@/components/familyTree/BirthPlaceMap';
import { geocodeAndCachePersons } from '@/lib/geocoding';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import NoIndex from '@/components/seo/NoIndex';
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
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('familyTree');
  const { user, signOut, loading: authLoading } = useAuth();
  const { limits, loading: subLoading, isHeritage, tier } = useFeatureAccess();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { fetchTrees, createTree, fetchTree, fetchBranch, addPerson, addRelationship, addUnion, deletePerson, importFromGedcom, mergePersons, loading } = useFamilyTree();

  // Admin viewing another user's tree
  const viewTreeId = searchParams.get('viewTreeId');
  const isAdminViewing = !!viewTreeId && isAdmin;

  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [persons, setPersons] = useState<FamilyPerson[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [unions, setUnions] = useState<FamilyUnion[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [totalPersonsCount, setTotalPersonsCount] = useState(0);
  
  const LARGE_TREE_THRESHOLD = 500;
  const MAX_VISIBLE_GENERATIONS = 2;
  const BRANCH_FETCH_GENERATIONS = 4;
  const [viewMode, setViewMode] = useState<TreeViewMode>('hourglass');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addRelationType, setAddRelationType] = useState<'parent' | 'child' | 'spouse' | 'sibling' | null>(null);
  const [addRelationTarget, setAddRelationTarget] = useState<FamilyPerson | null>(null);

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkSourcePerson, setLinkSourcePerson] = useState<FamilyPerson | null>(null);
  const [showPersonsList, setShowPersonsList] = useState(false);
  const [showGedcomImport, setShowGedcomImport] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeSourcePerson, setMergeSourcePerson] = useState<FamilyPerson | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showBirthPlaceMap, setShowBirthPlaceMap] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [personPositions, setPersonPositions] = useState<PersonPositionData[]>([]);
  const [pendingCenterId, setPendingCenterId] = useState<string | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);

  // Validation issues (computed on demand when panel opens)
  const validationIssues = useMemo(() => {
    if (!showValidationPanel || persons.length === 0) return [];
    return validateFamilyTree(persons, relationships, unions);
  }, [showValidationPanel, persons, relationships, unions]);

  // Pre-build indexed maps for parent/child lookups
  const { parentOfIndex, childOfIndex } = useMemo(() => {
    const parentOf: Map<string, string[]> = new Map();
    const childOf: Map<string, string[]> = new Map();
    for (const r of relationships) {
      if (!parentOf.has(r.parent_id)) parentOf.set(r.parent_id, []);
      parentOf.get(r.parent_id)!.push(r.child_id);
      if (!childOf.has(r.child_id)) childOf.set(r.child_id, []);
      childOf.get(r.child_id)!.push(r.parent_id);
    }
    return { parentOfIndex: parentOf, childOfIndex: childOf };
  }, [relationships]);

  // Pre-build spouse index
  const spouseIndex = useMemo(() => {
    const idx: Map<string, string[]> = new Map();
    for (const u of unions) {
      if (!idx.has(u.person1_id)) idx.set(u.person1_id, []);
      idx.get(u.person1_id)!.push(u.person2_id);
      if (!idx.has(u.person2_id)) idx.set(u.person2_id, []);
      idx.get(u.person2_id)!.push(u.person1_id);
    }
    return idx;
  }, [unions]);

  // Compute active branch using indexed maps (O(branch) instead of O(all relations))
  const activeBranchIds = useMemo(() => {
    if (!selectedPerson || !showDetailPanel) return undefined;
    const ids = new Set<string>();
    ids.add(selectedPerson.id);

    const addAncestors = (personId: string, visited: Set<string>) => {
      const parentIds = childOfIndex.get(personId) || [];
      for (const pid of parentIds) {
        if (!visited.has(pid)) {
          visited.add(pid);
          ids.add(pid);
          addAncestors(pid, visited);
        }
      }
    };

    const addDescendants = (personId: string, visited: Set<string>) => {
      const childIds = parentOfIndex.get(personId) || [];
      for (const cid of childIds) {
        if (!visited.has(cid)) {
          visited.add(cid);
          ids.add(cid);
          addDescendants(cid, visited);
        }
      }
    };

    const spouseIds = spouseIndex.get(selectedPerson.id) || [];
    spouseIds.forEach(id => ids.add(id));

    const visited = new Set<string>([selectedPerson.id]);
    addAncestors(selectedPerson.id, visited);
    addDescendants(selectedPerson.id, visited);

    return ids;
  }, [selectedPerson, showDetailPanel, parentOfIndex, childOfIndex, spouseIndex]);

  const canAccessFamilyTree = limits.canAccessFamilyTree || isAdminViewing;

  // Initialize: fetch or create the single tree
  const initializedRef = useRef(false);

  useEffect(() => {
    if (authLoading || subLoading || adminLoading) return;
    if (!user || !canAccessFamilyTree) {
      setIsInitializing(false);
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      setIsInitializing(true);
      try {
        // Admin viewing a specific tree
        if (isAdminViewing && viewTreeId) {
          const data = await fetchTree(viewTreeId);
          setTree(data.tree);
          // Fetch real total count from DB
          const { count: realCount } = await supabase
            .from('family_persons')
            .select('*', { count: 'exact', head: true })
            .eq('tree_id', viewTreeId);
          setTotalPersonsCount(realCount || data.persons.length);
          if (data.tree?.root_person_id && data.persons.length >= LARGE_TREE_THRESHOLD) {
            // Large tree: load only nearby branch
            const branch = await fetchBranch(viewTreeId, data.tree.root_person_id, BRANCH_FETCH_GENERATIONS);
            setPersons(branch.persons);
            setRelationships(branch.relationships);
            setUnions(branch.unions);
            setViewMode('ascendant');
          } else {
            setPersons(data.persons);
            setRelationships(data.relationships);
            setUnions(data.unions);
            if (data.persons.length >= LARGE_TREE_THRESHOLD) {
              setViewMode('ascendant');
            }
          }
        } else {
          const trees = await fetchTrees();
          
          if (trees.length > 0) {
            const treeId = trees[0].id;
            const data = await fetchTree(treeId);
            setTree(data.tree);
            // Fetch real total count from DB
            const { count: realCount2 } = await supabase
              .from('family_persons')
              .select('*', { count: 'exact', head: true })
              .eq('tree_id', treeId);
            setTotalPersonsCount(realCount2 || data.persons.length);
            if (data.tree?.root_person_id && data.persons.length >= LARGE_TREE_THRESHOLD) {
              // Large tree: load only nearby branch
              const branch = await fetchBranch(treeId, data.tree.root_person_id, BRANCH_FETCH_GENERATIONS);
              setPersons(branch.persons);
              setRelationships(branch.relationships);
              setUnions(branch.unions);
              setViewMode('ascendant');
            } else {
              setPersons(data.persons);
              setRelationships(data.relationships);
              setUnions(data.unions);
              if (data.persons.length >= LARGE_TREE_THRESHOLD) {
                setViewMode('ascendant');
              }
            }
          } else {
            const newTree = await createTree(t('defaultTreeName'), t('defaultTreeDescription'));
            if (newTree) {
              setTree(newTree);
              setPersons([]);
              setRelationships([]);
              setUnions([]);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing tree:', error);
        toast.error(t('errorLoading'));
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, subLoading, adminLoading, user, canAccessFamilyTree, isAdminViewing, viewTreeId]);

  const loadTree = useCallback(async () => {
    if (!tree?.id) return;
    const data = await fetchTree(tree.id);
    
    // Get real count
    const { count: realCount } = await supabase
      .from('family_persons')
      .select('*', { count: 'exact', head: true })
      .eq('tree_id', tree.id);
    setTotalPersonsCount(realCount || data.persons.length);

    // Large tree with root: load branch only
    if (data.tree?.root_person_id && (realCount || data.persons.length) >= LARGE_TREE_THRESHOLD) {
      const branch = await fetchBranch(tree.id, data.tree.root_person_id, BRANCH_FETCH_GENERATIONS);
      setTree(data.tree);
      setPersons(branch.persons);
      setRelationships(branch.relationships);
      setUnions(branch.unions);
      setViewMode('ascendant');
    } else {
      setTree(data.tree);
      setPersons(data.persons);
      setRelationships(data.relationships);
      setUnions(data.unions);
      if (data.persons.length >= LARGE_TREE_THRESHOLD) {
        setViewMode('ascendant');
      }
    }
  }, [tree?.id, fetchTree, fetchBranch]);

  // Background pre-geocoding: runs silently when persons are loaded
  const geocodeRunRef = useRef<string | null>(null);
  useEffect(() => {
    if (persons.length === 0) return;
    const treeId = tree?.id;
    if (!treeId || geocodeRunRef.current === treeId) return;

    const needsGeocode = persons.filter(
      p => (p.birth_place && (p.birth_place_lat == null || p.birth_place_lng == null))
        || (p.death_place && (p.death_place_lat == null || p.death_place_lng == null))
    );
    if (needsGeocode.length === 0) {
      geocodeRunRef.current = treeId;
      return;
    }

    geocodeRunRef.current = treeId;
    // Fire-and-forget background geocoding
    geocodeAndCachePersons(needsGeocode, supabase).catch(() => {});
  }, [persons, tree?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const centerOnPerson = useCallback((personId: string) => {
    setPendingCenterId(personId);
    // Clear after a short delay to allow re-triggering
    setTimeout(() => setPendingCenterId(null), 1000);
  }, []);

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
    async (person: FamilyPerson, secondParentId?: string, unionId?: string, extraLinks?: { parentIds: string[]; childIds: string[] }) => {
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

      // Handle extra links (optional parents/children)
      if (extraLinks) {
        for (const parentId of extraLinks.parentIds) {
          await addRelationship(parentId, person.id);
        }
        for (const childId of extraLinks.childIds) {
          await addRelationship(person.id, childId);
        }
      }
      
      setShowAddDialog(false);
      setAddRelationType(null);
      setAddRelationTarget(null);
      await loadTree();
      centerOnPerson(person.id);
    },
    [tree?.id, addRelationTarget, addRelationType, unions, relationships, addRelationship, addUnion, loadTree, centerOnPerson]
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
    if (targetPersonId === linkSourcePerson.id) return; // Prevent self-link

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

  const handleExpandGhost = useCallback(async (personId: string) => {
    if (!tree?.id) return;
    
    // Mark as expanded immediately for UI feedback
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      next.add(personId);
      return next;
    });

    // Lazy load the branch from database
    setIsLoadingBranch(true);
    try {
      const branch = await fetchBranch(tree.id, personId, BRANCH_FETCH_GENERATIONS);
      
      if (branch.persons.length > 0) {
        // Merge new persons (deduplicate by id)
        setPersons(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPersons = branch.persons.filter(p => !existingIds.has(p.id));
          return newPersons.length > 0 ? [...prev, ...newPersons] : prev;
        });
        
        // Merge new relationships (deduplicate by id)
        setRelationships(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newRels = branch.relationships.filter(r => !existingIds.has(r.id));
          return newRels.length > 0 ? [...prev, ...newRels] : prev;
        });
        
        // Merge new unions (deduplicate by id)
        setUnions(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUnions = branch.unions.filter(u => !existingIds.has(u.id));
          return newUnions.length > 0 ? [...prev, ...newUnions] : prev;
        });
      }
    } catch (error) {
      console.error('Error loading branch:', error);
    } finally {
      setIsLoadingBranch(false);
    }
  }, [tree?.id, fetchBranch]);

  // Compute effective maxVisibleGenerations
  const effectiveMaxGenerations = MAX_VISIBLE_GENERATIONS;

  const [importProgress, setImportProgress] = useState(0);
  const [importDetail, setImportDetail] = useState('');

  const handleGedcomImport = async (gedcomData: GedcomParseResult, skipIds: string[] = []) => {
    if (!tree?.id) {
      throw new Error(t('noTreeSelected'));
    }
    
    const filteredData: GedcomParseResult = {
      ...gedcomData,
      individuals: gedcomData.individuals.filter(ind => !skipIds.includes(ind.id)),
    };
    
    const result = await importFromGedcom(tree.id, filteredData, (percent, detail) => {
      setImportProgress(percent);
      if (detail) setImportDetail(detail);
    });
    
    if (!result.success) {
      throw new Error(result.errorMessage || t('importError'));
    }
    
    if (result.failedCount && result.failedCount > 0) {
      toast.warning(t('importPartial', { created: result.personsCreated, failed: result.failedCount }));
    } else if (result.personsCreated > 0) {
      toast.success(t('importSuccess', { persons: result.personsCreated, relations: result.relationsCreated }));
    }
    
    await loadTree();
    setShowGedcomImport(false);
  };

  const handleSetAsRoot = useCallback(async (personId: string) => {
    if (!tree?.id) return;
    try {
      const { error } = await supabase
        .from('family_trees')
        .update({ root_person_id: personId })
        .eq('id', tree.id);
      if (error) throw error;
      setTree(prev => prev ? { ...prev, root_person_id: personId } : prev);
      setExpandedNodeIds(new Set());
      toast.success(t('detail.rootUpdated', 'Personne racine mise à jour'));
      centerOnPerson(personId);
    } catch (error) {
      console.error('Error setting root person:', error);
      toast.error(t('detail.rootUpdateError', 'Erreur lors de la mise à jour'));
    }
  }, [tree?.id, t, centerOnPerson]);

  const handleMergePerson = (person: FamilyPerson) => {
    setMergeSourcePerson(person);
    setShowMergeDialog(true);
  };

  const handleMergeSubmit = async (keepPersonId: string, mergePersonId: string, fieldsToMerge: string[]) => {
    const success = await mergePersons(keepPersonId, mergePersonId, fieldsToMerge);
    if (success) {
      if (selectedPerson?.id === mergePersonId) {
        const keptPerson = persons.find(p => p.id === keepPersonId);
        if (keptPerson) {
          setSelectedPerson(keptPerson);
        } else {
          setSelectedPerson(null);
          setShowDetailPanel(false);
        }
      }
      setShowMergeDialog(false);
      setMergeSourcePerson(null);
      await loadTree();
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
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Heritage gate
  if (!canAccessFamilyTree) {
    const isPremiumUser = tier === 'premium';
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
            <h1 className="text-3xl font-display font-bold">{t('locked.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('locked.description')}
            </p>
            {isPremiumUser && (
              <p className="text-sm text-muted-foreground">
                {t('locked.premiumNote')}
              </p>
            )}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/premium?tier=heritage')} className="gap-2">
                <TreeDeciduous className="w-5 h-5" />
                {isPremiumUser ? t('locked.upgradeHeritage') : t('locked.discoverHeritage')}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </Button>
            </div>
          </motion.div>
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  // ── Tree visualization (shared between normal and fullscreen) ──────────
  const renderTreeVisualization = () => (
    <TreeVisualization
      persons={persons}
      relationships={relationships}
      unions={unions}
      rootPersonId={tree?.root_person_id || undefined}
      viewMode={viewMode}
      selectedPersonId={selectedPerson?.id}
      highlightedPersonId={highlightedPersonId || undefined}
      activeBranchIds={activeBranchIds}
      onPersonClick={handlePersonClick}
      onExpandGhost={handleExpandGhost}
      onAddPerson={handleAddPerson}
      onPositionsCalculated={setPersonPositions}
      showMinimap={showMinimap}
      onCenterOnPerson={pendingCenterId}
      maxVisibleGenerations={effectiveMaxGenerations}
      expandedNodeIds={expandedNodeIds}
    />
  );

  // ── Detail panel (shared) ──────────────────────────────────────────────
  const renderDetailPanel = () => (
    <AnimatePresence>
      {showDetailPanel && selectedPerson && (
        <motion.div
          initial={{ x: 384, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 384, opacity: 0 }}
          className="fixed top-0 right-0 bottom-0 w-96 bg-card border-l shadow-lg z-50 overflow-auto"
        >
          <PersonDetailPanel
            person={selectedPerson}
            parents={getPersonParents(selectedPerson.id)}
            children={getPersonChildren(selectedPerson.id)}
            spouses={getPersonSpouses(selectedPerson.id)}
            unions={unions.filter(u => u.person1_id === selectedPerson.id || u.person2_id === selectedPerson.id)}
            relationships={relationships}
            allPersons={persons}
            onClose={() => setShowDetailPanel(false)}
            onAddParent={isAdminViewing ? undefined : () => handleAddPerson('parent', selectedPerson)}
            onAddChild={isAdminViewing ? undefined : () => handleAddPerson('child', selectedPerson)}
            onAddSpouse={isAdminViewing ? undefined : () => handleAddPerson('spouse', selectedPerson)}
            onLinkPerson={isAdminViewing ? undefined : () => handleLinkPerson(selectedPerson)}
            onMergePerson={isAdminViewing ? undefined : () => handleMergePerson(selectedPerson)}
            onCenterOnPerson={() => centerOnPerson(selectedPerson.id)}
            onSetAsRoot={() => handleSetAsRoot(selectedPerson.id)}
            onDelete={isAdminViewing ? undefined : () => handleDeletePerson(selectedPerson.id)}
            onUpdate={isAdminViewing ? () => {} : loadTree}
            onPersonClick={handleSearchSelect}
            readOnly={isAdminViewing}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Toolbar controls (shared) ─────────────────────────────────────────
  const renderToolbarControls = (compact = false) => (
    <>
      <div data-tour="tree-search">
        <TreeSearchCommand persons={persons} onPersonSelect={handleSearchSelect} />
      </div>

      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" onClick={() => setShowPersonsList(true)} data-tour="tree-persons-list">
        <List className="w-4 h-4" />
      </Button>

      {persons.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" data-tour="tree-center">
              <Focus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            {persons.slice(0, 50).map((p) => (
              <DropdownMenuItem 
                key={p.id} 
                onClick={() => handleSearchSelect(p)}
                className="gap-2"
              >
                {p.first_names} {p.last_name}
              </DropdownMenuItem>
            ))}
            {persons.length > 50 && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                {t('toolbar.andOthers', { count: persons.length - 50 })}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="hidden sm:flex items-center gap-2 border rounded-lg px-2 py-1">
        <MapIcon className="w-4 h-4 text-muted-foreground" />
        <Switch checked={showMinimap} onCheckedChange={setShowMinimap} className="scale-75" />
      </div>
    </>
  );

  // ── Fullscreen view ───────────────────────────────────────────────────
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
                <h1 className="font-semibold">{tree?.name || t('toolbar.myTree')}</h1>
                <Badge variant="outline" className="text-xs">
                  {t('toolbar.persons', { count: totalPersonsCount || persons.length })}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {renderToolbarControls(true)}
                <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
                  <Minimize2 className="w-4 h-4" />
                  {t('fullscreen.exit')}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="absolute inset-0 top-12">
            {renderTreeVisualization()}
          </div>

          {renderDetailPanel()}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("min-h-screen bg-background flex flex-col w-full max-w-[100vw] overflow-x-hidden", isFullscreen && "overflow-hidden")}>
      {!isFullscreen && user && <DashboardHeader user={user} onSignOut={signOut} />}
      
      {renderFullscreenView()}

      {isAdminViewing && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            👁️ Mode consultation admin — Vue en lecture seule
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/family-trees')}>
            ← Retour à la liste
          </Button>
        </div>
      )}

      {!isFullscreen && (
        <>
          <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 w-full max-w-[100vw]">
            <div className="px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 shrink">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate('/dashboard')}>
                    <Home className="w-4 h-4" />
                  </Button>
                  <TreeDeciduous className="w-5 h-5 sm:w-6 sm:h-6 text-secondary shrink-0" />
                  <div className="min-w-0">
                    <h1 className="font-semibold text-sm sm:text-base truncate">{tree?.name || t('defaultTreeName')}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {totalPersonsCount > persons.length 
                        ? `${totalPersonsCount} ${t('toolbar.loaded', { defaultValue: 'personnes' })} (${persons.length})`
                        : t('toolbar.persons', { count: totalPersonsCount })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide shrink-0">
                  {renderToolbarControls()}

                  <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" onClick={toggleFullscreen}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>

                  {!isAdminViewing && (
                    <>
                      <div data-tour="tree-import-export" className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" title={t('export.title')}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => tree && exportFamilyTreeToPDF({ tree, persons, relationships, unions })}
                              className="gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              {t('export.pdf')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => tree && downloadGedcom({ tree, persons, relationships, unions })}
                              className="gap-2"
                            >
                              <FileDown className="w-4 h-4" />
                              {t('export.gedcom')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                          onClick={() => setShowGedcomImport(true)}
                          title={t('import.gedcom')}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                          onClick={() => setShowValidationPanel(true)}
                          title="Audit de l'arbre"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </Button>
                        {persons.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                            onClick={() => setShowBirthPlaceMap(true)}
                            title={t('map.title')}
                          >
                            <MapPin className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <Button onClick={() => handleAddPerson('child')} size="icon" className="h-8 w-8 sm:h-auto sm:w-auto sm:gap-2 sm:px-3 shrink-0" data-tour="tree-add-person">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('toolbar.add')}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
            {/* Breadcrumb */}
            {selectedPerson && showDetailPanel && (
              <TreeBreadcrumb
                selectedPerson={selectedPerson}
                rootPersonId={tree?.root_person_id || undefined}
                persons={persons}
                relationships={relationships}
                onPersonClick={handleSearchSelect}
              />
            )}

            {/* Tree canvas area */}
            <div className="flex-1 relative min-h-0" style={{ minHeight: '500px' }} data-tour="tree-visualization">
              {persons.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-4 p-8">
                    <TreeDeciduous className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">{t('empty.title')}</h3>
                    <p className="text-muted-foreground max-w-md">
                      {t('empty.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => handleAddPerson('child')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {t('empty.addPerson')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowGedcomImport(true)} className="gap-2">
                        <Upload className="w-4 h-4" />
                        {t('empty.importGedcom')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                renderTreeVisualization()
              )}

              {/* Back to root floating button */}
              {tree?.root_person_id && persons.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 left-4 z-10 gap-2 shadow-lg"
                  onClick={() => {
                    if (tree.root_person_id) {
                      const rootPerson = persons.find(p => p.id === tree.root_person_id);
                      if (rootPerson) handleSearchSelect(rootPerson);
                    }
                  }}
                >
                  <Home className="w-4 h-4" />
                  {t('navigation.backToRoot')}
                </Button>
              )}
            </div>

            {renderDetailPanel()}
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
          allPersons={persons}
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
        existingPersons={persons}
        importProgress={importProgress}
        importDetail={importDetail}
      />

      {mergeSourcePerson && (
        <MergePersonsDialog
          open={showMergeDialog}
          onOpenChange={setShowMergeDialog}
          persons={persons}
          initialPerson={mergeSourcePerson}
          onMerge={handleMergeSubmit}
        />
      )}

      <TreeValidationPanel
        open={showValidationPanel}
        onClose={() => setShowValidationPanel(false)}
        issues={validationIssues}
        onPersonClick={(personId) => {
          const person = persons.find(p => p.id === personId);
          if (person) {
            setSelectedPerson(person);
            setShowDetailPanel(true);
            setShowValidationPanel(false);
          }
        }}
      />

      <BirthPlaceMap
        open={showBirthPlaceMap}
        onOpenChange={setShowBirthPlaceMap}
        persons={persons}
      />
    </div>
  );
}
