-- Table to track which memory prompts a user has already used
CREATE TABLE public.user_memory_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_id TEXT NOT NULL,
  category TEXT NOT NULL,
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_memory_prompts ENABLE ROW LEVEL SECURITY;

-- Users can view their own prompt usage
CREATE POLICY "Users can view their own prompt usage"
ON public.user_memory_prompts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own prompt usage
CREATE POLICY "Users can insert their own prompt usage"
ON public.user_memory_prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prompt usage
CREATE POLICY "Users can delete their own prompt usage"
ON public.user_memory_prompts
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_memory_prompts_user_id ON public.user_memory_prompts(user_id);
CREATE INDEX idx_user_memory_prompts_category ON public.user_memory_prompts(category);