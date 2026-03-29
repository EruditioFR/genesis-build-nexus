import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare,
  Mail, 
  CreditCard, 
  Shield, 
  ChevronLeft,
  BarChart3,
  TreePine,
  Cloud,
  MessageSquareHeart,
  Menu,
  X
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import NoIndex from "@/components/seo/NoIndex";

const navItems = [
  { to: "/admin", label: "Synthèse", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/capsules", label: "Capsules", icon: FileText },
  { to: "/admin/comments", label: "Commentaires", icon: MessageSquare },
  { to: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { to: "/admin/roles", label: "Rôles", icon: Shield },
  { to: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  { to: "/admin/family-trees", label: "Arbres", icon: TreePine },
  { to: "/admin/cloud-usage", label: "Usage Cloud", icon: Cloud },
  { to: "/admin/feedback", label: "Évaluations", icon: MessageSquareHeart },
  { to: "/admin/contact", label: "Contact", icon: Mail },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdminOrModerator, isAdmin, loading: roleLoading } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <>
      <NoIndex />
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 border-r border-border bg-card hidden lg:flex flex-col">
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
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isAdmin ? "Administrateur" : "Modérateur"}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-sm">Backoffice</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs px-2" onClick={() => navigate("/dashboard")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Site
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <motion.nav
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[57px] left-0 bottom-0 w-64 bg-card border-r border-border overflow-y-auto p-4 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border mt-4">
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? "Administrateur" : "Modérateur"}
                </span>
              </div>
            </motion.nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:overflow-auto">
          <div className="lg:hidden h-[57px]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 w-full max-w-full overflow-x-hidden"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </>
  );
}
