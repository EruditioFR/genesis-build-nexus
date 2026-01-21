-- Create a function to check if an email already exists in auth.users
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'auth', 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = LOWER(email_to_check)
  );
$$;