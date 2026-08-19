/**
 * Build-time prerender of blog article <head> metadata.
 *
 * Social crawlers (Facebook, LinkedIn, WhatsApp, X, Slack…) do not execute JS,
 * so the client-side <SEOHead> tags are invisible to them. This script writes a
 * static dist/blog/<slug>/index.html per published article, with the article's
 * title, description and cover image baked into the head — plus the
 * "Family Garden" brand reminder.
 */
import fs from "node:fs";
import path from "node:path";

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

async function buildHead(post) {
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

function injectHead(template, headHtml, lang) {
  let html = template;
  // Remove the static tags that must be overridden per article.
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  html = html.replace(
    /[ \t]*<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*|author)"[^>]*>\s*/gi,
    ""
  );
  html = html.replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*/gi, "");
  if (lang) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  return html.replace(/<\/head>/i, `${headHtml}  </head>`);
}


export async function prerenderBlog({ outDir, supabaseUrl, supabaseKey, log = console.log }) {
  if (!supabaseUrl || !supabaseKey) {
    log("[prerender-blog] Missing Supabase env vars — skipped.");
    return;
  }
  const templatePath = path.join(outDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    log("[prerender-blog] dist/index.html not found — skipped.");
    return;
  }
  const template = fs.readFileSync(templatePath, "utf8");

  const endpoint =
    `${supabaseUrl}/rest/v1/blog_posts` +
    `?select=slug,lang,title,excerpt,meta_title,meta_description,cover_image_url,published_at` +
    `&status=eq.published&order=published_at.desc&limit=${MAX_PRERENDER_PAGES}`;

  let posts = [];
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    posts = await res.json();
  } catch (err) {
    log(`[prerender-blog] Fetch failed, skipping prerender: ${err.message}`);
    return;
  }

  let written = 0;
  for (const post of posts) {
    if (!post.slug || written >= MAX_PRERENDER_PAGES) continue;
    const dir = path.join(outDir, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const head = await buildHead(post);
    fs.writeFileSync(
      path.join(dir, "index.html"),
      injectHead(template, head, (post.lang || "fr").split("-")[0]),
      "utf8",
    );

    written++;
  }
  log(`[prerender-blog] Wrote ${written} article pages with share metadata.`);
}

export function blogPrerenderPlugin() {
  let resolvedOutDir = "dist";
  let env = {};
  return {
    name: "family-garden-blog-prerender",
    apply: "build",
    configResolved(config) {
      resolvedOutDir = path.resolve(config.root, config.build.outDir);
      env = config.env || {};
    },
    async closeBundle() {
      await prerenderBlog({
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
