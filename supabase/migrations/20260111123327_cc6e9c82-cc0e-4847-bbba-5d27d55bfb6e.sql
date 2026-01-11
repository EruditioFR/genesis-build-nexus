-- Table categories (catégories standards et personnalisées)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  description_short TEXT NOT NULL,
  description_long TEXT,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,
  order_index INTEGER NOT NULL,
  is_standard BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_user ON categories(user_id);

-- Catégories standards (8 catégories MVP)
INSERT INTO categories (slug, name_fr, description_short, description_long, icon, color, order_index, is_standard, user_id)
VALUES
  ('famille-proches', 'Famille & Proches', 'Vos relations, anecdotes familiales, portraits de vos proches', 'Capturez les moments précieux avec votre famille : portraits de vos parents, grands-parents, enfants et petits-enfants, anecdotes familiales, souvenirs d''enfance, réunions de famille et célébrations.', '👨‍👩‍👧‍👦', '#E67E5C', 1, true, NULL),
  ('savoirs-traditions', 'Savoirs & Traditions', 'Recettes, savoir-faire artisanaux, traditions à transmettre', 'Transmettez vos savoirs précieux : recettes de famille, secrets de cuisine, techniques artisanales, remèdes de grand-mère, rituels et coutumes familiales.', '🍳', '#D4AF37', 2, true, NULL),
  ('histoires-vecues', 'Histoires Vécues', 'Anecdotes drôles, moments marquants, petites histoires du quotidien', 'Racontez les histoires qui font de vous qui vous êtes : anecdotes drôles ou embarrassantes, rencontres inattendues, coïncidences étonnantes.', '😊', '#FF9800', 3, true, NULL),
  ('vie-professionnelle', 'Vie Professionnelle', 'Votre parcours professionnel, carrière, collègues mémorables', 'Documentez votre vie professionnelle : premier emploi, évolution de carrière, métiers exercés, collègues et mentors importants.', '💼', '#2196F3', 4, true, NULL),
  ('amour-relations', 'Amour & Relations', 'Histoires d''amour, rencontres, mariages, amitiés profondes', 'Célébrez vos relations importantes : premier amour, rencontre avec votre conjoint(e), demande en mariage, vie de couple, amitiés qui ont compté.', '❤️', '#E91E63', 5, true, NULL),
  ('voyages-lieux', 'Voyages & Lieux', 'Voyages mémorables, lieux de vie, endroits qui vous ont marqué', 'Immortalisez vos aventures géographiques : voyages marquants, expatriation, déménagements, lieux qui ont façonné votre vie.', '🌍', '#4CAF50', 6, true, NULL),
  ('passions-loisirs', 'Passions & Loisirs', 'Vos hobbies, sports, activités artistiques, engagements', 'Partagez ce qui vous passionne : sports pratiqués, arts et créativité, collections, activités associatives.', '🎨', '#9C27B0', 7, true, NULL),
  ('reflexions-messages', 'Réflexions & Messages', 'Valeurs, conseils, lettres à vos proches, sagesse à transmettre', 'Transmettez l''essentiel : vos valeurs et principes de vie, conseils pour les générations futures, lettres personnelles à vos proches.', '💭', '#607D8B', 8, true, NULL);

-- Table sous-catégories (optionnelle)
CREATE TABLE sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sub_categories_category ON sub_categories(category_id);

