-- Add memory_date column to capsules table
-- This represents when the memory/event actually happened (distinct from created_at)
ALTER TABLE public.capsules 
ADD COLUMN memory_date DATE NULL;

-- Add an index for better performance when filtering/sorting by memory_date
CREATE INDEX idx_capsules_memory_date ON public.capsules(memory_date);