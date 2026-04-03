import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronDown, ChevronRight, Loader2, Share2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CircleRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  owner_id: string;
  owner_email?: string;
  owner_display_name?: string;
  members: MemberRow[];
  shares: ShareRow[];
  expanded: boolean;
}

interface MemberRow {
  id: string;
  email: string | null;
  name: string | null;
  accepted_at: string | null;
  invited_at: string;
}

interface ShareRow {
  id: string;
  capsule_title: string;
  shared_at: string;
}

export default function AdminCircles() {
  const [circles, setCircles] = useState<CircleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    setLoading(true);

    // Fetch all circles
    const { data: circlesData } = await supabase
      .from("circles")
      .select("id, name, description, color, created_at, owner_id")
      .order("created_at", { ascending: false });

    if (!circlesData) {
      setLoading(false);
      return;
    }

    // Fetch owner profiles
    const ownerIds = [...new Set(circlesData.map((c) => c.owner_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", ownerIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

    // Fetch owner emails via the db function
    const emailMap = new Map<string, string>();
    for (const ownerId of ownerIds) {
      const { data: email } = await supabase.rpc("get_user_email", { _user_id: ownerId });
      if (email) emailMap.set(ownerId, email);
    }

    setCircles(
      circlesData.map((c) => ({
        ...c,
        owner_display_name: profileMap.get(c.owner_id) || undefined,
        owner_email: emailMap.get(c.owner_id) || undefined,
        members: [],
        shares: [],
        expanded: false,
      }))
    );

    setLoading(false);
  };

  const toggleExpand = async (circleId: string) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== circleId) return c;
        if (c.expanded) return { ...c, expanded: false };
        return { ...c, expanded: true };
      })
    );

    // Fetch members and shares if not already loaded
    const circle = circles.find((c) => c.id === circleId);
    if (circle && circle.members.length === 0) {
      const [membersRes, sharesRes] = await Promise.all([
        supabase
          .from("circle_members")
          .select("id, email, name, accepted_at, invited_at")
          .eq("circle_id", circleId)
          .order("invited_at", { ascending: false }),
        supabase
          .from("capsule_shares")
          .select("id, capsule_id, shared_at")
          .eq("circle_id", circleId)
          .order("shared_at", { ascending: false }),
      ]);

      // Resolve capsule titles
      const capsuleIds = sharesRes.data?.map((s) => s.capsule_id) || [];
      let capsuleTitleMap = new Map<string, string>();
      if (capsuleIds.length > 0) {
        const { data: capsules } = await supabase
          .from("capsules")
          .select("id, title")
          .in("id", capsuleIds);
        capsuleTitleMap = new Map(capsules?.map((c) => [c.id, c.title]) || []);
      }

      setCircles((prev) =>
        prev.map((c) =>
          c.id === circleId
            ? {
                ...c,
                members: membersRes.data || [],
                shares: (sharesRes.data || []).map((s) => ({
                  id: s.id,
                  capsule_title: capsuleTitleMap.get(s.capsule_id) || "Sans titre",
                  shared_at: s.shared_at,
                })),
              }
            : c
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold">Cercles de partage</h1>
          <p className="text-sm text-muted-foreground">
            {circles.length} cercle{circles.length > 1 ? "s" : ""} créé{circles.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Cercle</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Créé le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {circles.map((circle) => (
              <>
                <TableRow
                  key={circle.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(circle.id)}
                >
                  <TableCell>
                    {circle.expanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: circle.color || "#1E3A5F" }}
                      />
                      <span className="font-medium">{circle.name}</span>
                    </div>
                    {circle.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {circle.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {circle.owner_display_name || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {circle.owner_email || ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(circle.created_at), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                </TableRow>

                {circle.expanded && (
                  <TableRow key={`${circle.id}-details`}>
                    <TableCell colSpan={4} className="bg-muted/30 px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Members */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            Membres ({circle.members.length})
                          </h4>
                          {circle.members.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Aucun membre</p>
                          ) : (
                            <div className="space-y-1.5">
                              {circle.members.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between text-sm rounded-md border border-border px-3 py-1.5 bg-card"
                                >
                                  <span>{m.name || m.email || "—"}</span>
                                  <Badge
                                    variant={m.accepted_at ? "default" : "secondary"}
                                    className={
                                      m.accepted_at
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : ""
                                    }
                                  >
                                    {m.accepted_at ? "Accepté" : "En attente"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Shared capsules */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <Share2 className="h-4 w-4" />
                            Souvenirs partagés ({circle.shares.length})
                          </h4>
                          {circle.shares.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Aucun souvenir partagé</p>
                          ) : (
                            <div className="space-y-1.5">
                              {circle.shares.map((s) => (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between text-sm rounded-md border border-border px-3 py-1.5 bg-card"
                                >
                                  <span className="truncate">{s.capsule_title}</span>
                                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                    {format(new Date(s.shared_at), "d MMM yyyy", { locale: fr })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {circles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun cercle créé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
