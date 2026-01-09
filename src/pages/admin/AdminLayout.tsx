import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  ChevronLeft,
  Settings,
  BarChart3
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/capsules", label: "Capsules", icon: FileText },
  { to: "/admin/comments", label: "Commentaires", icon: MessageSquare },
  { to: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { to: "/admin/roles", label: "Rôles", icon: Shield },
  { to: "/admin/stats", label: "Statistiques", icon: BarChart3 },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdminOrModerator, isAdmin, loading: roleLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (!authLoading && !roleLoading && !isAdminOrModerator) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdminOrModerator, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Retour au site</span>
          </Link>
          <h1 className="mt-4 text-xl font-display font-bold text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backoffice
          </h1>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              // Filter admin-only items for moderators
              if (item.to === "/admin/roles" && !isAdmin) return null;
              
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isAdmin ? "Administrateur" : "Modérateur"}
          </span>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">Backoffice</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Site
            </Button>
            
          </div>
        </div>
        {/* Mobile nav */}
        <ScrollArea className="mt-4">
          <div className="flex gap-2 pb-2">
            {navItems.map((item) => {
              if (item.to === "/admin/roles" && !isAdmin) return null;
              
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:overflow-auto">
        <div className="lg:hidden h-28" /> {/* Spacer for mobile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
