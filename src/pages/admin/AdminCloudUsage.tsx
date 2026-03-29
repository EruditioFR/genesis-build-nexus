import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cloud, HardDrive, User, FileText, Image, Video, Music, ChevronDown, ChevronUp,
  Search, ArrowUpDown, AlertTriangle, Loader2, DollarSign, Zap, Database, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface UserUsage {
  userId: string;
  displayName: string;
  email: string;
  storageLimitMb: number;
  storageUsedMb: number;
  subscriptionLevel: string;
  capsuleCount: number;
  mediaCount: number;
  totalMediaBytes: number;
  familyMediaCount: number;
  familyMediaBytes: number;
}

interface CapsuleUsage {
  id: string;
  title: string;
  capsuleType: string;
  mediaCount: number;
  totalBytes: number;
  createdAt: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 o";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

const formatMb = (mb: number): string => {
  if (mb < 1024) return `${mb} Mo`;
  return `${(mb / 1024).toFixed(1)} Go`;
};

type SortKey = "name" | "storage" | "capsules" | "media";

export default function AdminCloudUsage() {
  const [users, setUsers] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("storage");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [capsuleDetails, setCapsuleDetails] = useState<CapsuleUsage[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsersUsage();
  }, []);

  const fetchUsersUsage = async () => {
    setLoading(true);

    // Fetch all profiles, capsules summary, and media summary in parallel
    const [profilesRes, capsulesRes, mediasRes, familyMediasRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, storage_limit_mb, storage_used_mb, subscription_level"),
      supabase.from("capsules").select("id, user_id"),
      supabase.from("capsule_medias").select("capsule_id, file_size_bytes"),
      supabase.from("family_person_media").select("person_id, file_size_bytes, uploaded_by"),
    ]);

    const profiles = profilesRes.data || [];
    const capsules = capsulesRes.data || [];
    const medias = mediasRes.data || [];
    const familyMedias = familyMediasRes.data || [];

    // Get emails for all users
    const userIds = profiles.map(p => p.user_id);
    const emailPromises = userIds.map(uid =>
      supabase.rpc("get_user_email", { _user_id: uid })
    );
    const emailResults = await Promise.all(emailPromises);
    const emailMap: Record<string, string> = {};
    userIds.forEach((uid, i) => {
      emailMap[uid] = (emailResults[i].data as string) || "";
    });

    // Build capsule-to-user map
    const capsuleUserMap: Record<string, string> = {};
    const userCapsuleCounts: Record<string, number> = {};
    capsules.forEach(c => {
      capsuleUserMap[c.id] = c.user_id;
      userCapsuleCounts[c.user_id] = (userCapsuleCounts[c.user_id] || 0) + 1;
    });

    // Aggregate media per user
    const userMediaCounts: Record<string, number> = {};
    const userMediaBytes: Record<string, number> = {};
    medias.forEach(m => {
      const userId = capsuleUserMap[m.capsule_id];
      if (userId) {
        userMediaCounts[userId] = (userMediaCounts[userId] || 0) + 1;
        userMediaBytes[userId] = (userMediaBytes[userId] || 0) + (m.file_size_bytes || 0);
      }
    });

    // Aggregate family media per user
    const userFamilyMediaCounts: Record<string, number> = {};
    const userFamilyMediaBytes: Record<string, number> = {};
    familyMedias.forEach(m => {
      const userId = m.uploaded_by;
      if (userId) {
        userFamilyMediaCounts[userId] = (userFamilyMediaCounts[userId] || 0) + 1;
        userFamilyMediaBytes[userId] = (userFamilyMediaBytes[userId] || 0) + (m.file_size_bytes || 0);
      }
    });

    const usersData: UserUsage[] = profiles.map(p => ({
      userId: p.user_id,
      displayName: p.display_name || "Sans nom",
      email: emailMap[p.user_id] || "",
      storageLimitMb: p.storage_limit_mb,
      storageUsedMb: p.storage_used_mb,
      subscriptionLevel: p.subscription_level,
      capsuleCount: userCapsuleCounts[p.user_id] || 0,
      mediaCount: userMediaCounts[p.user_id] || 0,
      totalMediaBytes: userMediaBytes[p.user_id] || 0,
      familyMediaCount: userFamilyMediaCounts[p.user_id] || 0,
      familyMediaBytes: userFamilyMediaBytes[p.user_id] || 0,
    }));

