-- ============================================
-- Module Arbre Généalogique - Schéma de base de données
-- ============================================

-- Table des arbres généalogiques
CREATE TABLE public.family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  root_person_id UUID, -- Sera mis à jour après création de la première personne
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'family', 'public')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des personnes
CREATE TABLE public.family_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.family_trees(id) ON DELETE CASCADE,
  
  -- Identité
  first_names VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  maiden_name VARCHAR(255),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  
  -- Dates
  birth_date DATE,
  birth_date_precision VARCHAR(20) DEFAULT 'exact' CHECK (birth_date_precision IN ('exact', 'month', 'year', 'circa', 'unknown')),
  birth_place VARCHAR(500),
  birth_place_lat DECIMAL(10, 8),
  birth_place_lng DECIMAL(11, 8),
  
  death_date DATE,
  death_date_precision VARCHAR(20) DEFAULT 'exact' CHECK (death_date_precision IN ('exact', 'month', 'year', 'circa', 'unknown')),
  death_place VARCHAR(500),
  death_place_lat DECIMAL(10, 8),
  death_place_lng DECIMAL(11, 8),
  
  burial_date DATE,
  burial_place VARCHAR(500),
  
  is_alive BOOLEAN DEFAULT TRUE,
  
  -- Informations biographiques
  profile_photo_url TEXT,
  occupation VARCHAR(255),
  residences JSONB DEFAULT '[]',
  nationality VARCHAR(100),
  biography TEXT,
  
  -- Métadonnées
  privacy_level VARCHAR(50) DEFAULT 'family' CHECK (privacy_level IN ('private', 'family', 'public')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter la contrainte FK pour root_person_id après création de la table persons
ALTER TABLE public.family_trees 
  ADD CONSTRAINT fk_root_person 
  FOREIGN KEY (root_person_id) 
  REFERENCES public.family_persons(id) 
  ON DELETE SET NULL;

-- Table des relations parent-enfant
CREATE TABLE public.family_parent_child (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'biological' CHECK (relationship_type IN ('biological', 'adopted', 'step', 'foster')),
  birth_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(parent_id, child_id)
);

-- Table des unions (mariages, partenariats)
CREATE TABLE public.family_unions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  person2_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  union_type VARCHAR(50) DEFAULT 'marriage' CHECK (union_type IN ('marriage', 'civil_union', 'partnership', 'engagement', 'other')),
  start_date DATE,
  start_place VARCHAR(500),
  end_date DATE,
  end_reason VARCHAR(50) CHECK (end_reason IN ('death', 'divorce', 'separation', 'annulment', NULL)),
  is_current BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des médias liés aux personnes
CREATE TABLE public.family_person_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  media_type VARCHAR(50) CHECK (media_type IN ('photo', 'document', 'audio', 'video')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  caption TEXT,
  date_taken DATE,
  is_profile_photo BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des liens capsules <-> personnes
CREATE TABLE public.capsule_person_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.family_persons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(capsule_id, person_id)
);

-- Index pour performances
CREATE INDEX idx_family_trees_user ON public.family_trees(user_id);
CREATE INDEX idx_family_persons_tree ON public.family_persons(tree_id);
CREATE INDEX idx_family_persons_names ON public.family_persons(first_names, last_name);
CREATE INDEX idx_family_parent_child_parent ON public.family_parent_child(parent_id);
CREATE INDEX idx_family_parent_child_child ON public.family_parent_child(child_id);
CREATE INDEX idx_family_unions_persons ON public.family_unions(person1_id, person2_id);
CREATE INDEX idx_family_person_media_person ON public.family_person_media(person_id);
CREATE INDEX idx_capsule_person_links_capsule ON public.capsule_person_links(capsule_id);
CREATE INDEX idx_capsule_person_links_person ON public.capsule_person_links(person_id);

-- Trigger pour updated_at
CREATE TRIGGER update_family_trees_updated_at
  BEFORE UPDATE ON public.family_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_persons_updated_at
  BEFORE UPDATE ON public.family_persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_unions_updated_at
  BEFORE UPDATE ON public.family_unions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_person_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_person_links ENABLE ROW LEVEL SECURITY;

-- Family Trees policies
CREATE POLICY "Users can view their own trees"
  ON public.family_trees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trees"
  ON public.family_trees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trees"
  ON public.family_trees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trees"
  ON public.family_trees FOR DELETE
  USING (auth.uid() = user_id);

-- Family Persons policies (based on tree ownership)
CREATE POLICY "Users can view persons in their trees"
  ON public.family_persons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.family_trees 
    WHERE family_trees.id = family_persons.tree_id 
    AND family_trees.user_id = auth.uid()
  ));

CREATE POLICY "Users can create persons in their trees"
  ON public.family_persons FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_trees 
    WHERE family_trees.id = family_persons.tree_id 
    AND family_trees.user_id = auth.uid()
  ));

CREATE POLICY "Users can update persons in their trees"
  ON public.family_persons FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.family_trees 
    WHERE family_trees.id = family_persons.tree_id 
    AND family_trees.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete persons in their trees"
  ON public.family_persons FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.family_trees 
    WHERE family_trees.id = family_persons.tree_id 
    AND family_trees.user_id = auth.uid()
  ));

-- Parent-Child relationships policies
CREATE POLICY "Users can view relationships in their trees"
  ON public.family_parent_child FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE (p.id = family_parent_child.parent_id OR p.id = family_parent_child.child_id)
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can create relationships in their trees"
  ON public.family_parent_child FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_parent_child.parent_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update relationships in their trees"
  ON public.family_parent_child FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_parent_child.parent_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete relationships in their trees"
  ON public.family_parent_child FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_parent_child.parent_id
    AND t.user_id = auth.uid()
  ));

-- Unions policies
CREATE POLICY "Users can view unions in their trees"
  ON public.family_unions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE (p.id = family_unions.person1_id OR p.id = family_unions.person2_id)
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can create unions in their trees"
  ON public.family_unions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_unions.person1_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update unions in their trees"
  ON public.family_unions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_unions.person1_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete unions in their trees"
  ON public.family_unions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_unions.person1_id
    AND t.user_id = auth.uid()
  ));

-- Person media policies
CREATE POLICY "Users can view media in their trees"
  ON public.family_person_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_person_media.person_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can create media in their trees"
  ON public.family_person_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_person_media.person_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update media in their trees"
  ON public.family_person_media FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_person_media.person_id
    AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete media in their trees"
  ON public.family_person_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.family_persons p
    JOIN public.family_trees t ON t.id = p.tree_id
    WHERE p.id = family_person_media.person_id
    AND t.user_id = auth.uid()
  ));

-- Capsule-Person links policies
CREATE POLICY "Users can view links for their capsules or persons"
  ON public.capsule_person_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capsules 
      WHERE capsules.id = capsule_person_links.capsule_id 
      AND capsules.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.family_persons p
      JOIN public.family_trees t ON t.id = p.tree_id
      WHERE p.id = capsule_person_links.person_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create links for their capsules"
  ON public.capsule_person_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.capsules 
    WHERE capsules.id = capsule_person_links.capsule_id 
    AND capsules.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete links for their capsules"
  ON public.capsule_person_links FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.capsules 
    WHERE capsules.id = capsule_person_links.capsule_id 
    AND capsules.user_id = auth.uid()
  ));