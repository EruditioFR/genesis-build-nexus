import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyStats {
  date: string;
  users: number;
  capsules: number;
}

interface TypeDistribution {
  name: string;
  value: number;
  color: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10B981", "#F59E0B", "#6366F1"];

export default function AdminStats() {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<TypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    const days = parseInt(period);
    const startDate = subDays(new Date(), days);
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

    // Fetch profiles and capsules
    const [profilesResult, capsulesResult] = await Promise.all([
      supabase.from("profiles").select("created_at"),
      supabase.from("capsules").select("created_at, capsule_type, status"),
    ]);

    const profiles = profilesResult.data || [];
    const capsules = capsulesResult.data || [];

    // Calculate daily stats
    const daily = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const usersCount = profiles.filter(
        (p) => format(new Date(p.created_at), "yyyy-MM-dd") === dateStr
      ).length;
      const capsulesCount = capsules.filter(
        (c) => format(new Date(c.created_at), "yyyy-MM-dd") === dateStr
      ).length;

      return {
        date: format(date, "d MMM", { locale: fr }),
        users: usersCount,
        capsules: capsulesCount,
      };
    });

    setDailyStats(daily);

    // Calculate type distribution
    const typeCounts: Record<string, number> = {};
    capsules.forEach((c) => {
      typeCounts[c.capsule_type] = (typeCounts[c.capsule_type] || 0) + 1;
    });

    const typeLabels: Record<string, string> = {
      text: "Texte",
      photo: "Photo",
      video: "Vidéo",
      audio: "Audio",
      mixed: "Mixte",
    };

    setTypeDistribution(
      Object.entries(typeCounts).map(([key, value], i) => ({
        name: typeLabels[key] || key,
        value,
        color: COLORS[i % COLORS.length],
      }))
    );

    // Calculate status distribution
    const statusCounts: Record<string, number> = {};
    capsules.forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      draft: "Brouillon",
      published: "Publiée",
      scheduled: "Programmée",
      archived: "Archivée",
    };

    setStatusDistribution(
      Object.entries(statusCounts).map(([key, value], i) => ({
        name: statusLabels[key] || key,
        value,
        color: COLORS[i % COLORS.length],
      }))
    );

    setLoading(false);
  };

  const totalNewUsers = dailyStats.reduce((acc, d) => acc + d.users, 0);
  const totalNewCapsules = dailyStats.reduce((acc, d) => acc + d.capsules, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Statistiques</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}>
          <TabsList>
            <TabsTrigger value="7">7 jours</TabsTrigger>
            <TabsTrigger value="30">30 jours</TabsTrigger>
            <TabsTrigger value="90">90 jours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nouveaux utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewUsers}</div>
            <p className="text-xs text-muted-foreground">
              Sur les {period} derniers jours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nouvelles capsules
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewCapsules}</div>
            <p className="text-xs text-muted-foreground">
              Sur les {period} derniers jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activité quotidienne
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Utilisateurs"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
                <Area
                  type="monotone"
                  dataKey="capsules"
                  name="Capsules"
                  stroke="hsl(142 76% 36%)"
                  fill="hsl(142 76% 36% / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Types de capsules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] bg-muted animate-pulse rounded" />
            ) : typeDistribution.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Pas de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statuts des capsules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] bg-muted animate-pulse rounded" />
            ) : statusDistribution.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Pas de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" name="Capsules">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