    setUsers(usersData);
    setLoading(false);
  };

  const fetchCapsuleDetails = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingDetails(true);

    const { data: capsules } = await supabase
      .from("capsules")
      .select("id, title, capsule_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!capsules || capsules.length === 0) {
      setCapsuleDetails([]);
      setLoadingDetails(false);
      return;
    }

    const capsuleIds = capsules.map(c => c.id);
    const { data: medias } = await supabase
      .from("capsule_medias")
      .select("capsule_id, file_size_bytes")
      .in("capsule_id", capsuleIds);

    const mediaByCapsule: Record<string, { count: number; bytes: number }> = {};
    (medias || []).forEach(m => {
      if (!mediaByCapsule[m.capsule_id]) {
        mediaByCapsule[m.capsule_id] = { count: 0, bytes: 0 };
      }
      mediaByCapsule[m.capsule_id].count++;
      mediaByCapsule[m.capsule_id].bytes += m.file_size_bytes || 0;
    });

    setCapsuleDetails(
      capsules.map(c => ({
        id: c.id,
        title: c.title,
        capsuleType: c.capsule_type,
        mediaCount: mediaByCapsule[c.id]?.count || 0,
        totalBytes: mediaByCapsule[c.id]?.bytes || 0,
        createdAt: c.created_at,
      }))
    );
    setLoadingDetails(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.displayName.localeCompare(b.displayName); break;
        case "storage": cmp = a.totalMediaBytes + a.familyMediaBytes - (b.totalMediaBytes + b.familyMediaBytes); break;
        case "capsules": cmp = a.capsuleCount - b.capsuleCount; break;
        case "media": cmp = a.mediaCount + a.familyMediaCount - (b.mediaCount + b.familyMediaCount); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [users, search, sortKey, sortAsc]);

  // Global stats
  const totalStorage = users.reduce((s, u) => s + u.totalMediaBytes + u.familyMediaBytes, 0);
  const totalCapsules = users.reduce((s, u) => s + u.capsuleCount, 0);
  const totalMedias = users.reduce((s, u) => s + u.mediaCount + u.familyMediaCount, 0);
  const usersNearLimit = users.filter(u => u.storageUsedMb > u.storageLimitMb * 0.8).length;

  // Cost estimation (based on Lovable Cloud / Supabase pricing)
  const costEstimate = useMemo(() => {
    const storageGb = totalStorage / (1024 * 1024 * 1024);
    const dbSizeMb = 30; // approximate from schema
    const activeUsers = users.length;
    
    // Compute (Nano instance, auto-pause) ~$0.01344/hour when active
    // Estimate ~8h active/day for low traffic
    const computeHoursPerMonth = activeUsers > 100 ? 720 : activeUsers > 20 ? 360 : 240;
    const computeCost = computeHoursPerMonth * 0.01344;
    
    // Storage: $0.021/GB/month for file storage
    const storageCost = storageGb * 0.021;
    
    // Database: included in compute for < 500MB
    const dbCost = dbSizeMb > 500 ? (dbSizeMb / 1024) * 0.125 : 0;
    
    // Bandwidth/Data transfer: estimate ~4.5 pages/visit, ~2400 visits/month
    // Average ~50KB per API call, ~10 calls per page view
    const estimatedMonthlyVisits = activeUsers * 70; // rough estimate
    const estimatedBandwidthGb = (estimatedMonthlyVisits * 10 * 50 * 1024) / (1024 * 1024 * 1024);
    // First 5GB free, then $0.09/GB
    const bandwidthCost = Math.max(0, estimatedBandwidthGb - 5) * 0.09;
    
    // Edge functions: ~$0.20 base + $0.000002 per invocation
    const edgeFnInvocations = estimatedMonthlyVisits * 2; // ~2 fn calls per visit
    const edgeFnCost = 0.20 + edgeFnInvocations * 0.000002;
    
    // Auth: free for < 50K MAU
    const authCost = 0;
    
    const total = computeCost + storageCost + dbCost + bandwidthCost + edgeFnCost + authCost;
    const freeCredit = 25;
    
    return {
      compute: computeCost,
      storage: storageCost,
      database: dbCost,
      bandwidth: bandwidthCost,
      edgeFunctions: edgeFnCost,
      auth: authCost,
      total,
      freeCredit,
      netCost: Math.max(0, total - freeCredit),
      storageGb,
      estimatedMonthlyVisits,
    };
  }, [totalStorage, users.length]);

  const typeIcon = (type: string) => {
    switch (type) {
      case "photo": return <Image className="w-3.5 h-3.5 text-emerald-500" />;
      case "video": return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case "audio": return <Music className="w-3.5 h-3.5 text-purple-500" />;
      default: return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const subBadge = (level: string) => {
    const colors: Record<string, string> = {
      free: "bg-muted text-muted-foreground",
      premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      legacy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return <Badge variant="outline" className={cn("text-[10px]", colors[level] || "")}>{level}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Cloud className="w-6 h-6 text-primary" />
        Usage Cloud détaillé
      </h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stockage total</CardTitle>
            <HardDrive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capsules</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapsules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Médias</CardTitle>
            <Image className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedias}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Proches limite</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersNearLimit}</div>
            <p className="text-xs text-muted-foreground">&gt; 80% du quota</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost estimation widget */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Estimation du coût Cloud mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Breakdown items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" /> Compute
                </span>
                <span className="font-medium">${costEstimate.compute.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="w-3.5 h-3.5" /> Stockage ({costEstimate.storageGb.toFixed(2)} Go)
                </span>
                <span className="font-medium">${costEstimate.storage.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Database className="w-3.5 h-3.5" /> Base de données
                </span>
                <span className="font-medium">{costEstimate.database > 0 ? `$${costEstimate.database.toFixed(2)}` : "Inclus"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" /> Bandwidth
                </span>
                <span className="font-medium">${costEstimate.bandwidth.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Cloud className="w-3.5 h-3.5" /> Edge Functions
                </span>
                <span className="font-medium">${costEstimate.edgeFunctions.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Coût estimé</p>
              <p className="text-3xl font-bold text-foreground">${costEstimate.total.toFixed(2)}<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  -${costEstimate.freeCredit} crédit gratuit
                </Badge>
              </div>
              <p className="mt-2 text-lg font-bold">
                {costEstimate.netCost === 0 ? (
                  <span className="text-emerald-600">Couvert par le crédit gratuit ✓</span>
                ) : (
                  <span className="text-amber-600">Net : ${costEstimate.netCost.toFixed(2)}/mois</span>
                )}
              </p>
              <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
                Basé sur {users.length} utilisateurs, ~{costEstimate.estimatedMonthlyVisits.toLocaleString()} visites/mois estimées, {formatBytes(totalStorage)} de fichiers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3" onClick={() => handleSort("name")}>
                      Utilisateur
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Abo</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleSort("capsules")}>
                      Capsules
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleSort("media")}>
                      Médias
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleSort("storage")}>
                      Stockage
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Quota</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((user) => {
                  const totalBytes = user.totalMediaBytes + user.familyMediaBytes;
                  const usagePercent = user.storageLimitMb > 0
                    ? Math.min(100, (user.storageUsedMb / user.storageLimitMb) * 100)
                    : 0;
                  const isExpanded = expandedUser === user.userId;
                  const isNearLimit = usagePercent > 80;

                  return (
                    <>
                      <TableRow
                        key={user.userId}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          isNearLimit && "bg-amber-50/50 dark:bg-amber-950/10"
                        )}
                        onClick={() => fetchCapsuleDetails(user.userId)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{user.displayName}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{subBadge(user.subscriptionLevel)}</TableCell>
                        <TableCell className="text-sm font-medium">{user.capsuleCount}</TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium">{user.mediaCount}</span>
                          {user.familyMediaCount > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">(+{user.familyMediaCount} arbre)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{formatBytes(totalBytes)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={usagePercent} className="h-2 flex-1" />
                            <span className={cn("text-xs font-medium", isNearLimit ? "text-amber-600" : "text-muted-foreground")}>
                              {formatMb(user.storageUsedMb)}/{formatMb(user.storageLimitMb)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </TableCell>
                      </TableRow>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <TableRow key={`${user.userId}-detail`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            {loadingDetails ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : capsuleDetails.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-6">Aucune capsule</p>
                            ) : (
                              <div className="px-4 py-3 max-h-[300px] overflow-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-muted-foreground border-b">
                                      <th className="text-left pb-2 font-medium">Souvenir</th>
                                      <th className="text-left pb-2 font-medium">Type</th>
                                      <th className="text-right pb-2 font-medium">Médias</th>
                                      <th className="text-right pb-2 font-medium">Taille</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {capsuleDetails.map((c) => (
                                      <tr key={c.id} className="border-b border-border/50 last:border-0">
                                        <td className="py-2 pr-4">
                                          <p className="truncate max-w-[200px]">{c.title}</p>
                                        </td>
                                        <td className="py-2">
                                          <div className="flex items-center gap-1.5">
                                            {typeIcon(c.capsuleType)}
                                            <span className="capitalize text-xs">{c.capsuleType}</span>
                                          </div>
                                        </td>
                                        <td className="py-2 text-right font-medium">{c.mediaCount}</td>
                                        <td className="py-2 text-right">
                                          <span className={cn(
                                            "font-medium",
                                            c.totalBytes > 50 * 1024 * 1024 && "text-amber-600"
                                          )}>
                                            {formatBytes(c.totalBytes)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
