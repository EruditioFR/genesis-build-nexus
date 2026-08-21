/**
 * Build-time prerender of the public pages' <head> (and a <noscript> summary).
 *
 * The app is a client-rendered SPA: without this step every route is served the
 * exact same index.html, so crawlers see one page with one title, one
 * description and a canonical pointing at the homepage. This script writes a
 * dedicated static HTML file per public route and per published blog article,
 * with its own title, description, canonical, Open Graph/Twitter tags and
 * JSON-LD baked in.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_SEO, ROUTE_BREADCRUMB_LABEL, ROUTE_REDIRECTS } from "../src/lib/routeSeoMeta.mjs";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");


const SITE_URL = "https://familygarden.fr";
const BRAND = "Family Garden";
const MAX_PRERENDER_PAGES = 500;

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const LOCALES = {
  fr: "fr_FR", en: "en_US", es: "es_ES", ko: "ko_KR",
  zh: "zh_CN", it: "it_IT", pt: "pt_BR",
};

const withBrand = (title) =>
  title && title.toLowerCase().includes("family garden") ? title : `${title} | ${BRAND}`;

const absolute = (url) => {
  if (!url) return `${SITE_URL}/og-image.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

/** Read real pixel dimensions of a remote JPEG/PNG/WebP (crawlers reject mismatched sizes). */
const dimCache = new Map();
async function imageSize(url) {
  if (dimCache.has(url)) return dimCache.get(url);
  let size = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      size = parsePng(buf) || parseJpeg(buf) || parseWebp(buf);
    }
  } catch {
    /* ignore — omit dimensions */
  }
  dimCache.set(url, size);
  return size;
}

function parsePng(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function parseJpeg(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}
function parseWebp(b) {
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const fmt = b.toString("ascii", 12, 16);
  if (fmt === "VP8X") return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (fmt === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fmt === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}

const IMAGE_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/**
 * Reciprocal hreflang cluster for an article: one <link> per language of the
 * translation group (including a self-reference) plus a single x-default.
 * Every page of the group emits the identical set, which is what makes the
 * return tags valid. Articles published in a single language get no cluster.
 */
function buildHreflang(post, posts) {
  if (!post.translation_group) return "";
  const seen = new Map();
  for (const p of posts) {
    if (p.translation_group !== post.translation_group || !p.slug) continue;
    const lang = (p.lang || "fr").split("-")[0];
    if (!seen.has(lang)) seen.set(lang, `${SITE_URL}/blog/${p.slug}`);
  }
  if (seen.size < 2) return "";
  const langs = [...seen.keys()].sort();
  const lines = langs.map(
    (l) => `    <link rel="alternate" hreflang="${l}" href="${escapeHtml(seen.get(l))}" />`,
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${escapeHtml(seen.get("fr") || seen.get(langs[0]))}" />`,
  );
  return lines.join("\n") + "\n";
}

async function buildHead(post, posts = []) {

  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = withBrand(post.meta_title || post.title);
  const description = post.meta_description || post.excerpt || "";
  const image = absolute(post.cover_image_url);
  const locale = LOCALES[post.lang] || "fr_FR";
  const e = escapeHtml;
  const dims = await imageSize(image);
  const ext = (image.split("?")[0].split(".").pop() || "").toLowerCase();
  const mime = IMAGE_TYPES[ext];

  return `    <title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <link rel="canonical" href="${e(url)}" />
${buildHreflang(post, posts)}
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="${locale}" />
    <meta property="og:url" content="${e(url)}" />
    <meta property="og:title" content="${e(title)}" />
    <meta property="og:description" content="${e(description)}" />
    <meta property="og:image" content="${e(image)}" />
    <meta property="og:image:secure_url" content="${e(image)}" />
${mime ? `    <meta property="og:image:type" content="${mime}" />\n` : ""}${dims ? `    <meta property="og:image:width" content="${dims.w}" />\n    <meta property="og:image:height" content="${dims.h}" />\n` : ""}    <meta property="og:image:alt" content="${e(post.title)} — ${BRAND}" />
    <meta property="article:published_time" content="${e(post.published_at || "")}" />
    <meta property="article:publisher" content="${SITE_URL}" />
    <meta name="author" content="${BRAND}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@familygarden" />
    <meta name="twitter:title" content="${e(title)}" />
    <meta name="twitter:description" content="${e(description)}" />
    <meta name="twitter:image" content="${e(image)}" />
    <meta name="twitter:image:alt" content="${e(post.title)} — ${BRAND}" />
`;
}

function injectHead(template, headHtml, lang, noscriptHtml, stripJsonLd = false) {
  let html = template;
  if (stripJsonLd) {
    // The route emits its own JSON-LD; drop the template's sitewide blocks so
    // Organization/WebSite are not declared twice on the same page.
    html = html.replace(
      /[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,
      "",
    );
  }
  // Remove the static tags that must be overridden per page.
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  html = html.replace(
    /[ \t]*<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*|author)"[^>]*>\s*/gi,
    ""
  );
  html = html.replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*/gi, "");
  html = html.replace(/[ \t]*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/gi, "");

  if (lang) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  html = html.replace(/<\/head>/i, `${headHtml}  </head>`);
  if (noscriptHtml) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, noscriptHtml);
  }
  return html;
}

