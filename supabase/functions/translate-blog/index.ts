import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Spain)",
  it: "Italian",
  pt: "Portuguese (Portugal)",
  ko: "Korean",
  zh: "Simplified Chinese",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lang } = await req.json();
    if (!lang || !LANG_NAMES[lang]) {
      return new Response(JSON.stringify({ error: "Invalid lang" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: sources, error: srcError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, meta_title, meta_description, category_id, cover_image_url, status, translation_group")
      .eq("lang", "fr");

    if (srcError) throw srcError;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const results: unknown[] = [];

    for (const post of sources ?? []) {
      const group = post.translation_group ?? post.slug;

      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("lang", lang)
        .eq("translation_group", group)
        .maybeSingle();

      if (existing) {
        results.push({ group, skipped: true });
        continue;
      }

      const prompt = `You are a native ${LANG_NAMES[lang]} SEO copywriter for "Family Garden", an online private family journal service (photos, videos, voice recordings, stories, digital time capsule, online family tree).

Translate and localize the following French blog article into ${LANG_NAMES[lang]}. Keep the exact same markdown structure, headings and length. Adapt idioms naturally, keep the brand name "Family Garden" unchanged, use the polite form of address, and use the natural local SEO keywords of the target language (e.g. "digital time capsule", "family journal", "online family tree" equivalents). Do not mention translation. Prices stay 2,99 EUR/month and the family tree add-on 5 EUR/month.

Return STRICT JSON only, no markdown fence, with keys:
{"title": string, "slug": string (lowercase ascii-safe kebab-case slug in the target language, 3-8 words, for Korean/Chinese use a romanized/English keyword slug), "excerpt": string (max 200 chars), "meta_title": string (max 60 chars, ending with " | Family Garden"), "meta_description": string (max 155 chars), "content": string (full markdown article)}

FRENCH ARTICLE
Title: ${post.title}
Excerpt: ${post.excerpt ?? ""}
Meta title: ${post.meta_title ?? ""}
Meta description: ${post.meta_description ?? ""}
Content:
${post.content ?? ""}`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!aiRes.ok) {
        const body = await aiRes.text();
        console.error(`AI error [${aiRes.status}]: ${body}`);
        return new Response(
          JSON.stringify({ error: "AI request failed", status: aiRes.status, details: body }),
          { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const aiJson = await aiRes.json();
      let raw: string = aiJson.choices?.[0]?.message?.content ?? "";
      raw = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_e) {
        console.error("Parse failure for", group, raw.slice(0, 300));
        results.push({ group, error: "parse_failed" });
        continue;
      }

      const slug = `${String(parsed.slug).replace(/[^a-z0-9-]/gi, "-").toLowerCase()}-${lang}`;

      const { error: insErr } = await supabase.from("blog_posts").insert({
        slug,
        lang,
        translation_group: group,
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        meta_title: parsed.meta_title,
        meta_description: parsed.meta_description,
        category_id: post.category_id,
        cover_image_url: post.cover_image_url,
        status: post.status ?? "published",
        published_at: new Date().toISOString(),
      });

      if (insErr) {
        console.error("Insert error", insErr);
        results.push({ group, error: insErr.message });
      } else {
        results.push({ group, slug, ok: true });
      }
    }

    return new Response(JSON.stringify({ lang, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
