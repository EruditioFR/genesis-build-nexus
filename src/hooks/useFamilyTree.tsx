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
      const [treeResult, personsResult, relationshipsResult, unionsResult] = await Promise.all([
        supabase.from('family_trees').select('*').eq('id', treeId).single(),
        supabase.from('family_persons').select('*').eq('tree_id', treeId),
        supabase.from('family_parent_child').select('*'),
        supabase.from('family_unions').select('*')
      ]);

      if (treeResult.error) throw treeResult.error;

      // Filter relationships and unions to only those involving persons in this tree
      const personIds = new Set((personsResult.data || []).map(p => p.id));
      
      const filteredRelationships = (relationshipsResult.data || []).filter(
        r => personIds.has(r.parent_id) && personIds.has(r.child_id)
      );
      
      const filteredUnions = (unionsResult.data || []).filter(
        u => personIds.has(u.person1_id) && personIds.has(u.person2_id)
      );

      return {
        tree: treeResult.data as FamilyTree,
        persons: (personsResult.data || []) as FamilyPerson[],
        relationships: filteredRelationships as ParentChildRelationship[],
        unions: filteredUnions as FamilyUnion[]
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

  return {
    loading,
    fetchTrees,
    createTree,
    fetchTree,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    addUnion,
    updateUnion,
    deleteTree,
    getTreeStatistics
  };
}
