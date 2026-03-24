import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
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
      toast.error('Erreur lors du chargement des arbres');
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

      toast.success('Arbre créé avec succès');
      return tree as FamilyTree;
    } catch (error) {
      console.error('Error creating tree:', error);
      toast.error('Erreur lors de la création de l\'arbre');
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
      // Step 1: Load tree + persons
      const [treeResult, personsResult] = await Promise.all([
        supabase.from('family_trees').select('*').eq('id', treeId).single(),
        supabase.from('family_persons').select('*').eq('tree_id', treeId),
      ]);

      if (treeResult.error) throw treeResult.error;

      const personIds = (personsResult.data || []).map(p => p.id);

      // Step 2: Load relationships and unions filtered by person IDs
      let filteredRelationships: ParentChildRelationship[] = [];
      let filteredUnions: FamilyUnion[] = [];

      if (personIds.length > 0) {
        const CHUNK_SIZE = 40;
        const chunks: string[][] = [];
        for (let i = 0; i < personIds.length; i += CHUNK_SIZE) {
          chunks.push(personIds.slice(i, i + CHUNK_SIZE));
        }

        const [relResults, unionResults] = await Promise.all([
          Promise.all(chunks.map(chunk => {
            const idList = chunk.join(',');
            return supabase.from('family_parent_child').select('*')
              .or(`parent_id.in.(${idList}),child_id.in.(${idList})`);
          })),
          Promise.all(chunks.map(chunk => {
            const idList = chunk.join(',');
            return supabase.from('family_unions').select('*')
              .or(`person1_id.in.(${idList}),person2_id.in.(${idList})`);
          })),
        ]);

        const personIdSet = new Set(personIds);
        const relSeen = new Set<string>();
        const unionSeen = new Set<string>();

        for (const result of relResults) {
          for (const r of (result.data || []) as ParentChildRelationship[]) {
            if (!relSeen.has(r.id) && personIdSet.has(r.parent_id) && personIdSet.has(r.child_id)) {
              relSeen.add(r.id);
              filteredRelationships.push(r);
            }
          }
        }

        for (const result of unionResults) {
          for (const u of (result.data || []) as FamilyUnion[]) {
            if (!unionSeen.has(u.id) && personIdSet.has(u.person1_id) && personIdSet.has(u.person2_id)) {
              unionSeen.add(u.id);
              filteredUnions.push(u);
            }
          }
        }
      }

      return {
        tree: treeResult.data as FamilyTree,
        persons: (personsResult.data || []) as FamilyPerson[],
        relationships: filteredRelationships,
        unions: filteredUnions
      };
    } catch (error) {
      console.error('Error fetching tree:', error);
      toast.error('Erreur lors du chargement de l\'arbre');
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
      toast.success('Personne ajoutée');
      return data as FamilyPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error('Erreur lors de l\'ajout de la personne');
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
          biography: updates.biography
        })
        .eq('id', personId);

      if (error) throw error;
      toast.success('Personne mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating person:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, []);

  // Delete a person
  const deletePerson = useCallback(async (personId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_persons')
        .delete()
        .eq('id', personId);

      if (error) throw error;
      toast.success('Personne supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting person:', error);
      toast.error('Erreur lors de la suppression');
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
    try {
      const { error } = await supabase
        .from('family_parent_child')
        .insert({
          parent_id: parentId,
          child_id: childId,
          relationship_type: type,
          union_id: unionId || null
        });

      if (error) throw error;
      toast.success('Relation ajoutée');
      return true;
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast.error('Erreur lors de l\'ajout de la relation');
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
      toast.success('Relation mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast.error('Erreur lors de la mise à jour de la relation');
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
      toast.success('Union ajoutée');
      return true;
    } catch (error) {
      console.error('Error adding union:', error);
      toast.error('Erreur lors de l\'ajout de l\'union');
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
      toast.success('Union mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating union:', error);
      toast.error('Erreur lors de la mise à jour de l\'union');
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
      toast.success('Arbre supprimé');
      return true;
    } catch (error) {
      console.error('Error deleting tree:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  // Calculate tree statistics
  const getTreeStatistics = useCallback(async (treeId: string): Promise<TreeStatistics | null> => {
    try {
      const { data: persons, error } = await supabase
        .from('family_persons')
        .select('*')
        .eq('tree_id', treeId);

      if (error) throw error;

      const totalPersons = persons?.length || 0;
      const livingPersons = persons?.filter(p => p.is_alive).length || 0;
      const deceasedPersons = totalPersons - livingPersons;
      const withPhoto = persons?.filter(p => p.profile_photo_url).length || 0;
      const withBiography = persons?.filter(p => p.biography && p.biography.length > 50).length || 0;

      const completenessScore = totalPersons > 0 
        ? Math.round(((withPhoto / totalPersons) * 30) + ((withBiography / totalPersons) * 30) + 40)
        : 0;

      return {
        totalPersons,
        livingPersons,
        deceasedPersons,
        generationsCount: 1, // TODO: Calculate actual generations
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

      toast.success('Personnes fusionnées avec succès');
      return true;
    } catch (error) {
      console.error('Error merging persons:', error);
      toast.error('Erreur lors de la fusion des personnes');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    fetchTrees,
    createTree,
    fetchTree,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    updateRelationship,
    addUnion,
    updateUnion,
    deleteTree,
    getTreeStatistics,
    importFromGedcom,
    mergePersons
  };
}
