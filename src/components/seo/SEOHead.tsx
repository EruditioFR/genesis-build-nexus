import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from '@/lib/i18n';

interface SEOHeadProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  jsonLd?: object | object[];
  /**
   * Translated versions of THIS page (one URL per language, including the
   * current one). When provided, a full reciprocal hreflang cluster is
   * emitted; otherwise only x-default self-referencing.
   */
  alternates?: { hreflang: string; href: string }[];
}


const SITE_URL = 'https://familygarden.fr';
const SUPPORTED_LANGS = ['fr', 'en', 'es', 'ko', 'zh', 'it', 'pt'];
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const LANG_TO_LOCALE: Record<string, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  ko: 'ko_KR',
  zh: 'zh_CN',
  it: 'it_IT',
  pt: 'pt_BR',
};

const SEOHead = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogType = 'website',
  noIndex = false,
  jsonLd,
  alternates,
}: SEOHeadProps) => {
  const location = useLocation();
  const canonicalPath = location.pathname;
  const alternatesKey = JSON.stringify(alternates ?? []);


  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set/create meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Description
    setMeta('name', 'description', description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${canonicalPath}`;

    // Open Graph
    setMeta('property', 'og:title', ogTitle || title);
    setMeta('property', 'og:description', ogDescription || description);
    setMeta('property', 'og:url', `${SITE_URL}${canonicalPath}`);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'Family Garden');
    
    // og:locale — current language + alternates
    const currentLang = i18n.language?.substring(0, 2) || 'fr';
    setMeta('property', 'og:locale', LANG_TO_LOCALE[currentLang] || 'fr_FR');
    
    // og:locale:alternate for other languages
    const alternateLocaleEls: HTMLMetaElement[] = [];
    SUPPORTED_LANGS.filter(l => l !== currentLang).forEach(lang => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:locale:alternate');
      el.content = LANG_TO_LOCALE[lang] || lang;
      document.head.appendChild(el);
      alternateLocaleEls.push(el);
    });

    const rawImage = ogImage || DEFAULT_OG_IMAGE;
    const resolvedImage = /^https?:\/\//i.test(rawImage)
      ? rawImage
      : `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    setMeta('property', 'og:image', resolvedImage);
    setMeta('property', 'og:image:secure_url', resolvedImage);
    if (ogImageWidth && ogImageHeight) {
      setMeta('property', 'og:image:width', String(ogImageWidth));
      setMeta('property', 'og:image:height', String(ogImageHeight));
    } else if (!ogImage) {
      // Known dimensions of the default social card.
      setMeta('property', 'og:image:width', '1200');
      setMeta('property', 'og:image:height', '630');
    }
    setMeta('property', 'og:image:alt', ogImageAlt || ogTitle || title);

    // Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', ogTitle || title);
    setMeta('name', 'twitter:description', ogDescription || description);
    setMeta('name', 'twitter:image', resolvedImage);
    setMeta('name', 'twitter:image:alt', ogImageAlt || ogTitle || title);

    // Hreflang.
    // - Pages that exist in several languages (blog articles) declare the full
    //   cluster: one URL per language, including a self-reference, plus a
    //   single x-default. Every page of the cluster emits the same set, which
    //   is what makes the return tags reciprocal.
    // - Pages served at a single URL for all languages only declare
    //   x-default pointing at themselves.
    const hreflangLinks: HTMLLinkElement[] = [];
    const parsedAlternates: { hreflang: string; href: string }[] = JSON.parse(alternatesKey);
    const addAlternate = (hreflang: string, href: string) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
      hreflangLinks.push(link);
    };

    if (parsedAlternates.length > 0) {
      const seen = new Set<string>();
      parsedAlternates.forEach(({ hreflang, href }) => {
        if (!hreflang || !href || seen.has(hreflang)) return;
        seen.add(hreflang);
        addAlternate(hreflang, href);
      });
      const fallback =
        parsedAlternates.find((a) => a.hreflang === 'fr')?.href ||
        parsedAlternates[0].href;
      addAlternate('x-default', fallback);
    } else {
      addAlternate('x-default', `${SITE_URL}${canonicalPath}`);
    }


    // NoIndex
    let robotsMeta: HTMLMetaElement | null = null;
    if (noIndex) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'noindex, nofollow';
      document.head.appendChild(robotsMeta);
    }

    // JSON-LD
    const jsonLdScripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema, i) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `seo-head-jsonld-${i}`;
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        jsonLdScripts.push(script);
      });
    }

    return () => {
      hreflangLinks.forEach((link) => link.parentNode?.removeChild(link));
      alternateLocaleEls.forEach((el) => el.parentNode?.removeChild(el));
      if (robotsMeta) robotsMeta.parentNode?.removeChild(robotsMeta);
      jsonLdScripts.forEach((s) => s.parentNode?.removeChild(s));
    };
  }, [title, description, canonicalPath, ogTitle, ogDescription, ogImage, ogImageAlt, ogImageWidth, ogImageHeight, ogType, noIndex, jsonLd]);

  return null;
};

export default SEOHead;
