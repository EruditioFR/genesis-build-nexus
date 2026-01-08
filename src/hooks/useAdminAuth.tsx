import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

interface AdminAuthState {
  isAdmin: boolean;
  isModerator: boolean;
  isAdminOrModerator: boolean;
  roles: AppRole[];
  loading: boolean;
}

export function useAdminAuth(): AdminAuthState {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!error && data) {
        setRoles(data.map((r) => r.role as AppRole));
      } else {
        setRoles([]);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");

  return {
    isAdmin,
    isModerator,
    isAdminOrModerator: isAdmin || isModerator,
    roles,
    loading: authLoading || loading,
  };
}
