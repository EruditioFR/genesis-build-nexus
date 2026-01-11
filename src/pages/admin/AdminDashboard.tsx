import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, MessageSquare, HardDrive, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCapsules: number;
  publishedCapsules: number;
  draftCapsules: number;
  totalComments: number;
  totalStorageUsed: number;
  capsuleStorageMb: number;
  familyStorageMb: number;
  recentSignups: number;
  premiumUsers: number;
}

interface StorageDataPoint {
  date: string;
  storage: number;
  capsuleStorage: number;
  familyStorage: number;
}

interface UserStorageData {
  userId: string;
  displayName: string;
  storageMb: number;
  capsuleStorageMb: number;
  familyStorageMb: number;
  storageLimitMb: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [storageHistory, setStorageHistory] = useState<StorageDataPoint[]>([]);
  const [userStorage, setUserStorage] = useState<UserStorageData[]>([]);
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
      capsuleMediasResult,
      familyMediasResult,
      familyTreesResult,
      familyPersonsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("capsules").select("*"),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("capsule_medias").select("file_size_bytes, created_at, capsule_id"),
      supabase.from("family_person_media").select("file_size_bytes, created_at, person_id"),
      supabase.from("family_trees").select("id, user_id"),
      supabase.from("family_persons").select("id, tree_id"),
    ]);

    const profiles = profilesResult.data || [];
    const capsules = capsulesResult.data || [];
    const capsuleMedias = capsuleMediasResult.data || [];
    const familyMedias = familyMediasResult.data || [];
    const familyTrees = familyTreesResult.data || [];
    const familyPersons = familyPersonsResult.data || [];

    // Create lookup maps for user association
    const capsuleToUser = new Map(capsules.map(c => [c.id, c.user_id]));
    const personToTree = new Map(familyPersons.map(p => [p.id, p.tree_id]));
    const treeToUser = new Map(familyTrees.map(t => [t.id, t.user_id]));

    // Calculate storage per user
    const userStorageMap = new Map<string, { capsule: number; family: number }>();
    
    // Add capsule media storage per user
    capsuleMedias.forEach(media => {
      const userId = capsuleToUser.get(media.capsule_id);
      if (userId) {
        const current = userStorageMap.get(userId) || { capsule: 0, family: 0 };
        current.capsule += media.file_size_bytes || 0;
        userStorageMap.set(userId, current);
      }
    });

    // Add family media storage per user
    familyMedias.forEach(media => {
      const treeId = personToTree.get(media.person_id);
      const userId = treeId ? treeToUser.get(treeId) : null;
      if (userId) {
        const current = userStorageMap.get(userId) || { capsule: 0, family: 0 };
        current.family += Number(media.file_size_bytes) || 0;
        userStorageMap.set(userId, current);
      }
    });

    // Build user storage data with profile info
    const userStorageData: UserStorageData[] = profiles
      .map(profile => {
        const storage = userStorageMap.get(profile.user_id) || { capsule: 0, family: 0 };
        return {
          userId: profile.user_id,
          displayName: profile.display_name || "Utilisateur",
          storageMb: (storage.capsule + storage.family) / (1024 * 1024),
          capsuleStorageMb: storage.capsule / (1024 * 1024),
          familyStorageMb: storage.family / (1024 * 1024),
          storageLimitMb: profile.storage_limit_mb || 500,
        };
      })
      .filter(u => u.storageMb > 0)
      .sort((a, b) => b.storageMb - a.storageMb)
      .slice(0, 10);

    setUserStorage(userStorageData);

    // Calculate real storage from media files
    const capsuleStorageBytes = capsuleMedias.reduce((acc, m) => acc + (m.file_size_bytes || 0), 0);
    const familyStorageBytes = familyMedias.reduce((acc, m) => acc + (Number(m.file_size_bytes) || 0), 0);
    const totalStorageBytes = capsuleStorageBytes + familyStorageBytes;
    const totalStorageMb = totalStorageBytes / (1024 * 1024);
    const capsuleStorageMb = capsuleStorageBytes / (1024 * 1024);
    const familyStorageMb = familyStorageBytes / (1024 * 1024);

    // Calculate storage history (last 30 days)
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    const history: StorageDataPoint[] = dateRange.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      
      const capsuleCumulativeBytes = capsuleMedias
        .filter(m => m.created_at && format(new Date(m.created_at), "yyyy-MM-dd") <= dateStr)
        .reduce((acc, m) => acc + (m.file_size_bytes || 0), 0);
      
      const familyCumulativeBytes = familyMedias
        .filter(m => m.created_at && format(new Date(m.created_at), "yyyy-MM-dd") <= dateStr)
        .reduce((acc, m) => acc + (Number(m.file_size_bytes) || 0), 0);
      
      return {
        date: format(date, "d MMM", { locale: fr }),
        storage: (capsuleCumulativeBytes + familyCumulativeBytes) / (1024 * 1024),
        capsuleStorage: capsuleCumulativeBytes / (1024 * 1024),
        familyStorage: familyCumulativeBytes / (1024 * 1024)
      };
    });

    setStorageHistory(history);

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
      capsuleStorageMb,
      familyStorageMb,
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
      title: "Stockage Total",
      value: `${(stats.totalStorageUsed / 1024).toFixed(2)} GB`,
      icon: HardDrive,
      description: `Capsules: ${stats.capsuleStorageMb.toFixed(0)} MB · Arbres: ${stats.familyStorageMb.toFixed(0)} MB`,
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

      {/* Storage Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-orange-500" />
              Évolution du stockage (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storageHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={storageHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toFixed(0)} MB`}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const label = name === "capsuleStorage" ? "Capsules" : name === "familyStorage" ? "Arbres généalogiques" : "Total";
                      return [`${value.toFixed(2)} MB`, label];
                    }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === "capsuleStorage") return "Capsules";
                      if (value === "familyStorage") return "Arbres généalogiques";
                      return value;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capsuleStorage"
                    name="capsuleStorage"
                    stroke="#F97316"
                    fill="rgba(249, 115, 22, 0.3)"
                    strokeWidth={2}
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="familyStorage"
                    name="familyStorage"
                    stroke="#22C55E"
                    fill="rgba(34, 197, 94, 0.3)"
                    strokeWidth={2}
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée de stockage disponible
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Storage per User */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Stockage par utilisateur (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userStorage.length > 0 ? (
              <div className="space-y-4">
                {userStorage.map((user, index) => {
                  const usagePercent = Math.min((user.storageMb / user.storageLimitMb) * 100, 100);
                  const isNearLimit = usagePercent >= 80;
                  return (
                    <div key={user.userId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-5">{index + 1}.</span>
                          <span className="font-medium truncate max-w-[200px]">{user.displayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={isNearLimit ? "text-amber-500 font-medium" : "text-muted-foreground"}>
                            {user.storageMb.toFixed(1)} MB
                          </span>
                          <span className="text-muted-foreground text-xs">
                            / {user.storageLimitMb} MB
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={usagePercent} 
                          className={`h-2 flex-1 ${isNearLimit ? "[&>div]:bg-amber-500" : ""}`}
                        />
                        <div className="text-xs text-muted-foreground w-24 text-right">
                          <span className="text-orange-500">{user.capsuleStorageMb.toFixed(1)}</span>
                          {" / "}
                          <span className="text-green-500">{user.familyStorageMb.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span>Capsules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Arbres</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune donnée de stockage par utilisateur
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
