-- Enum pour le type de contenu des capsules
CREATE TYPE public.capsule_type AS ENUM ('text', 'photo', 'video', 'audio', 'mixed');

-- Enum pour le statut de la capsule
CREATE TYPE public.capsule_status AS ENUM ('draft', 'published', 'scheduled', 'archived');

-- Table des capsules mémorielles
CREATE TABLE public.capsules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    capsule_type public.capsule_type NOT NULL DEFAULT 'text',
    status public.capsule_status NOT NULL DEFAULT 'draft',
    thumbnail_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des cercles de partage
CREATE TABLE public.circles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#1E3A5F',
    icon TEXT DEFAULT 'users',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des membres des cercles
CREATE TABLE public.circle_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT circle_member_identity CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- Table de partage des capsules avec les cercles
CREATE TABLE public.capsule_shares (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(capsule_id, circle_id)
);

-- Table des médias attachés aux capsules
CREATE TABLE public.capsule_medias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes INTEGER,
    position INTEGER DEFAULT 0,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_medias ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier si un utilisateur a accès à une capsule (propriétaire ou membre d'un cercle partagé)
CREATE OR REPLACE FUNCTION public.user_can_view_capsule(_user_id UUID, _capsule_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM capsules WHERE id = _capsule_id AND user_id = _user_id
    )
    OR EXISTS (
        SELECT 1 
        FROM capsule_shares cs
        JOIN circle_members cm ON cs.circle_id = cm.circle_id
        WHERE cs.capsule_id = _capsule_id 
          AND cm.user_id = _user_id 
          AND cm.accepted_at IS NOT NULL
    )
$$;

-- Fonction pour vérifier si un utilisateur est membre d'un cercle
CREATE OR REPLACE FUNCTION public.user_is_circle_member(_user_id UUID, _circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM circles WHERE id = _circle_id AND owner_id = _user_id
    )
    OR EXISTS (
        SELECT 1 FROM circle_members 
        WHERE circle_id = _circle_id 
          AND user_id = _user_id 
          AND accepted_at IS NOT NULL
    )
$$;

-- RLS Policies pour capsules
CREATE POLICY "Users can view their own capsules"
ON public.capsules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared capsules"
ON public.capsules FOR SELECT
USING (public.user_can_view_capsule(auth.uid(), id));

CREATE POLICY "Users can create their own capsules"
ON public.capsules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capsules"
ON public.capsules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capsules"
ON public.capsules FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies pour circles
CREATE POLICY "Users can view circles they own or are members of"
ON public.circles FOR SELECT
USING (public.user_is_circle_member(auth.uid(), id));

CREATE POLICY "Users can create their own circles"
ON public.circles FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own circles"
ON public.circles FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own circles"
ON public.circles FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies pour circle_members
CREATE POLICY "Circle owners can view members"
ON public.circle_members FOR SELECT
USING (
    EXISTS (SELECT 1 FROM circles WHERE id = circle_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "Circle owners can add members"
ON public.circle_members FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM circles WHERE id = circle_id AND owner_id = auth.uid())
);

CREATE POLICY "Circle owners can update members"
ON public.circle_members FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM circles WHERE id = circle_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "Circle owners can remove members"
ON public.circle_members FOR DELETE
USING (
    EXISTS (SELECT 1 FROM circles WHERE id = circle_id AND owner_id = auth.uid())
);

-- RLS Policies pour capsule_shares
CREATE POLICY "Users can view shares for their capsules or circles"
ON public.capsule_shares FOR SELECT
USING (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
    OR public.user_is_circle_member(auth.uid(), circle_id)
);

CREATE POLICY "Capsule owners can share"
ON public.capsule_shares FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
    AND auth.uid() = shared_by
);

CREATE POLICY "Capsule owners can unshare"
ON public.capsule_shares FOR DELETE
USING (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
);

-- RLS Policies pour capsule_medias
CREATE POLICY "Users can view medias of accessible capsules"
ON public.capsule_medias FOR SELECT
USING (
    public.user_can_view_capsule(auth.uid(), capsule_id)
);

CREATE POLICY "Capsule owners can add medias"
ON public.capsule_medias FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
);

CREATE POLICY "Capsule owners can update medias"
ON public.capsule_medias FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
);

CREATE POLICY "Capsule owners can delete medias"
ON public.capsule_medias FOR DELETE
USING (
    EXISTS (SELECT 1 FROM capsules WHERE id = capsule_id AND user_id = auth.uid())
);

-- Triggers pour updated_at
CREATE TRIGGER update_capsules_updated_at
BEFORE UPDATE ON public.capsules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circles_updated_at
BEFORE UPDATE ON public.circles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour optimiser les requêtes
CREATE INDEX idx_capsules_user_id ON public.capsules(user_id);
CREATE INDEX idx_capsules_status ON public.capsules(status);
CREATE INDEX idx_capsules_created_at ON public.capsules(created_at DESC);
CREATE INDEX idx_circles_owner_id ON public.circles(owner_id);
CREATE INDEX idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX idx_capsule_shares_capsule_id ON public.capsule_shares(capsule_id);
CREATE INDEX idx_capsule_shares_circle_id ON public.capsule_shares(circle_id);
CREATE INDEX idx_capsule_medias_capsule_id ON public.capsule_medias(capsule_id);