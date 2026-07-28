-- 1. Add 'essential' to subscription_level enum
ALTER TYPE public.subscription_level ADD VALUE IF NOT EXISTS 'essential';

-- 2. Add new columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_family_tree_addon boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- 3. Update handle_new_user() to seed 14-day trial with Essentiel access
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  new_display_name TEXT;
BEGIN
    -- Create profile with 14-day Essentiel trial
    INSERT INTO public.profiles (
      user_id, display_name, country, city,
      subscription_level, storage_limit_mb, trial_ends_at, has_family_tree_addon
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'city',
        'essential'::public.subscription_level,
        20480,
        now() + interval '14 days',
        false
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
$function$;