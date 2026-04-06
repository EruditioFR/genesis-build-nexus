import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { 
  FamilyTree, 
  FamilyPerson, 
  ParentChildRelationship, 
  FamilyUnion,
  TreeStatistics 
} from '@/types/familyTree';
import type { GedcomParseResult } from '@/lib/gedcomParser';

export function useFamilyTree() {
  const { user } = useAuth();
  const { t } = useTranslation('familyTree');
  const [loading, setLoading] = useState(false);

  // Fetch all trees for current user
  const fetchTrees = useCallback(async (): Promise<FamilyTree[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Get person counts for each tree
      const treesWithCounts = await Promise.all(
        (data || []).map(async (tree) => {
          const { count } = await supabase
            .from('family_persons')
            .select('*', { count: 'exact', head: true })
            .eq('tree_id', tree.id);
          
          return {
            ...tree,
            persons_count: count || 0
          } as FamilyTree;
        })
      );

      return treesWithCounts;
    } catch (error) {
      console.error('Error fetching trees:', error);
      toast.error(t('toast.loadTreesError'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new tree
  const createTree = useCallback(async (
    name: string, 
    description?: string,
    rootPerson?: Partial<FamilyPerson>
  ): Promise<FamilyTree | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      // Create the tree first
      const { data: tree, error: treeError } = await supabase
        .from('family_trees')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          visibility: 'private',
          settings: {}
        })
        .select()
        .single();

      if (treeError) throw treeError;

      // If a root person is provided, create them
      if (rootPerson && tree) {
        const { data: person, error: personError } = await supabase
          .from('family_persons')
          .insert({
            tree_id: tree.id,
            first_names: rootPerson.first_names || '',
            last_name: rootPerson.last_name || '',
            maiden_name: rootPerson.maiden_name,
            gender: rootPerson.gender,
            birth_date: rootPerson.birth_date,
            birth_place: rootPerson.birth_place,
            is_alive: rootPerson.is_alive ?? true,
            profile_photo_url: rootPerson.profile_photo_url,
            created_by: user.id
          })
          .select()
          .single();

        if (personError) throw personError;

        // Update tree with root person
        if (person) {
          await supabase
            .from('family_trees')
            .update({ root_person_id: person.id })
            .eq('id', tree.id);
        }
      }

      toast.success(t('toast.treeCreated'));
      return tree as FamilyTree;
    } catch (error) {
      console.error('Error creating tree:', error);
      toast.error(t('toast.treeCreateError'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch a single tree with all its data
  const fetchTree = useCallback(async (treeId: string): Promise<{
    tree: FamilyTree | null;
    persons: FamilyPerson[];
    relationships: ParentChildRelationship[];
    unions: FamilyUnion[];
  }> => {
    setLoading(true);
    try {
      // Helper to fetch all rows with pagination (PostgREST default limit is 1000)
      async function fetchAllRows<T>(
        queryFn: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>
      ): Promise<T[]> {
        const PAGE_SIZE = 1000;
        const allRows: T[] = [];
        let from = 0;
        let hasMore = true;
        while (hasMore) {
          const { data, error } = await queryFn(from, from + PAGE_SIZE - 1);
          if (error) throw error;
          const rows = data || [];
          allRows.push(...rows);
          hasMore = rows.length === PAGE_SIZE;
          from += PAGE_SIZE;
        }
        return allRows;
      }

      // Step 1: Load tree + all persons (paginated)
      const treeResult = await supabase.from('family_trees').select('*').eq('id', treeId).single();
      if (treeResult.error) throw treeResult.error;

      const allPersons = await fetchAllRows<FamilyPerson>((from, to) =>
        supabase.from('family_persons').select('*').eq('tree_id', treeId).range(from, to) as any
      );

      const personIds = allPersons.map(p => p.id);

      // Step 2: Load relationships and unions via RPC (paginated)
      let filteredRelationships: ParentChildRelationship[] = [];
      let filteredUnions: FamilyUnion[] = [];

      if (personIds.length > 0) {
        const personIdSet = new Set(personIds);
        const [allRels, allUnions] = await Promise.all([
          fetchAllRows<ParentChildRelationship>((from, to) =>
            supabase.rpc('get_tree_relationships', { p_tree_id: treeId }).range(from, to) as any
          ),
          fetchAllRows<FamilyUnion>((from, to) =>
            supabase.rpc('get_tree_unions', { p_tree_id: treeId }).range(from, to) as any
          ),
        ]);

        filteredRelationships = allRels.filter(
          r => personIdSet.has(r.parent_id) && personIdSet.has(r.child_id)
        );
        filteredUnions = allUnions.filter(
          u => personIdSet.has(u.person1_id) && personIdSet.has(u.person2_id)
        );
      }

      return {
        tree: treeResult.data as FamilyTree,
        persons: allPersons as FamilyPerson[],
        relationships: filteredRelationships,
        unions: filteredUnions
      };
    } catch (error) {
      console.error('Error fetching tree:', error);
      toast.error(t('toast.loadTreeError'));
      return { tree: null, persons: [], relationships: [], unions: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a person to a tree
  const addPerson = useCallback(async (
    treeId: string,
    person: Partial<FamilyPerson>
  ): Promise<FamilyPerson | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('family_persons')
        .insert({
          tree_id: treeId,
          first_names: person.first_names || '',
          last_name: person.last_name || '',
          maiden_name: person.maiden_name,
          gender: person.gender,
          birth_date: person.birth_date,
          birth_date_precision: person.birth_date_precision || 'exact',
          birth_place: person.birth_place,
          death_date: person.death_date,
          death_date_precision: person.death_date_precision || 'exact',
          death_place: person.death_place,
          is_alive: person.is_alive ?? true,
          profile_photo_url: person.profile_photo_url,
          occupation: person.occupation,
          nationality: person.nationality,
          biography: person.biography,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(t('toast.personAdded'));
      return data as FamilyPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error(t('toast.personAddError'));
      return null;
    }
  }, [user]);

  // Update a person
  const updatePerson = useCallback(async (
    personId: string,
    updates: Partial<FamilyPerson>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_persons')
        .update({
          first_names: updates.first_names,
          last_name: updates.last_name,
          maiden_name: updates.maiden_name,
          gender: updates.gender,
          birth_date: updates.birth_date,
          birth_date_precision: updates.birth_date_precision,
          birth_place: updates.birth_place,
          death_date: updates.death_date,
          death_date_precision: updates.death_date_precision,
          death_place: updates.death_place,
          is_alive: updates.is_alive,
          profile_photo_url: updates.profile_photo_url,
          occupation: updates.occupation,
          nationality: updates.nationality,
          biography: updates.biography,
          burial_date: updates.burial_date,
          burial_place: updates.burial_place,
          residences: updates.residences
        })
        .eq('id', personId);

      if (error) throw error;
      toast.success(t('toast.personUpdated'));
      return true;
    } catch (error) {
      console.error('Error updating person:', error);
      toast.error(t('toast.personUpdateError'));
      return false;
    }
  }, [t]);

  // Delete a person
  const deletePerson = useCallback(async (personId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_persons')
        .delete()
        .eq('id', personId);

      if (error) throw error;
      toast.success(t('toast.personDeleted'));
      return true;
    } catch (error) {
      console.error('Error deleting person:', error);
      toast.error(t('toast.personDeleteError'));
      return false;
    }
  }, []);

  // Add parent-child relationship
  const addRelationship = useCallback(async (
    parentId: string,
    childId: string,
    type: ParentChildRelationship['relationship_type'] = 'biological',
    unionId?: string | null
  ): Promise<boolean> => {
    // Prevent self-referencing relationships
    if (parentId === childId) {
      console.warn('Cannot create self-referencing relationship', parentId);
      return false;
    }
    try {
      // Check for duplicate relationship
      const { data: existing } = await supabase
        .from('family_parent_child')
        .select('id')
        .eq('parent_id', parentId)
        .eq('child_id', childId)
        .maybeSingle();
      
      if (existing) {
        console.warn('Relationship already exists', parentId, childId);
        return true; // Already exists, not an error
      }

      const { error } = await supabase
        .from('family_parent_child')
        .insert({
          parent_id: parentId,
          child_id: childId,
          relationship_type: type,
          union_id: unionId || null
        });

      if (error) throw error;
      toast.success(t('toast.relationAdded'));
      return true;
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast.error(t('toast.relationAddError'));
      return false;
    }
  }, []);

  // Update parent-child relationship
  const updateRelationship = useCallback(async (
    relationshipId: string,
    updates: Partial<ParentChildRelationship>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_parent_child')
        .update({
          relationship_type: updates.relationship_type,
          birth_order: updates.birth_order,
          union_id: updates.union_id
        })
        .eq('id', relationshipId);

      if (error) throw error;
      toast.success(t('toast.relationUpdated'));
      return true;
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast.error(t('toast.relationUpdateError'));
      return false;
    }
  }, []);

  // Add union
  const addUnion = useCallback(async (
    person1Id: string,
    person2Id: string,
    unionData?: Partial<FamilyUnion>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_unions')
        .insert({
          person1_id: person1Id,
          person2_id: person2Id,
          union_type: unionData?.union_type || 'marriage',
          start_date: unionData?.start_date,
          start_place: unionData?.start_place,
          is_current: unionData?.is_current ?? true
        });

      if (error) throw error;
      toast.success(t('toast.unionAdded'));
      return true;
    } catch (error) {
      console.error('Error adding union:', error);
      toast.error(t('toast.unionAddError'));
      return false;
    }
  }, []);

  // Update union
  const updateUnion = useCallback(async (
    unionId: string,
    updates: Partial<FamilyUnion>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_unions')
        .update({
          union_type: updates.union_type,
          start_date: updates.start_date,
          start_place: updates.start_place,
          end_date: updates.end_date,
          end_reason: updates.end_reason,
          is_current: updates.is_current,
          notes: updates.notes
        })
        .eq('id', unionId);

      if (error) throw error;
      toast.success(t('toast.unionUpdated'));
      return true;
    } catch (error) {
      console.error('Error updating union:', error);
      toast.error(t('toast.unionUpdateError'));
      return false;
    }
  }, []);

  // Delete a tree
  const deleteTree = useCallback(async (treeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_trees')
        .delete()
        .eq('id', treeId);

      if (error) throw error;
      toast.success(t('toast.treeDeleted'));
      return true;
    } catch (error) {
      console.error('Error deleting tree:', error);
      toast.error(t('toast.treeDeleteError'));
      return false;
    }
  }, []);

  // Delete a union
  const deleteUnion = useCallback(async (unionId: string): Promise<boolean> => {
    try {
      // Clear union_id references in parent-child relationships
      await supabase
        .from('family_parent_child')
        .update({ union_id: null })
        .eq('union_id', unionId);

      const { error } = await supabase
        .from('family_unions')
        .delete()
        .eq('id', unionId);

      if (error) throw error;
      toast.success(t('toast.unionDeleted'));
      return true;
    } catch (error) {
      console.error('Error deleting union:', error);
      toast.error(t('toast.unionDeleteError'));
      return false;
    }
  }, [t]);

  // Delete a parent-child relationship
  const deleteRelationship = useCallback(async (relationshipId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_parent_child')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
      toast.success(t('toast.relationDeleted'));
      return true;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      toast.error(t('toast.relationDeleteError'));
      return false;
    }
  }, [t]);

  // Calculate tree statistics
  const getTreeStatistics = useCallback(async (treeId: string): Promise<TreeStatistics | null> => {
    try {
      const [personsResult, relsResult] = await Promise.all([
        supabase.from('family_persons').select('*').eq('tree_id', treeId),
        supabase.rpc('get_tree_relationships', { p_tree_id: treeId })
      ]);

      if (personsResult.error) throw personsResult.error;
      const persons = personsResult.data || [];
      const relationships = relsResult.data || [];

      const totalPersons = persons.length;
      const livingPersons = persons.filter(p => p.is_alive).length;
      const deceasedPersons = totalPersons - livingPersons;
      const withPhoto = persons.filter(p => p.profile_photo_url).length;
      const withBiography = persons.filter(p => p.biography && p.biography.length > 50).length;

      // Calculate generations via BFS from root ancestors
      let generationsCount = 0;
      if (totalPersons > 0 && relationships.length > 0) {
        const childrenOf = new Map<string, string[]>();
        const parentSet = new Set<string>();
        const childSet = new Set<string>();
        for (const r of relationships) {
          if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, []);
          childrenOf.get(r.parent_id)!.push(r.child_id);
          parentSet.add(r.parent_id);
          childSet.add(r.child_id);
        }
        // Root ancestors = parents who are not children
        const roots = Array.from(parentSet).filter(id => !childSet.has(id));
        if (roots.length === 0) roots.push(persons[0].id);

        let maxDepth = 0;
        const visited = new Set<string>();
        const queue: Array<{ id: string; depth: number }> = roots.map(id => ({ id, depth: 0 }));
        while (queue.length > 0) {
          const { id, depth } = queue.shift()!;
          if (visited.has(id)) continue;
          visited.add(id);
          if (depth > maxDepth) maxDepth = depth;
          for (const childId of childrenOf.get(id) || []) {
            if (!visited.has(childId)) queue.push({ id: childId, depth: depth + 1 });
          }
        }
        generationsCount = maxDepth + 1;
      } else {
        generationsCount = totalPersons > 0 ? 1 : 0;
      }

      const completenessScore = totalPersons > 0 
        ? Math.round(((withPhoto / totalPersons) * 30) + ((withBiography / totalPersons) * 30) + 40)
        : 0;

      return {
        totalPersons,
        livingPersons,
        deceasedPersons,
        generationsCount,
        completenessScore,
        withPhoto,
        withBiography
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return null;
    }
  }, []);

  // Import from GEDCOM (batch mode)
  const importFromGedcom = useCallback(async (
    treeId: string,
    gedcomData: GedcomParseResult,
    onProgress?: (percent: number, detail?: string) => void
  ): Promise<{ success: boolean; personsCreated: number; relationsCreated: number; failedCount?: number; errorMessage?: string }> => {
    if (!user) return { success: false, personsCreated: 0, relationsCreated: 0, errorMessage: 'Utilisateur non connecté' };

    setLoading(true);
    try {
      const gedcomToDbId: Record<string, string> = {};
      let personsCreated = 0;
      let relationsCreated = 0;
      let failedCount = 0;
      const insertErrors: Array<{ name: string; error: string }> = [];

      // Phase 1: Create persons in batches (0-60%)
      const individuals = gedcomData.individuals;
      // Adaptive batch size: larger batches for big imports
      const BATCH_SIZE = individuals.length > 1000 ? 100 : 50;
      for (let i = 0; i < individuals.length; i += BATCH_SIZE) {
        const batch = individuals.slice(i, i + BATCH_SIZE);
        const rows = batch.map(individual => ({
          tree_id: treeId,
          first_names: individual.firstName || 'Inconnu',
          last_name: individual.lastName || '',
          maiden_name: individual.maidenName || null,
          gender: individual.gender || null,
          birth_date: individual.birthDate || null,
          birth_date_precision: 'exact',
          birth_place: individual.birthPlace || null,
          death_date: individual.deathDate || null,
          death_date_precision: individual.deathDate ? 'exact' : null,
          death_place: individual.deathPlace || null,
          occupation: individual.occupation || null,
          biography: individual.notes || null,
          is_alive: !individual.deathDate && !individual.isDeceased,
          privacy_level: 'private',
          created_by: user.id,
        }));

        const { data: created, error } = await supabase
          .from('family_persons')
          .insert(rows)
          .select('id');

        if (error) {
          console.error('Batch insert error:', error);
          failedCount += batch.length;
          if (insertErrors.length < 3) {
            insertErrors.push({ name: `Lot ${Math.floor(i / BATCH_SIZE) + 1}`, error: error.message });
          }
        } else if (created) {
          created.forEach((person, idx) => {
            gedcomToDbId[batch[idx].id] = person.id;
            personsCreated++;
          });
        }

        const percent = Math.round(((i + batch.length) / individuals.length) * 60);
        onProgress?.(percent, `${personsCreated}/${individuals.length} personnes`);
      }

      // Check if all insertions failed
      if (personsCreated === 0 && individuals.length > 0) {
        const errorDetails = insertErrors.length > 0 
          ? `Exemples d'erreurs: ${insertErrors.map(e => `${e.name}: ${e.error}`).join('; ')}`
          : 'Erreur inconnue lors de l\'insertion';
        
        setLoading(false);
        return { 
          success: false, personsCreated: 0, relationsCreated: 0, failedCount,
          errorMessage: `Aucune personne n'a pu être importée (${failedCount} échec(s)). ${errorDetails}`,
        };
      }

      // Phase 2: Create unions in batches (60-75%)
      const unionRows: Array<{
        person1_id: string; person2_id: string; union_type: string;
        start_date: string | null; start_place: string | null;
        end_date: string | null; end_reason: string | null; is_current: boolean;
      }> = [];
      // Track which family index maps to which union for parent-child linking
      const familyUnionMap: Record<number, string | null> = {};

      for (let fi = 0; fi < gedcomData.families.length; fi++) {
        const family = gedcomData.families[fi];
        const husband = family.husbandId ? gedcomToDbId[family.husbandId] : undefined;
        const wife = family.wifeId ? gedcomToDbId[family.wifeId] : undefined;
        familyUnionMap[fi] = null;

        if (husband && wife) {
          unionRows.push({
            person1_id: husband, person2_id: wife, union_type: 'marriage',
            start_date: family.marriageDate || null, start_place: family.marriagePlace || null,
            end_date: family.divorceDate || null,
            end_reason: family.divorceDate ? 'divorce' : null,
            is_current: !family.divorceDate,
          });
        }
      }

      // Insert unions in batches
      const insertedUnionIds: string[] = [];
      for (let i = 0; i < unionRows.length; i += BATCH_SIZE) {
        const batch = unionRows.slice(i, i + BATCH_SIZE);
        const { data: created, error } = await supabase
          .from('family_unions')
          .insert(batch)
          .select('id');

        if (!error && created) {
          created.forEach(u => insertedUnionIds.push(u.id));
          relationsCreated += created.length;
        }
      }

      // Map union IDs back to families
      let unionIdx = 0;
      for (let fi = 0; fi < gedcomData.families.length; fi++) {
        const family = gedcomData.families[fi];
        const husband = family.husbandId ? gedcomToDbId[family.husbandId] : undefined;
        const wife = family.wifeId ? gedcomToDbId[family.wifeId] : undefined;
        if (husband && wife && unionIdx < insertedUnionIds.length) {
          familyUnionMap[fi] = insertedUnionIds[unionIdx];
          unionIdx++;
        }
      }

      onProgress?.(75, 'Unions créées');

      // Phase 3: Create parent-child relationships in batches (75-95%)
      const pcRows: Array<{
        parent_id: string; child_id: string; relationship_type: string; union_id: string | null;
      }> = [];

      for (let fi = 0; fi < gedcomData.families.length; fi++) {
        const family = gedcomData.families[fi];
        const husband = family.husbandId ? gedcomToDbId[family.husbandId] : undefined;
        const wife = family.wifeId ? gedcomToDbId[family.wifeId] : undefined;
        const unionId = familyUnionMap[fi] || null;

        for (const childGedcomId of family.childrenIds) {
          const childDbId = gedcomToDbId[childGedcomId];
          if (!childDbId) continue;

          if (husband) {
            pcRows.push({ parent_id: husband, child_id: childDbId, relationship_type: 'biological', union_id: unionId });
          }
          if (wife) {
            pcRows.push({ parent_id: wife, child_id: childDbId, relationship_type: 'biological', union_id: unionId });
          }
        }
      }

      for (let i = 0; i < pcRows.length; i += BATCH_SIZE) {
        const batch = pcRows.slice(i, i + BATCH_SIZE);
        const { data: created, error } = await supabase
          .from('family_parent_child')
          .insert(batch)
          .select('id');

        if (!error && created) {
          relationsCreated += created.length;
        }

        const percent = 75 + Math.round(((i + batch.length) / Math.max(pcRows.length, 1)) * 20);
        onProgress?.(percent, `Relations...`);
      }

      // Phase 4: Set root_person_id if not already set
      const firstPersonDbId = Object.values(gedcomToDbId)[0];
      if (firstPersonDbId) {
        const { data: currentTree } = await supabase
          .from('family_trees')
          .select('root_person_id')
          .eq('id', treeId)
          .single();

        if (currentTree && !currentTree.root_person_id) {
          await supabase
            .from('family_trees')
            .update({ root_person_id: firstPersonDbId })
            .eq('id', treeId);
        }
      }

      onProgress?.(100, 'Terminé');

      toast.success(`Import réussi : ${personsCreated} personnes importées`);
      return { success: true, personsCreated, relationsCreated, failedCount: failedCount > 0 ? failedCount : undefined };
    } catch (error) {
      console.error('Error importing GEDCOM:', error);
      toast.error('Erreur lors de l\'import GEDCOM');
      return { success: false, personsCreated: 0, relationsCreated: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Merge two persons (keep one, delete the other, transfer relationships)
  const mergePersons = useCallback(async (
    keepPersonId: string,
    mergePersonId: string,
    fieldsToMerge: string[]
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      // Get the person to merge data from
      const { data: mergePerson, error: fetchError } = await supabase
        .from('family_persons')
        .select('*')
        .eq('id', mergePersonId)
        .single();

      if (fetchError || !mergePerson) {
        throw new Error('Could not fetch person to merge');
      }

      // Update the keep person with selected fields from merge person
      if (fieldsToMerge.length > 0) {
        const updates: Record<string, unknown> = {};
        fieldsToMerge.forEach((field) => {
          if (field in mergePerson) {
            updates[field] = mergePerson[field as keyof typeof mergePerson];
          }
        });

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('family_persons')
            .update(updates)
            .eq('id', keepPersonId);

          if (updateError) {
            console.error('Error updating person with merged fields:', updateError);
          }
        }
      }

      // Transfer parent-child relationships where merge person is parent
      const { error: parentRelError } = await supabase
        .from('family_parent_child')
        .update({ parent_id: keepPersonId })
        .eq('parent_id', mergePersonId);

      if (parentRelError) {
        console.error('Error transferring parent relationships:', parentRelError);
      }

      // Transfer parent-child relationships where merge person is child
      const { error: childRelError } = await supabase
        .from('family_parent_child')
        .update({ child_id: keepPersonId })
        .eq('child_id', mergePersonId);

      if (childRelError) {
        console.error('Error transferring child relationships:', childRelError);
      }

      // Transfer unions where merge person is person1
      const { error: union1Error } = await supabase
        .from('family_unions')
        .update({ person1_id: keepPersonId })
        .eq('person1_id', mergePersonId);

      if (union1Error) {
        console.error('Error transferring unions (person1):', union1Error);
      }

      // Transfer unions where merge person is person2
      const { error: union2Error } = await supabase
        .from('family_unions')
        .update({ person2_id: keepPersonId })
        .eq('person2_id', mergePersonId);

      if (union2Error) {
        console.error('Error transferring unions (person2):', union2Error);
      }

      // Transfer capsule links
      const { error: capsuleLinkError } = await supabase
        .from('capsule_person_links')
        .update({ person_id: keepPersonId })
        .eq('person_id', mergePersonId);

      if (capsuleLinkError) {
        console.error('Error transferring capsule links:', capsuleLinkError);
      }

      // Delete duplicate relationships that may have been created
      // (e.g., if both persons were already linked to the same person)
      // This is handled by unique constraints in the database

      // Finally, delete the merged person
      const { error: deleteError } = await supabase
        .from('family_persons')
        .delete()
        .eq('id', mergePersonId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success(t('toast.merged'));
      return true;
    } catch (error) {
      console.error('Error merging persons:', error);
      toast.error(t('toast.mergeError'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch a branch around a specific person (lazy loading for large trees)
  const fetchBranch = useCallback(async (
    treeId: string,
    centerPersonId: string,
    maxGenerations: number = 4
  ): Promise<{
    persons: FamilyPerson[];
    relationships: ParentChildRelationship[];
    unions: FamilyUnion[];
  }> => {
    try {
      // Fetch persons within N generations of center person
      const { data: branchPersons, error: personsError } = await supabase
        .rpc('get_branch_persons', {
          p_tree_id: treeId,
          p_center_person_id: centerPersonId,
          p_max_generations: maxGenerations,
        });

      if (personsError) throw personsError;

      const persons = (branchPersons || []) as FamilyPerson[];
      const personIdSet = new Set(persons.map(p => p.id));

      if (persons.length === 0) {
        return { persons: [], relationships: [], unions: [] };
      }

      // Fetch relationships and unions for this tree with pagination, then filter to branch
      const PAGE_SIZE = 1000;
      async function fetchAllRowsRpc<T>(
        rpcFn: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>
      ): Promise<T[]> {
        const allRows: T[] = [];
        let from = 0;
        let hasMore = true;
        while (hasMore) {
          const { data, error } = await rpcFn(from, from + PAGE_SIZE - 1);
          if (error) throw error;
          const rows = data || [];
          allRows.push(...rows);
          hasMore = rows.length === PAGE_SIZE;
          from += PAGE_SIZE;
        }
        return allRows;
      }

      const [allRels, allUnions] = await Promise.all([
        fetchAllRowsRpc<ParentChildRelationship>((from, to) =>
          supabase.rpc('get_tree_relationships', { p_tree_id: treeId }).range(from, to) as any
        ),
        fetchAllRowsRpc<FamilyUnion>((from, to) =>
          supabase.rpc('get_tree_unions', { p_tree_id: treeId }).range(from, to) as any
        ),
      ]);

      const relationships = allRels.filter(
        r => personIdSet.has(r.parent_id) && personIdSet.has(r.child_id)
      );
      const unions = allUnions.filter(
        u => personIdSet.has(u.person1_id) && personIdSet.has(u.person2_id)
      );

      return { persons, relationships, unions };
    } catch (error) {
      console.error('Error fetching branch:', error);
      return { persons: [], relationships: [], unions: [] };
    }
  }, []);

  return {
    loading,
    fetchTrees,
    createTree,
    fetchTree,
    fetchBranch,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    updateRelationship,
    deleteRelationship,
    addUnion,
    updateUnion,
    deleteUnion,
    deleteTree,
    getTreeStatistics,
    importFromGedcom,
    mergePersons
  };
}
