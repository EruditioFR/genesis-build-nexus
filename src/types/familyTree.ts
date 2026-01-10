// Types for the Family Tree module

export interface FamilyTree {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  root_person_id?: string | null;
  visibility: 'private' | 'family' | 'public';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Computed fields
  persons_count?: number;
  generations_count?: number;
}

export interface FamilyPerson {
  id: string;
  tree_id: string;
  first_names: string;
  last_name: string;
  maiden_name?: string | null;
  gender?: 'male' | 'female' | 'other' | 'unknown' | null;
  birth_date?: string | null;
  birth_date_precision?: 'exact' | 'month' | 'year' | 'circa' | 'unknown';
  birth_place?: string | null;
  birth_place_lat?: number | null;
  birth_place_lng?: number | null;
  death_date?: string | null;
  death_date_precision?: 'exact' | 'month' | 'year' | 'circa' | 'unknown';
  death_place?: string | null;
  death_place_lat?: number | null;
  death_place_lng?: number | null;
  burial_date?: string | null;
  burial_place?: string | null;
  is_alive: boolean;
  profile_photo_url?: string | null;
  occupation?: string | null;
  residences?: Array<{ place: string; from?: string; to?: string }>;
  nationality?: string | null;
  biography?: string | null;
  privacy_level: 'private' | 'family' | 'public';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentChildRelationship {
  id: string;
  parent_id: string;
  child_id: string;
  union_id?: string | null;
  relationship_type: 'biological' | 'adopted' | 'step' | 'foster';
  birth_order?: number | null;
  created_at: string;
}

export interface FamilyUnion {
  id: string;
  person1_id: string;
  person2_id: string;
  union_type: 'marriage' | 'civil_union' | 'partnership' | 'engagement' | 'other';
  start_date?: string | null;
  start_place?: string | null;
  end_date?: string | null;
  end_reason?: 'death' | 'divorce' | 'separation' | 'annulment' | null;
  is_current: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonMedia {
  id: string;
  person_id: string;
  media_type: 'photo' | 'document' | 'audio' | 'video';
  file_url: string;
  file_size_bytes?: number | null;
  caption?: string | null;
  date_taken?: string | null;
  is_profile_photo: boolean;
  display_order: number;
  uploaded_by?: string | null;
  created_at: string;
}

export interface CapsulePersonLink {
  id: string;
  capsule_id: string;
  person_id: string;
  created_at: string;
}

// Extended types for tree visualization
export interface PersonNode extends FamilyPerson {
  parents?: PersonNode[];
  children?: PersonNode[];
  spouses?: PersonNode[];
  unions?: FamilyUnion[];
  capsules_count?: number;
  photos_count?: number;
  x?: number;
  y?: number;
  generation?: number;
}

export interface TreeStatistics {
  totalPersons: number;
  livingPersons: number;
  deceasedPersons: number;
  generationsCount: number;
  completenessScore: number;
  withPhoto: number;
  withBiography: number;
}

export type TreeViewMode = 'descendant' | 'ascendant' | 'hourglass';
