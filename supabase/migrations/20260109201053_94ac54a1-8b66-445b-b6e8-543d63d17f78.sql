-- Fix: Remove permissive INSERT policy on notifications and create a proper one
-- Only allow service role (edge functions) to insert notifications via a security definer function

-- Drop the permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a security definer function for inserting notifications
-- This allows edge functions to insert notifications without exposing the table to all users
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text DEFAULT NULL,
  _link text DEFAULT NULL,
  _data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, data)
  VALUES (_user_id, _type, _title, _message, _link, _data)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO service_role;