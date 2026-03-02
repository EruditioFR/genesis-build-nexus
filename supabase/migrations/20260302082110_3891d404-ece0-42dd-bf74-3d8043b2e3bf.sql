
-- Table to store contact form submissions
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public insert (no auth required for contact form)
CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Only admins can view/update/delete
CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
