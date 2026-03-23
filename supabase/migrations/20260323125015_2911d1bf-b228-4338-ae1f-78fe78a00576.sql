
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  new_display_name TEXT;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, country, city)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'city'
    );

    -- Notify all admins about the new signup
    new_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email);
    
    FOR admin_record IN
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin'
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, link, data)
      VALUES (
        admin_record.user_id,
        'admin_new_signup',
        'Nouvelle inscription',
        new_display_name || ' vient de s''inscrire sur Family Garden',
        '/admin/users',
        jsonb_build_object('new_user_id', NEW.id, 'email', NEW.email, 'display_name', new_display_name)
      );
    END LOOP;

    RETURN NEW;
END;
$$;
