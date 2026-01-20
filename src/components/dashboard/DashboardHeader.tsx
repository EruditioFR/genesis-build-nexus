import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, LayoutDashboard, Clock, Users, FolderOpen, Menu, BarChart3, Shield, TreeDeciduous, Folder, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import GlobalSearch from '@/components/search/GlobalSearch';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import logo from '@/assets/logo.png';

interface DashboardHeaderProps {
  user: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    id?: string;
  };
  onSignOut: () => void;
}

const DashboardHeader = ({ user, onSignOut }: DashboardHeaderProps) => {
  const location = useLocation();
  const { isAdminOrModerator } = useAdminAuth();
  const { startTour } = useOnboardingTour();
  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || 'U';

  const navLinks = [
    { to: '/dashboard', label: 'Synthèse', icon: LayoutDashboard, tourId: 'nav-dashboard' },
    { to: '/capsules', label: 'Capsules', icon: FolderOpen, tourId: 'nav-capsules' },
    { to: '/categories', label: 'Catégories', icon: Folder, tourId: 'nav-categories' },
    { to: '/timeline', label: 'Chronologie', icon: Clock, tourId: 'nav-timeline' },
    { to: '/circles', label: 'Cercles', icon: Users, tourId: 'nav-circles' },
    { to: '/statistics', label: 'Stats', icon: BarChart3, tourId: 'nav-stats' },
  ];

  return (
    <header className="border-b border-white/10 bg-[#1a1a2e]/85 backdrop-blur-xl shadow-lg shadow-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={logo} alt="Family Garden" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
              <span className="text-xl sm:text-xl font-display font-bold text-primary-foreground">
                Family<span className="text-secondary">Garden</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to || 
                  (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-tour={link.tourId}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary/20 text-secondary"
                        : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Family Tree link with Premium badge */}
              <Link
                to="/family-tree"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname.startsWith('/family-tree')
                    ? "bg-secondary/20 text-secondary"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                )}
              >
                <TreeDeciduous className="w-4 h-4" />
                <span>Arbre</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-secondary/10 text-secondary border-secondary/30">
                  Premium
                </Badge>
              </Link>
              
              {/* Admin link - only visible for admins/moderators */}
              {isAdminOrModerator && (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname.startsWith('/admin')
                      ? "bg-primary/20 text-primary"
                      : "text-primary hover:bg-primary/10"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Search */}
            {user.id && <div data-tour="search"><GlobalSearch userId={user.id} /></div>}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {user.id && <div data-tour="notifications"><NotificationsBell userId={user.id} /></div>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/10" data-tour="user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName || 'Avatar'} />
                    <AvatarFallback className="bg-secondary/20 text-secondary text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-primary-foreground hidden sm:block max-w-[150px] truncate">
                    {user.displayName || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.displayName || 'Utilisateur'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={startTour} className="cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Visite guidée
                </DropdownMenuItem>
                {isAdminOrModerator && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-primary">
                        <Shield className="w-4 h-4 mr-2" />
                        Backoffice
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
