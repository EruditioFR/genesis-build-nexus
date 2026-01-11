import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, MessageSquare, HardDrive, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCapsules: number;
  publishedCapsules: number;
  draftCapsules: number;
  totalComments: number;
  totalStorageUsed: number;
  recentSignups: number;
  premiumUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch all stats in parallel
    const [
      profilesResult,
      capsulesResult,
      commentsResult,
      mediasResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("capsules").select("*"),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("capsule_medias").select("file_size_bytes"),
    ]);

    const profiles = profilesResult.data || [];
    const capsules = capsulesResult.data || [];
    const medias = mediasResult.data || [];

    // Calculate real storage from media files
    const totalStorageBytes = medias.reduce((acc, m) => acc + (m.file_size_bytes || 0), 0);
    const totalStorageMb = totalStorageBytes / (1024 * 1024);

    // Calculate date for recent signups (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats: Stats = {
      totalUsers: profiles.length,
      activeUsers: profiles.filter((p) => !p.suspended).length,
      suspendedUsers: profiles.filter((p) => p.suspended).length,
      totalCapsules: capsules.length,
      publishedCapsules: capsules.filter((c) => c.status === "published").length,
      draftCapsules: capsules.filter((c) => c.status === "draft").length,
      totalComments: commentsResult.count || 0,
      totalStorageUsed: totalStorageMb,
      recentSignups: profiles.filter((p) => new Date(p.created_at) > weekAgo).length,
      premiumUsers: profiles.filter((p) => p.subscription_level === "premium").length,
    };

    setStats(stats);
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Dashboard Admin</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      description: `${stats.activeUsers} actifs`,
      color: "text-blue-500",
    },
    {
      title: "Capsules",
      value: stats.totalCapsules,
      icon: FileText,
      description: `${stats.publishedCapsules} publiées`,
      color: "text-green-500",
    },
    {
      title: "Commentaires",
      value: stats.totalComments,
      icon: MessageSquare,
      description: "Total",
      color: "text-purple-500",
    },
    {
      title: "Stockage",
      value: `${(stats.totalStorageUsed / 1024).toFixed(1)} GB`,
      icon: HardDrive,
      description: "Utilisé",
      color: "text-orange-500",
    },
    {
      title: "Inscriptions récentes",
      value: stats.recentSignups,
      icon: TrendingUp,
      description: "7 derniers jours",
      color: "text-emerald-500",
    },
    {
      title: "Brouillons",
      value: stats.draftCapsules,
      icon: Clock,
      description: "En attente",
      color: "text-amber-500",
    },
    {
      title: "Premium",
      value: stats.premiumUsers,
      icon: Users,
      description: "Abonnés",
      color: "text-primary",
    },
    {
      title: "Suspendus",
      value: stats.suspendedUsers,
      icon: AlertTriangle,
      description: "Comptes",
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Dashboard Admin</h1>
        <Badge variant="outline" className="text-xs">
          Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick alerts */}
      {stats.suspendedUsers > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Comptes suspendus</p>
                <p className="text-sm text-muted-foreground">
                  {stats.suspendedUsers} compte(s) sont actuellement suspendus
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
