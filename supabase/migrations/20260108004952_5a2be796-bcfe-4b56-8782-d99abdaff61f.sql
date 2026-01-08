-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify capsule owner and circle members on new comment
CREATE OR REPLACE FUNCTION public.notify_on_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  capsule_record RECORD;
  commenter_name TEXT;
  circle_member RECORD;
BEGIN
  -- Get capsule info
  SELECT c.*, p.display_name as owner_name 
  INTO capsule_record
  FROM capsules c
  LEFT JOIN profiles p ON p.user_id = c.user_id
  WHERE c.id = NEW.capsule_id;

  -- Get commenter name
  SELECT display_name INTO commenter_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  IF commenter_name IS NULL THEN
    commenter_name := 'Quelqu''un';
  END IF;

  -- Notify capsule owner (if not the commenter)
  IF capsule_record.user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      capsule_record.user_id,
      'comment',
      'Nouveau commentaire',
      commenter_name || ' a commenté sur "' || capsule_record.title || '"',
      '/capsules/' || NEW.capsule_id,
      jsonb_build_object('capsule_id', NEW.capsule_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
    );
  END IF;

  -- Notify circle members who have access to this capsule (except commenter and owner)
  FOR circle_member IN
    SELECT DISTINCT cm.user_id
    FROM capsule_shares cs
    JOIN circle_members cm ON cm.circle_id = cs.circle_id
    WHERE cs.capsule_id = NEW.capsule_id
      AND cm.user_id != NEW.user_id
      AND cm.user_id != capsule_record.user_id
      AND cm.accepted_at IS NOT NULL
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      circle_member.user_id,
      'comment',
      'Nouveau commentaire',
      commenter_name || ' a commenté sur "' || capsule_record.title || '"',
      '/capsules/' || NEW.capsule_id,
      jsonb_build_object('capsule_id', NEW.capsule_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for new comments
CREATE TRIGGER on_new_comment
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_comment();