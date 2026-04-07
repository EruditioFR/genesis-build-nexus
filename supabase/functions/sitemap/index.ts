import { corsHeaders } from "@supabase/supabase-js/cors";

const SITE_URL = "https://www.familygarden.fr";

interface SitemapEntry {
  loc: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  lastmod?: string;
}

const today = new Date().toISOString().split("T")[0];

const PUBLIC_ROUTES: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/login", changefreq: "monthly", priority: 0.8 },
  { loc: "/signup", changefreq: "monthly", priority: 0.8 },
  { loc: "/premium", changefreq: "monthly", priority: 0.9 },
  { loc: "/inspirations", changefreq: "weekly", priority: 0.7 },
  { loc: "/faq", changefreq: "monthly", priority: 0.7 },
  { loc: "/about", changefreq: "monthly", priority: 0.7 },
  { loc: "/marketing", changefreq: "monthly", priority: 0.8 },
  { loc: "/privacy", changefreq: "yearly", priority: 0.5 },
  { loc: "/terms", changefreq: "yearly", priority: 0.5 },
  { loc: "/cgv", changefreq: "yearly", priority: 0.5 },
  { loc: "/mentions-legales", changefreq: "yearly", priority: 0.5 },
  { loc: "/beta-feedback", changefreq: "monthly", priority: 0.4 },
];

function buildSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${e.lastmod || today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const xml = buildSitemap(PUBLIC_ROUTES);

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate sitemap" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
