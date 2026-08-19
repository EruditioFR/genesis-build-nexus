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

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugify = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\uac00-\ud7af]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * Ajoute des ancres (id) aux titres h2/h3 du contenu formaté
 * et retourne la liste des titres pour construire un sommaire cliquable.
 */
export const buildArticleToc = (
  html: string,
): { html: string; headings: TocHeading[] } => {
  if (!html || typeof window === "undefined") return { html, headings: [] };

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return { html, headings: [] };

  const headings: TocHeading[] = [];
  const used = new Set<string>();

  root.querySelectorAll("h2, h3").forEach((el) => {
    const text = (el.textContent || "").trim();
    if (!text) return;
    let id = el.id || slugify(text) || `section-${headings.length + 1}`;
    let i = 2;
    while (used.has(id)) id = `${id}-${i++}`;
    used.add(id);
    el.id = id;
    headings.push({ id, text, level: el.tagName === "H3" ? 3 : 2 });
  });

  return { html: root.innerHTML, headings };
};
