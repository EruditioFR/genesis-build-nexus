import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://familygarden.fr";

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
  
  { loc: "/faq", changefreq: "monthly", priority: 0.7 },
  { loc: "/about", changefreq: "monthly", priority: 0.7 },
  { loc: "/marketing", changefreq: "monthly", priority: 0.8 },
  { loc: "/blog", changefreq: "weekly", priority: 0.7 },
  { loc: "/privacy", changefreq: "yearly", priority: 0.5 },
  { loc: "/terms", changefreq: "yearly", priority: 0.5 },
  { loc: "/cgv", changefreq: "yearly", priority: 0.5 },
  { loc: "/mentions-legales", changefreq: "yearly", priority: 0.5 },
  
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
    const entries: SitemapEntry[] = [...PUBLIC_ROUTES];

    // Articles de blog (toutes langues) ajoutés dynamiquement
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("status", "published");

      for (const post of posts ?? []) {
        entries.push({
          loc: `/blog/${post.slug}`,
          changefreq: "monthly",
          priority: 0.8,
          lastmod: (post.updated_at ?? post.published_at ?? today).toString().split("T")[0],
        });
      }
    } catch (e) {
      console.error("Blog posts fetch failed", e);
    }

    const xml = buildSitemap(entries);

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
