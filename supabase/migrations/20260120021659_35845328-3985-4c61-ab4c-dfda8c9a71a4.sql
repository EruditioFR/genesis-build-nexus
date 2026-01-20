-- Add columns for flexible memory date precision
ALTER TABLE public.capsules
ADD COLUMN IF NOT EXISTS memory_date_precision TEXT DEFAULT 'exact',
ADD COLUMN IF NOT EXISTS memory_date_year_end INTEGER;

-- Add a comment to explain the columns
COMMENT ON COLUMN public.capsules.memory_date_precision IS 'Precision of memory_date: exact, month, year, or range';
COMMENT ON COLUMN public.capsules.memory_date_year_end IS 'End year for range precision dates';