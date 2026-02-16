import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from '@/lib/i18n';

interface SEOHeadProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const SITE_URL = 'https://www.familygarden.fr';
const SUPPORTED_LANGS = ['fr', 'en', 'es', 'ko', 'zh'];

const LANG_TO_LOCALE: Record<string, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  ko: 'ko_KR',
  zh: 'zh_CN',
};

const SEOHead = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const location = useLocation();
  const canonicalPath = location.pathname;

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

    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
    }

    // Hreflang tags
    const hreflangLinks: HTMLLinkElement[] = [];
    SUPPORTED_LANGS.forEach((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${SITE_URL}${canonicalPath}`;
      document.head.appendChild(link);
      hreflangLinks.push(link);
    });
    // x-default
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${SITE_URL}${canonicalPath}`;
    document.head.appendChild(xDefault);
    hreflangLinks.push(xDefault);

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
  }, [title, description, canonicalPath, ogTitle, ogDescription, ogImage, ogType, noIndex, jsonLd]);

  return null;
};

export default SEOHead;
