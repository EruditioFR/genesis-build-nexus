// Mapping des articles de blog traduits : groupe de traduction -> slug par langue.
// Sert au maillage interne (page d'accueil, articles liés, sitemap).

export type ArticleGroup =
  | 'capsule'
  | 'souvenirs'
  | 'biographie'
  | 'arbre';

export const SUPPORTED_BLOG_LANGS = ['fr', 'en', 'es', 'it', 'pt', 'ko', 'zh'] as const;
export type BlogLang = (typeof SUPPORTED_BLOG_LANGS)[number];

export const ARTICLE_SLUGS: Record<ArticleGroup, Record<BlogLang, string>> = {
  capsule: {
    fr: 'capsule-temporelle-numerique-comment-en-creer-une',
    en: 'digital-time-capsule-family-guide-en',
    es: 'capsula-tiempo-digital-familiar-crear-es',
    it: 'capsula-del-tempo-digitale-guida-completa-it',
    pt: 'capsula-tempo-digital-criar-familia-pt',
    ko: 'digital-time-capsule-family-garden-korea-ko',
    zh: 'digital-time-capsule-family-garden-zh',
  },
  souvenirs: {
    fr: 'conserver-transmettre-souvenirs-de-famille',
    en: 'preserve-pass-down-family-memories-en',
    es: 'como-conservar-transmitir-recuerdos-familiares-es',
    it: 'conservare-tramandare-ricordi-famiglia-guida-it',
    pt: 'preservar-transmitir-memorias-familia-pt',
    ko: 'family-memory-preservation-guide-ko',
    zh: 'how-to-preserve-and-pass-on-family-memories-zh',
  },
  biographie: {
    fr: 'raconter-sa-vie-a-ses-enfants-methode',
    en: 'telling-your-life-story-7-steps-en',
    es: 'contar-vida-hijos-metodo-7-pasos-es',
    it: 'raccontare-vita-figli-metodo-7-passaggi-it',
    pt: 'contar-a-sua-vida-aos-seus-filhos-metodo-pt',
    ko: '7-steps-to-share-your-life-story-ko',
    zh: 'how-to-tell-your-life-story-to-children-7-steps-zh',
  },
  arbre: {
    fr: 'arbre-genealogique-en-ligne-photos-et-souvenirs',
    en: 'online-family-tree-photos-stories-en',
    es: 'arbol-genealogico-online-fotos-relatos-personas-es',
    it: 'albero-genealogico-online-foto-storie-it',
    pt: 'arvore-genealogica-online-fotos-historias-pessoas-pt',
    ko: 'online-family-tree-memories-photos-ko',
    zh: 'online-family-tree-photos-stories-people-zh',
  },
};

export const EDITORIAL_ORDER: ArticleGroup[] = ['capsule', 'souvenirs', 'biographie', 'arbre'];

export const normalizeBlogLang = (lng?: string): BlogLang => {
  const base = (lng || 'fr').split('-')[0] as BlogLang;
  return (SUPPORTED_BLOG_LANGS as readonly string[]).includes(base) ? base : 'fr';
};

export const getArticleSlug = (group: ArticleGroup, lng?: string): string =>
  ARTICLE_SLUGS[group][normalizeBlogLang(lng)];
