-- Add country and city columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN country VARCHAR(2) NULL,
ADD COLUMN city VARCHAR(255) NULL;

-- Update the handle_new_user function to include country and city
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, country, city)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'city'
    );
    RETURN NEW;
END;
$$;