import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquareHeart, Star, Users, TrendingUp, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const FEATURE_LABELS: Record<string, string> = {
  memory_creation: "Création souvenirs",
  navigation: "Navigation",
  timeline: "Timeline",
  circles: "Cercles de partage",
  family_tree: "Arbre généalogique",
  categories: "Catégories",
  search: "Recherche",
  story_mode: "Mode Story",
  profile: "Profil",
  notifications: "Notifications",
  inspirations: "Inspirations",
};

const UX_LABELS: Record<string, string> = {
  ease_of_use: "Prise en main",
  design: "Design",
  speed: "Rapidité",
  clarity: "Clarté",
  mobile: "Mobile",
  signup: "Inscription",
  media_upload: "Upload médias",
};

interface FeedbackRow {
  id: string;
  user_id: string;
  feature_ratings: Record<string, number>;
  ux_ratings: Record<string, number>;
  general_opinion: string | null;
  issues_encountered: string | null;
  feature_suggestions: string | null;
  would_recommend: boolean | null;
  recommend_reason: string | null;
  created_at: string;
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [feedbackRes, profilesRes] = await Promise.all([
      supabase.from("beta_feedback").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);

    setFeedbacks((feedbackRes.data as any[]) || []);

    const profileMap: Record<string, string> = {};
    (profilesRes.data || []).forEach((p) => {
      profileMap[p.user_id] = p.display_name || "Utilisateur";
    });
    setProfiles(profileMap);
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (feedbacks.length === 0) return null;

    // Average feature ratings
    const featureAvg: Record<string, { sum: number; count: number }> = {};
    const uxAvg: Record<string, { sum: number; count: number }> = {};

    feedbacks.forEach((f) => {
      if (f.feature_ratings) {
        Object.entries(f.feature_ratings).forEach(([key, val]) => {
          if (!featureAvg[key]) featureAvg[key] = { sum: 0, count: 0 };
          featureAvg[key].sum += val as number;
          featureAvg[key].count += 1;
        });
      }
      if (f.ux_ratings) {
        Object.entries(f.ux_ratings).forEach(([key, val]) => {
          if (!uxAvg[key]) uxAvg[key] = { sum: 0, count: 0 };
          uxAvg[key].sum += val as number;
          uxAvg[key].count += 1;
        });
      }
    });

    const featureData = Object.entries(featureAvg).map(([key, { sum, count }]) => ({
      name: FEATURE_LABELS[key] || key,
      avg: parseFloat((sum / count).toFixed(2)),
      fullMark: 5,
    }));

    const uxData = Object.entries(uxAvg).map(([key, { sum, count }]) => ({
      name: UX_LABELS[key] || key,
      avg: parseFloat((sum / count).toFixed(2)),
      fullMark: 5,
    }));

    const recommendYes = feedbacks.filter((f) => f.would_recommend === true).length;
    const recommendNo = feedbacks.filter((f) => f.would_recommend === false).length;
    const recommendTotal = recommendYes + recommendNo;

    const globalAvg = [...Object.values(featureAvg), ...Object.values(uxAvg)].reduce(
      (acc, { sum, count }) => ({ sum: acc.sum + sum, count: acc.count + count }),
      { sum: 0, count: 0 }
    );

    return {
      totalResponses: feedbacks.length,
      globalAverage: globalAvg.count > 0 ? (globalAvg.sum / globalAvg.count).toFixed(1) : "—",
      recommendRate: recommendTotal > 0 ? Math.round((recommendYes / recommendTotal) * 100) : null,
      featureData,
      uxData,
      recommendYes,
      recommendNo,
    };
  }, [feedbacks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Évaluations Beta</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-12 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <MessageSquareHeart className="h-6 w-6 text-secondary" />
          Évaluations Beta
        </h1>
        <Badge variant="outline">{feedbacks.length} réponse{feedbacks.length > 1 ? "s" : ""}</Badge>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquareHeart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune évaluation pour le moment</h2>
            <p className="text-muted-foreground">Les retours des beta testeurs apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Réponses totales</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalResponses}</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Note globale moyenne</CardTitle>
                  <Star className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.globalAverage}<span className="text-lg text-muted-foreground">/5</span></div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taux de recommandation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats?.recommendRate !== null ? `${stats?.recommendRate}%` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.recommendYes} oui · {stats?.recommendNo} non
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Feature Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fonctionnalités (moyenne)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.featureData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={stats.featureData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                      <Radar name="Moyenne" dataKey="avg" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Pas de données</div>
                )}
              </CardContent>
            </Card>

            {/* UX Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expérience utilisateur (moyenne)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.uxData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stats.uxData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)}/5`, "Moyenne"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Pas de données</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Individual Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Réponses individuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedbacks.map((fb) => {
                const isExpanded = expandedId === fb.id;
                const name = profiles[fb.user_id] || "Utilisateur";
                const featureCount = Object.keys(fb.feature_ratings || {}).length;
                const uxCount = Object.keys(fb.ux_ratings || {}).length;
                const allRatings = [...Object.values(fb.feature_ratings || {}), ...Object.values(fb.ux_ratings || {})];
                const avg = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + (b as number), 0) / allRatings.length).toFixed(1) : "—";

                return (
                  <div key={fb.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Star className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(fb.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">{avg}/5</Badge>
                        <Badge variant="outline" className="text-xs">{featureCount + uxCount} notes</Badge>
                        {fb.would_recommend === true && <Badge className="bg-green-500/10 text-green-600 text-xs">👍</Badge>}
                        {fb.would_recommend === false && <Badge className="bg-red-500/10 text-red-600 text-xs">👎</Badge>}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t p-4 space-y-4 bg-muted/30">
                        {/* Feature ratings */}
                        {featureCount > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Fonctionnalités</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(fb.feature_ratings).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between text-sm bg-background rounded px-3 py-1.5">
                                  <span className="text-muted-foreground truncate mr-2">{FEATURE_LABELS[key] || key}</span>
                                  <span className="font-semibold flex items-center gap-1">
                                    {val as number} <Star className="w-3 h-3 text-secondary fill-secondary" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* UX ratings */}
                        {uxCount > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Expérience UX</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(fb.ux_ratings).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between text-sm bg-background rounded px-3 py-1.5">
                                  <span className="text-muted-foreground truncate mr-2">{UX_LABELS[key] || key}</span>
                                  <span className="font-semibold flex items-center gap-1">
                                    {val as number} <Star className="w-3 h-3 text-secondary fill-secondary" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Open feedback */}
                        {fb.general_opinion && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">💬 Avis général</p>
                            <p className="text-sm bg-background rounded p-3">{fb.general_opinion}</p>
                          </div>
                        )}
                        {fb.issues_encountered && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">🐛 Problèmes</p>
                            <p className="text-sm bg-background rounded p-3">{fb.issues_encountered}</p>
                          </div>
                        )}
                        {fb.feature_suggestions && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">💡 Suggestions</p>
                            <p className="text-sm bg-background rounded p-3">{fb.feature_suggestions}</p>
                          </div>
                        )}
                        {fb.recommend_reason && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">❤️ Recommandation</p>
                            <p className="text-sm bg-background rounded p-3">{fb.recommend_reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
