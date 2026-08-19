import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MousePointerClick, Eye, Percent, TrendingUp, RefreshCw,
  AlertTriangle, Lightbulb, FileText, Globe, Smartphone, Wand2, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Row {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SeoData {
  status: string;
  siteUrl?: string;
  candidates?: string[];
  range?: { startDate: string; endDate: string; days: number };
  totals?: Omit<Row, "keys"> & { keys?: string[] };
  byDate?: Row[];
  byQuery?: Row[];
  byPage?: Row[];
  byCountry?: Row[];
  byDevice?: Row[];
  sitemaps?: Array<{
    path: string;
    lastSubmitted?: string;
    errors?: string;
    warnings?: string;
    isPending?: boolean;
    lastDownloaded?: string;
    contents?: Array<{ type: string; submitted: string; indexed?: string }>;
  }>;
  refreshedAt?: string;
}

const num = (n: number | undefined) =>
  (n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 });
const pct = (n: number | undefined) => `${((n ?? 0) * 100).toFixed(1)} %`;
const pos = (n: number | undefined) => (n ?? 0).toFixed(1);

interface Reco {
  title: string;
  detail: string;
  level: "critique" | "important" | "opportunité";
}

function buildRecommendations(data: SeoData | null): Reco[] {
  const recos: Reco[] = [];
  if (!data || data.status !== "ok") return recos;

  const totals = data.totals;
  const queries = data.byQuery ?? [];
  const pages = data.byPage ?? [];

  // Requêtes en page 2-3 : quick wins
  const nearWins = queries.filter((q) => q.position > 10 && q.position <= 25 && q.impressions >= 20);
  if (nearWins.length) {
    recos.push({
      level: "opportunité",
      title: `${nearWins.length} requête(s) en position 11-25 à faire remonter`,
      detail: `Créez ou enrichissez un contenu dédié pour : ${nearWins.slice(0, 5).map((q) => `« ${q.keys[0]} »`).join(", ")}. Ajoutez le terme exact dans le H1, le title et un paragraphe d'introduction.`,
    });
  }

  // Fortes impressions, faible CTR
  const lowCtr = queries.filter((q) => q.impressions >= 50 && q.ctr < 0.02 && q.position <= 15);
  if (lowCtr.length) {
    recos.push({
      level: "important",
      title: `${lowCtr.length} requête(s) très vues mais peu cliquées`,
      detail: `Réécrivez le <title> et la meta description des pages ciblées par : ${lowCtr.slice(0, 4).map((q) => `« ${q.keys[0]} »`).join(", ")}. Ajoutez un bénéfice concret et le prix (2,99 €/mois) dans la description.`,
    });
  }

  // Pas ou peu de données
  if ((totals?.impressions ?? 0) < 100) {
    recos.push({
      level: "critique",
      title: "Volume d'impressions encore très faible",
      detail: "Le site est jeune aux yeux de Google. Publiez 1 article de blog par semaine sur les mots-clés cibles (capsule temporelle, journal de famille, arbre généalogique en ligne) et partagez-les pour générer des premiers liens entrants.",
    });
  }

  // Position moyenne
  if ((totals?.position ?? 0) > 20) {
    recos.push({
      level: "important",
      title: `Position moyenne à ${pos(totals?.position)} — hors de la première page`,
      detail: "Concentrez le maillage interne sur 3 pages piliers maximum plutôt que de diluer l'autorité. Chaque article de blog doit pointer vers la page d'accueil et vers la page tarifs avec une ancre descriptive.",
    });
  }

  // Concentration des pages
  const homeOnly = pages.length > 0 && pages.length <= 2;
  if (homeOnly) {
    recos.push({
      level: "important",
      title: "Le trafic repose sur très peu de pages",
      detail: "Seules quelques URL reçoivent des impressions. Vérifiez l'indexation du blog et des pages FAQ / tarifs, et renforcez leur maillage depuis l'accueil.",
    });
  }

  // Sitemaps
  const sitemaps = data.sitemaps ?? [];
  if (sitemaps.length === 0) {
    recos.push({
      level: "critique",
      title: "Aucun sitemap détecté dans Search Console",
      detail: "Soumettez https://familygarden.fr/sitemap.xml dans Search Console pour accélérer la découverte des articles traduits.",
    });
  } else {
    const withErrors = sitemaps.filter((s) => Number(s.errors ?? 0) > 0);
    if (withErrors.length) {
      recos.push({
        level: "critique",
        title: "Search Console signale des erreurs de sitemap",
        detail: `Sitemap(s) concerné(s) : ${withErrors.map((s) => s.path).join(", ")}. Search Console indique un nombre d'erreurs sans en préciser la cause ; ouvrez le rapport Sitemaps pour le détail exact.`,
      });
    }
    const stale = sitemaps.filter((s) => {
      if (!s.lastDownloaded) return false;
      return Date.now() - new Date(s.lastDownloaded).getTime() > 30 * 86400000;
    });
    if (stale.length) {
      recos.push({
        level: "important",
        title: "Google n'a pas relu le sitemap depuis plus de 30 jours",
        detail: `Dernière lecture : ${stale.map((s) => s.lastDownloaded?.slice(0, 10)).join(", ")}. Resoumettez le sitemap à son adresse directe (sans redirection www → domaine principal) et vérifiez qu'il renvoie bien un XML en HTTP 200.`,
      });
    }
  }

  // Langues
  const countries = data.byCountry ?? [];
  const nonFr = countries.filter((c) => c.keys[0] !== "fra");
  if (countries.length > 0 && nonFr.length === 0) {
    recos.push({
      level: "opportunité",
      title: "Aucune visibilité hors de France",
      detail: "Les 6 versions traduites ne captent pas encore de trafic. Ajoutez des balises hreflang et des liens internes entre versions linguistiques pour aider Google à les associer.",
    });
  }

  // Toujours utile
  recos.push({
    level: "opportunité",
    title: "Renforcer les contenus longs sur les mots-clés cibles",
    detail: "« capsule temporelle » (2 900 rech./mois), « arbre généalogique en ligne » (880), « raconter sa vie à ses enfants » (90). Un guide de 1 200+ mots par terme, avec FAQ structurée, maximise les chances de positionnement.",
  });
  recos.push({
    level: "opportunité",
    title: "Obtenir des liens entrants qualifiés",
    detail: "Annuaires familles/généalogie, blogs de généalogie, forums spécialisés et articles invités : 5 à 10 liens thématiques feraient plus progresser le domaine que 10 pages supplémentaires.",
  });

  return recos;
}