/* ------------------------------------------------------------------ */
/*  Static public routes                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  ["/", "Accueil"],
  ["/tarifs", "Tarifs : 2,99 €/mois"],
  ["/faq", "Questions fréquentes"],
  ["/about", "À propos de Family Garden"],
  ["/blog", "Blog : conserver et transmettre ses souvenirs"],
  ["/demo", "Démonstration guidée"],
  ["/signup", "Inscription — 14 jours d'essai gratuit"],
  ["/privacy", "Confidentialité"],
  ["/terms", "Conditions d'utilisation"],
  ["/mentions-legales", "Mentions légales"],
];

const stripMarkdownLinks = (s = "") => s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

/**
 * Extracts the FAQ question/answer pairs straight from the page component so
 * the prerendered FAQPage schema can never drift from the visible content.
 */
function readFaqItems() {
  try {
    const src = fs.readFileSync(path.join(PROJECT_ROOT, "src/pages/FAQ.tsx"), "utf8");
    const re = /question:\s*"((?:[^"\\]|\\.)*)"\s*,\s*answer:\s*"((?:[^"\\]|\\.)*)"/g;
    const items = [];
    let m;
    while ((m = re.exec(src))) {
      items.push({
        question: stripMarkdownLinks(JSON.parse(`"${m[1]}"`)),
        answer: stripMarkdownLinks(JSON.parse(`"${m[2]}"`)),
      });
    }
    return items;
  } catch {
    return [];
  }
}

function buildSchemas(routePath, meta, { faqItems = [], posts = [] } = {}) {
  const url = `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
  const schemas = [];
  const wanted = meta.schemas || [];

  if (wanted.includes("organization")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: BRAND,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      description: meta.summary,
    });
  }
  if (wanted.includes("website")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND,
      url: SITE_URL,
      inLanguage: ["fr", "en", "es", "it", "pt", "ko", "zh"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
  }
  if (wanted.includes("softwareApplication")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: BRAND,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "2.99",
        priceCurrency: "EUR",
        url: `${SITE_URL}/tarifs`,
      },
    });
  }
  if (wanted.includes("offer")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${BRAND} — abonnement`,
      description: meta.summary,
      brand: { "@type": "Brand", name: BRAND },
      offers: [
        {
          "@type": "Offer",
          name: "Abonnement Family Garden",
          price: "2.99",
          priceCurrency: "EUR",
          url: `${SITE_URL}/tarifs`,
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Option arbre généalogique",
          price: "5.00",
          priceCurrency: "EUR",
          url: `${SITE_URL}/tarifs`,
          availability: "https://schema.org/InStock",
        },
      ],
    });
  }
  if (wanted.includes("faq") && faqItems.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((i) => ({
        "@type": "Question",
        name: i.question,
        acceptedAnswer: { "@type": "Answer", text: i.answer },
      })),
    });
  }
  if (wanted.includes("blog")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: meta.h1,
      url: `${SITE_URL}/blog`,
      description: meta.description,
      publisher: { "@id": `${SITE_URL}/#organization` },
      blogPost: posts.slice(0, 20).map((p) => ({
        "@type": "BlogPosting",
        headline: (p.meta_title || p.title || "").slice(0, 110),
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.published_at || undefined,
      })),
    });
  }
  if (wanted.includes("breadcrumb") && routePath !== "/") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: BRAND, item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: ROUTE_BREADCRUMB_LABEL[routePath] || meta.h1,
          item: url,
        },
      ],
    });
  }
  return schemas;
}

