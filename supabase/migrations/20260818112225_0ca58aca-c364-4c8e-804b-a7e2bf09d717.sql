ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'fr';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS translation_group text;
CREATE INDEX IF NOT EXISTS blog_posts_lang_idx ON public.blog_posts (lang);
UPDATE public.blog_posts SET translation_group = slug WHERE translation_group IS NULL;