-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;

-- RLS Policies for user_roles table
-- Only admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table RLS to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update capsules table RLS to allow admins/moderators to view all capsules
CREATE POLICY "Admins can view all capsules"
ON public.capsules
FOR SELECT
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Allow admins/moderators to update any capsule
CREATE POLICY "Admins can update all capsules"
ON public.capsules
FOR UPDATE
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Allow admins to delete any capsule
CREATE POLICY "Admins can delete all capsules"
ON public.capsules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update comments table RLS to allow admins/moderators to view all comments
CREATE POLICY "Admins can view all comments"
ON public.comments
FOR SELECT
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Allow admins/moderators to delete any comment
CREATE POLICY "Admins can delete all comments"
ON public.comments
FOR DELETE
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Add suspended field to profiles for user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason text;