function buildPrompt(r: Reco, data: SeoData | null): string {
  const ctx = data?.range
    ? `Contexte Search Console (${data.range.startDate} → ${data.range.endDate}, propriété ${data.siteUrl}) : ${num(data.totals?.clicks)} clics, ${num(data.totals?.impressions)} impressions, CTR ${pct(data.totals?.ctr)}, position moyenne ${pos(data.totals?.position)}.`
    : "";
  return [
    "Applique cette correction SEO sur le site Family Garden :",
    "",
    `Problème : ${r.title}`,
    `Action attendue : ${r.detail}`,
    "",
    ctx,
    "",
    "Modifie directement le code (contenus, balises title/meta, JSON-LD, maillage interne, sitemap, articles de blog) et respecte les 7 langues du site ainsi que la charte éditoriale existante (vouvoiement, terminologie « souvenirs », « journal de famille privé »).",
  ].filter(Boolean).join("\n");
}

const levelStyles: Record<Reco["level"], string> = {
  critique: "bg-destructive/10 text-destructive border-destructive/30",
  important: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  opportunité: "bg-primary/10 text-primary border-primary/30",
};

export default function AdminSEO() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<"28" | "90" | "180">("28");
  const [siteUrl, setSiteUrl] = useState<string | undefined>();

  const load = async (selected?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("seo-search-console", {
        body: { days: Number(days), siteUrl: selected ?? siteUrl },
      });
      if (fnError) throw fnError;
      setData(res as SeoData);
      if ((res as SeoData).siteUrl) setSiteUrl((res as SeoData).siteUrl);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur inconnue";
      setError(message);
      toast.error("Impossible de charger les données Search Console");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const chartData = useMemo(
    () =>
      (data?.byDate ?? []).map((r) => ({
        date: r.keys[0],
        clics: r.clicks,
        impressions: r.impressions,
      })),
    [data],
  );

  const recos = useMemo(() => buildRecommendations(data), [data]);
  const [appliedTitle, setAppliedTitle] = useState<string | null>(null);

  const applyReco = async (r: Reco) => {
    const prompt = buildPrompt(r, data);
    try {
      await navigator.clipboard.writeText(prompt);
      setAppliedTitle(r.title);
      setTimeout(() => setAppliedTitle((t) => (t === r.title ? null : t)), 4000);
      toast.success("Instruction copiée", {
        description: "Collez-la dans le chat Lovable pour lancer la correction.",
      });
    } catch {
      toast.error("Copie impossible", { description: prompt.slice(0, 120) + "…" });
    }
  };

  const kpis = [
    { label: "Clics", value: num(data?.totals?.clicks), icon: MousePointerClick },
    { label: "Impressions", value: num(data?.totals?.impressions), icon: Eye },
    { label: "CTR moyen", value: pct(data?.totals?.ctr), icon: Percent },
    { label: "Position moyenne", value: pos(data?.totals?.position), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Tableau de bord SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Données Google Search Console
            {data?.siteUrl ? ` — ${data.siteUrl}` : ""}
            {data?.range ? ` (${data.range.startDate} → ${data.range.endDate})` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={days} onValueChange={(v) => setDays(v as typeof days)}>
            <TabsList>
              <TabsTrigger value="28">28 j</TabsTrigger>
              <TabsTrigger value="90">3 mois</TabsTrigger>
              <TabsTrigger value="180">6 mois</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium">Connexion Search Console indisponible</p>
              <p className="text-muted-foreground break-words">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.status === "selection_required" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Choisissez une propriété</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.candidates?.map((c) => (
              <Button key={c} variant="outline" size="sm" onClick={() => { setSiteUrl(c); load(c); }}>
                {c}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {data?.status === "no_property" && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Aucune propriété Search Console vérifiée ne couvre familygarden.fr sur le compte connecté.
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                  <k.icon className="h-4 w-4 text-primary" />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{k.value}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Courbe */}
      <Card>
        <CardHeader><CardTitle className="text-base">Évolution clics / impressions</CardTitle></CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée sur la période.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area yAxisId="right" type="monotone" dataKey="impressions" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" />
                <Area yAxisId="left" type="monotone" dataKey="clics" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Requêtes & pages */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" />Requêtes principales</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-3">Requête</th>
                    <th className="text-right p-3">Clics</th>
                    <th className="text-right p-3">Impr.</th>
                    <th className="text-right p-3">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byQuery ?? []).map((r) => (
                    <tr key={r.keys[0]} className="border-b border-border/50">
                      <td className="p-3 break-words max-w-[220px]">{r.keys[0]}</td>
                      <td className="p-3 text-right">{num(r.clicks)}</td>
                      <td className="p-3 text-right">{num(r.impressions)}</td>
                      <td className="p-3 text-right">{pos(r.position)}</td>
                    </tr>
                  ))}
                  {!loading && (data?.byQuery ?? []).length === 0 && (
                    <tr><td className="p-3 text-muted-foreground" colSpan={4}>Aucune requête remontée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Pages principales</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-3">Page</th>
                    <th className="text-right p-3">Clics</th>
                    <th className="text-right p-3">Impr.</th>
                    <th className="text-right p-3">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byPage ?? []).map((r) => (
                    <tr key={r.keys[0]} className="border-b border-border/50">
                      <td className="p-3 break-all max-w-[220px] text-xs">{r.keys[0].replace(/^https?:\/\/[^/]+/, "") || "/"}</td>
                      <td className="p-3 text-right">{num(r.clicks)}</td>
                      <td className="p-3 text-right">{num(r.impressions)}</td>
                      <td className="p-3 text-right">{pos(r.position)}</td>
                    </tr>
                  ))}
                  {!loading && (data?.byPage ?? []).length === 0 && (
                    <tr><td className="p-3 text-muted-foreground" colSpan={4}>Aucune page remontée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pays / appareils / sitemaps */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Pays</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.byCountry ?? []).slice(0, 8).map((r) => (
              <div key={r.keys[0]} className="flex justify-between">
                <span className="uppercase text-muted-foreground">{r.keys[0]}</span>
                <span>{num(r.clicks)} clics · {num(r.impressions)} impr.</span>
              </div>
            ))}
            {!loading && (data?.byCountry ?? []).length === 0 && <p className="text-muted-foreground">—</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" />Appareils</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.byDevice ?? []).map((r) => (
              <div key={r.keys[0]} className="flex justify-between">
                <span className="capitalize text-muted-foreground">{r.keys[0].toLowerCase()}</span>
                <span>{num(r.clicks)} clics · {pct(r.ctr)}</span>
              </div>
            ))}
            {!loading && (data?.byDevice ?? []).length === 0 && <p className="text-muted-foreground">—</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Sitemaps</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(data?.sitemaps ?? []).map((s) => (
              <div key={s.path} className="space-y-1">
                <p className="break-all text-xs">{s.path.replace(/^https?:\/\/[^/]+/, "")}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{Number(s.errors ?? 0)} erreur(s)</Badge>
                  <Badge variant="outline">{Number(s.warnings ?? 0)} avertissement(s)</Badge>
                  {s.contents?.[0] && (
                    <Badge variant="outline">{num(Number(s.contents[0].submitted ?? 0))} URL découvertes</Badge>
                  )}
                  {s.lastDownloaded && (
                    <Badge variant="outline">Lu le {s.lastDownloaded.slice(0, 10)}</Badge>
                  )}
                </div>
              </div>
            ))}
            {!loading && (data?.sitemaps ?? []).length === 0 && (
              <p className="text-muted-foreground">Aucun sitemap soumis.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Recommandations SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <Skeleton className="h-24 w-full" />}
          {!loading && recos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Les recommandations s'affichent dès que les données Search Console sont disponibles.
            </p>
          )}
          {recos.map((r) => (
            <div key={r.title} className={`rounded-lg border p-3 ${levelStyles[r.level]}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm">{r.title}</p>
                <Badge variant="outline" className="shrink-0 capitalize">{r.level}</Badge>
              </div>
              <p className="text-sm text-foreground/80 mt-1">{r.detail}</p>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => applyReco(r)}
                  className="gap-2"
                >
                  {appliedTitle === r.title ? <Check className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                  {appliedTitle === r.title ? "Instruction copiée" : "Appliquer"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
