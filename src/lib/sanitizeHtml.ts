import DOMPurify from 'dompurify';

/**
 * Sanitize user-generated rich-text HTML before rendering it with
 * dangerouslySetInnerHTML. Strips scripts, event handlers (onclick, onerror…)
 * and javascript: URLs while keeping standard formatting markup.
 */
export function sanitizeHtml(html?: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style'],
  });
}
