-- Fonction sécurisée pour récupérer l'email d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $$
  SELECT email FROM auth.users WHERE id = _user_id;
$$;