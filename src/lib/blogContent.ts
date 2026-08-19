import { sanitizeHtml } from "@/lib/sanitizeHtml";

const BRAND_RE = /(Family\s?Garden)/gi;

/**
 * Met en exergue la marque « Family Garden » dans le HTML d'un article,
 * sans toucher au contenu des balises ni aux textes de liens déjà stylés.
 */
const highlightBrand = (html: string): string =>
  html
    .split(/(<[^>]+>)/g)
    .map((chunk) => {
      if (chunk.startsWith("<")) return chunk;
      return chunk.replace(
        BRAND_RE,
        '<strong class="text-primary font-semibold">$1</strong>',
      );
    })
    .join("");

/** Sanitize + mise en exergue de la marque pour le rendu d'un article de blog. */
export const formatBlogContent = (html?: string | null): string => {
  if (!html) return "";
  return highlightBrand(sanitizeHtml(html));
};
