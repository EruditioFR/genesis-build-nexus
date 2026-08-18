import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

type SiteEntry = { siteUrl: string; permissionLevel?: string };

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    const prefix = new URL(siteUrl);
    return target.href.startsWith(prefix.href);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Non autorisé' }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) return json({ error: 'Non autorisé' }, 401);

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleData) return json({ error: 'Accès refusé - Admin requis' }, 403);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const connectionApiKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
    if (!lovableApiKey || !connectionApiKey) {
      return json({ error: 'Connexion Google Search Console indisponible' }, 503);
    }
    const headers = {
      Authorization: `Bearer ${lovableApiKey}`,
      'X-Connection-Api-Key': connectionApiKey,
    };

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const targetUrl: string = body.targetUrl || 'https://www.familygarden.fr/';
    const days: number = Math.min(Math.max(Number(body.days) || 28, 7), 180);
    const selectedSiteUrl: string | undefined = body.siteUrl;

    // 1. List verified properties (always, at runtime)
    const sitesRes = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
    if (!sitesRes.ok) {
      const details = await sitesRes.text();
      console.error(`GSC /sites failed [${sitesRes.status}]: ${details}`);
      return json({ error: 'Impossible de lister les propriétés', status: sitesRes.status, details }, sitesRes.status);
    }
    const { siteEntry = [] } = await sitesRes.json() as { siteEntry?: SiteEntry[] };
    const target = new URL(targetUrl);
    const matches = siteEntry.filter(
      (e) => e.permissionLevel !== 'siteUnverifiedUser' && coversTarget(e.siteUrl, target),
    );

    if (matches.length === 0) {
      return json({ status: 'no_property', candidates: [] });
    }

    let siteUrl: string;
    if (selectedSiteUrl) {
      const found = matches.find((m) => m.siteUrl === selectedSiteUrl);
      if (!found) return json({ error: 'Propriété non vérifiée pour ce site' }, 403);
      siteUrl = found.siteUrl;
    } else if (matches.length === 1) {
      siteUrl = matches[0].siteUrl;
    } else {
      return json({ status: 'selection_required', candidates: matches.map((m) => m.siteUrl) });
    }

    const end = new Date(Date.now() - 2 * 86400000);
    const start = new Date(end.getTime() - days * 86400000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const query = async (dimensions: string[], rowLimit = 25) => {
      const res = await fetch(
        `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: fmt(start),
            endDate: fmt(end),
            dimensions,
            rowLimit,
          }),
        },
      );
      if (!res.ok) {
        const details = await res.text();
        console.error(`GSC query ${dimensions.join(',')} failed [${res.status}]: ${details}`);
        throw new Error(`[${res.status}]: ${details}`);
      }
      const data = await res.json();
      return (data.rows ?? []) as Array<{
        keys: string[]; clicks: number; impressions: number; ctr: number; position: number;
      }>;
    };

    const [totals, byDate, byQuery, byPage, byCountry, byDevice] = await Promise.all([
      query([], 1),
      query(['date'], 200),
      query(['query'], 50),
      query(['page'], 30),
      query(['country'], 15),
      query(['device'], 5),
    ]);

    // Sitemaps status (non-blocking)
    let sitemaps: unknown[] = [];
    try {
      const smRes = await fetch(
        `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
        { headers },
      );
      if (smRes.ok) {
        const smData = await smRes.json();
        sitemaps = smData.sitemap ?? [];
      }
    } catch (_) { /* ignore */ }

    return json({
      status: 'ok',
      siteUrl,
      candidates: matches.map((m) => m.siteUrl),
      range: { startDate: fmt(start), endDate: fmt(end), days },
      totals: totals[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0, keys: [] },
      byDate,
      byQuery,
      byPage,
      byCountry,
      byDevice,
      sitemaps,
      refreshedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('seo-search-console error:', e);
    return json({ error: e instanceof Error ? e.message : 'Erreur inconnue' }, 500);
  }
});