-- Sous-catégories pour chaque catégorie standard
INSERT INTO sub_categories (category_id, slug, name, order_index)
SELECT c.id, s.slug, s.name, s.order_index
FROM categories c
CROSS JOIN (
  VALUES 
    ('famille-proches', 'enfance-parents', 'Enfance et parents', 1),
    ('famille-proches', 'fratrie', 'Fratrie (frères et sœurs)', 2),
    ('famille-proches', 'mariage-couple', 'Mariage et vie de couple', 3),
    ('famille-proches', 'mes-enfants', 'Mes enfants', 4),
    ('famille-proches', 'petits-enfants', 'Petits-enfants', 5),
    ('famille-proches', 'reunions-fetes', 'Réunions et fêtes familiales', 6),
    ('savoirs-traditions', 'recettes', 'Recettes familiales', 1),
    ('savoirs-traditions', 'savoir-faire', 'Savoir-faire artisanaux', 2),
    ('savoirs-traditions', 'rituels', 'Rituels et coutumes', 3),
    ('savoirs-traditions', 'remedes', 'Remèdes et conseils santé', 4),
    ('histoires-vecues', 'anecdotes-droles', 'Anecdotes drôles', 1),
    ('histoires-vecues', 'moments-embarrassants', 'Moments embarrassants', 2),
    ('histoires-vecues', 'rencontres', 'Rencontres marquantes', 3),
    ('histoires-vecues', 'lecons', 'Leçons apprises', 4),
    ('vie-professionnelle', 'premier-emploi', 'Premier emploi', 1),
    ('vie-professionnelle', 'evolution-carriere', 'Évolution de carrière', 2),
    ('vie-professionnelle', 'collegues-mentors', 'Collègues et mentors', 3),
    ('vie-professionnelle', 'retraite', 'Retraite et nouvelle vie', 4),
    ('amour-relations', 'premier-amour', 'Premier amour', 1),
    ('amour-relations', 'rencontre-conjoint', 'Rencontre avec conjoint(e)', 2),
    ('amour-relations', 'mariage', 'Mariage et célébrations', 3),
    ('amour-relations', 'amities', 'Amitiés importantes', 4),
    ('voyages-lieux', 'voyages-jeunesse', 'Voyages de jeunesse', 1),
    ('voyages-lieux', 'voyages-famille', 'Voyages en famille', 2),
    ('voyages-lieux', 'expatriation', 'Expatriation', 3),
    ('voyages-lieux', 'lieux-marquants', 'Lieux qui vous ont transformé', 4),
    ('passions-loisirs', 'sports', 'Sports et activités physiques', 1),
    ('passions-loisirs', 'arts', 'Arts et créativité', 2),
    ('passions-loisirs', 'collections', 'Collections', 3),
    ('passions-loisirs', 'animaux', 'Animaux de compagnie', 4),
    ('reflexions-messages', 'valeurs', 'Valeurs et principes de vie', 1),
    ('reflexions-messages', 'lettres', 'Lettres à mes proches', 2),
    ('reflexions-messages', 'conseils', 'Conseils aux jeunes', 3),
    ('reflexions-messages', 'gratitudes', 'Gratitudes', 4)
) AS s(cat_slug, slug, name, order_index)
WHERE c.slug = s.cat_slug;

-- Table de liaison capsule-catégories (many-to-many)
CREATE TABLE capsule_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(capsule_id, category_id)
);

CREATE INDEX idx_capsule_categories_capsule ON capsule_categories(capsule_id);
CREATE INDEX idx_capsule_categories_category ON capsule_categories(category_id);
CREATE INDEX idx_capsule_categories_primary ON capsule_categories(is_primary);

-- Trigger pour s'assurer qu'il n'y a qu'une seule catégorie primaire par capsule
CREATE OR REPLACE FUNCTION check_primary_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE capsule_categories
    SET is_primary = false
    WHERE capsule_id = NEW.capsule_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_single_primary_category
BEFORE INSERT OR UPDATE ON capsule_categories
FOR EACH ROW
EXECUTE FUNCTION check_primary_category();

-- RLS pour categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view standard categories"
ON categories FOR SELECT
USING (is_standard = true AND is_active = true);

CREATE POLICY "Users can view their custom categories"
ON categories FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create custom categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_standard = false);

CREATE POLICY "Users can update their custom categories"
ON categories FOR UPDATE
USING (user_id = auth.uid() AND is_standard = false);

CREATE POLICY "Users can delete their custom categories"
ON categories FOR DELETE
USING (user_id = auth.uid() AND is_standard = false);

-- RLS pour sub_categories
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_categories of visible categories"
ON sub_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM categories 
    WHERE categories.id = sub_categories.category_id 
    AND (categories.is_standard = true OR categories.user_id = auth.uid())
  )
);

-- RLS pour capsule_categories
ALTER TABLE capsule_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view capsule categories for their capsules"
ON capsule_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM capsules 
    WHERE capsules.id = capsule_categories.capsule_id 
    AND capsules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add categories to their capsules"
ON capsule_categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM capsules 
    WHERE capsules.id = capsule_categories.capsule_id 
    AND capsules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update categories on their capsules"
ON capsule_categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM capsules 
    WHERE capsules.id = capsule_categories.capsule_id 
    AND capsules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove categories from their capsules"
ON capsule_categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM capsules 
    WHERE capsules.id = capsule_categories.capsule_id 
    AND capsules.user_id = auth.uid()
  )
);

-- Permettre de voir les catégories des capsules partagées
CREATE POLICY "Users can view categories of shared capsules"
ON capsule_categories FOR SELECT
USING (user_can_view_capsule(auth.uid(), capsule_id));