async function buildStaticHead(routePath, meta, extras) {
  const e = escapeHtml;
  const url = `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
  const image = `${SITE_URL}/og-image.png`;
  const dims = await imageSize(image);
  const schemas = buildSchemas(routePath, meta, extras);

  return `    <title>${e(meta.title)}</title>
    <meta name="description" content="${e(meta.description)}" />
    <link rel="canonical" href="${e(url)}" />
    <meta name="author" content="${BRAND}" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${routePath === "/pricing" ? "en_US" : "fr_FR"}" />
    <meta property="og:url" content="${e(url)}" />
    <meta property="og:title" content="${e(meta.title)}" />
    <meta property="og:description" content="${e(meta.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
${dims ? `    <meta property="og:image:width" content="${dims.w}" />\n    <meta property="og:image:height" content="${dims.h}" />\n` : ""}    <meta property="og:image:alt" content="${e(meta.h1)} — ${BRAND}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@familygarden" />
    <meta name="twitter:title" content="${e(meta.title)}" />
    <meta name="twitter:description" content="${e(meta.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${e(meta.h1)} — ${BRAND}" />
${schemas
  .map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`)
  .join("\n")}
`;
}

function buildNoscript(routePath, meta, { faqItems = [], posts = [] } = {}) {
  const e = escapeHtml;
  const blocks = [`      <h1>${e(meta.h1)}</h1>`, `      <p>${e(meta.summary)}</p>`];

  if (routePath === "/faq" && faqItems.length) {
    blocks.push("      <h2>Questions fréquentes</h2>");
    for (const item of faqItems.slice(0, 25)) {
      blocks.push(`      <h3>${e(item.question)}</h3>`, `      <p>${e(item.answer)}</p>`);
    }
  }

  if (routePath === "/blog" && posts.length) {
    blocks.push("      <h2>Articles publiés</h2>", "      <ul>");
    for (const p of posts.slice(0, 60)) {
      blocks.push(
        `        <li><a href="${SITE_URL}/blog/${e(p.slug)}">${e(p.title || p.slug)}</a>${
          p.excerpt ? ` — ${e(p.excerpt)}` : ""
        }</li>`,
      );
    }
    blocks.push("      </ul>");
  }

  blocks.push("      <h2>Navigation</h2>", "      <ul>");
  for (const [href, label] of NAV_LINKS) {
    if (href === routePath) continue;
    blocks.push(`        <li><a href="${SITE_URL}${href === "/" ? "/" : href}">${e(label)}</a></li>`);
  }
  blocks.push("      </ul>");

  return `<noscript>\n    <div>\n${blocks.join("\n")}\n    </div>\n    </noscript>`;
}

async function prerenderStaticRoutes({ outDir, template, posts, log }) {
  const faqItems = readFaqItems();
  const extras = { faqItems, posts };
  let written = 0;

  for (const [routePath, meta] of Object.entries(ROUTE_SEO)) {
    const head = await buildStaticHead(routePath, meta, extras);
    const noscript = buildNoscript(routePath, meta, extras);
    const lang = routePath === "/pricing" ? "en" : "fr";
    const html = injectHead(template, head, lang, noscript, true);
    const dir = routePath === "/" ? outDir : path.join(outDir, routePath.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
    written++;
  }
  log(`[prerender] Wrote ${written} static pages (FAQ schema: ${faqItems.length} Q/A).`);
}

/**
 * Legacy URLs kept alive only to funnel their equity to the canonical page:
 * canonical + meta refresh + a visible link, so crawlers treat them as a
 * permanent redirect instead of a duplicate page.
 */
function prerenderRedirects({ outDir, log }) {
  const e = escapeHtml;
  let written = 0;
  for (const [from, to] of Object.entries(ROUTE_REDIRECTS)) {
    const target = `${SITE_URL}${to}`;
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${e(ROUTE_SEO[to]?.title || BRAND)}</title>
    <link rel="canonical" href="${e(target)}" />
    <meta http-equiv="refresh" content="0; url=${e(target)}" />
    <meta name="description" content="${e(ROUTE_SEO[to]?.description || "")}" />
    <script>window.location.replace(${JSON.stringify(to)});</script>
  </head>
  <body>
    <p>Cette page a déménagé : <a href="${e(target)}">${e(target)}</a></p>
  </body>
</html>
`;
    const dir = path.join(outDir, from.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
    written++;
  }
  log(`[prerender] Wrote ${written} redirect pages.`);
}



export async function prerenderSite({ outDir, supabaseUrl, supabaseKey, log = console.log }) {
  const templatePath = path.join(outDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    log("[prerender] dist/index.html not found — skipped.");
    return;
  }
  // Read once: the homepage output overwrites this same file.
  const template = fs.readFileSync(templatePath, "utf8");

  let posts = [];
  if (supabaseUrl && supabaseKey) {
    const endpoint =
      `${supabaseUrl}/rest/v1/blog_posts` +
      `?select=slug,lang,translation_group,title,excerpt,meta_title,meta_description,cover_image_url,published_at` +
      `&status=eq.published&order=published_at.desc&limit=${MAX_PRERENDER_PAGES}`;
    try {
      const res = await fetch(endpoint, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      posts = await res.json();
    } catch (err) {
      log(`[prerender] Blog fetch failed, static routes only: ${err.message}`);
    }
  } else {
    log("[prerender] Missing Supabase env vars — static routes only.");
  }

  await prerenderStaticRoutes({ outDir, template, posts, log });
  prerenderRedirects({ outDir, log });

  let written = 0;
  for (const post of posts) {
    if (!post.slug || written >= MAX_PRERENDER_PAGES) continue;
    const dir = path.join(outDir, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const head = await buildHead(post, posts);
    fs.writeFileSync(
      path.join(dir, "index.html"),
      injectHead(template, head, (post.lang || "fr").split("-")[0]),
      "utf8",
    );
    written++;
  }
  log(`[prerender] Wrote ${written} article pages with share metadata.`);
}

export function sitePrerenderPlugin() {
  let resolvedOutDir = "dist";
  let env = {};
  return {
    name: "family-garden-prerender",
    apply: "build",
    configResolved(config) {
      resolvedOutDir = path.resolve(config.root, config.build.outDir);
      env = config.env || {};
    },
    async closeBundle() {
      await prerenderSite({
        outDir: resolvedOutDir,
        supabaseUrl: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        supabaseKey:
          env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          env.VITE_SUPABASE_ANON_KEY ||
          process.env.VITE_SUPABASE_ANON_KEY,
      });
    },
  };
}

