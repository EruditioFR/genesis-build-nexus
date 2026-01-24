import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  GitBranch,
  BarChart3,
  Clock,
  Crown,
  LogOut,
  User,
  HelpCircle,
  Shield,
  FolderOpen,
  Home,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useSubscription } from '@/hooks/useSubscription';
import { TourWelcomeDialog } from '@/components/tour/TourWelcomeDialog';
import logo from '@/assets/logo.png';
import React from 'react';

interface DashboardHeaderProps {
  user: {
    id?: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  onSignOut: () => void;
}

// Feature card for visual mega menu
const FeatureCard = ({
  to,
  icon: Icon,
  title,
  description,
  gradient,
  badge,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
  onClick?: () => void;
}) => {
  const content = (
    <>
      <div
        className={cn(
          'absolute inset-0 opacity-5 transition-opacity group-hover:opacity-15 rounded-xl',
          gradient
        )}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
              gradient,
              'text-white shadow-md'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 text-sm group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group relative flex flex-col text-left rounded-xl p-4 transition-all hover:bg-muted/50 overflow-hidden w-full"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className="group relative flex flex-col rounded-xl p-4 transition-all hover:bg-muted/50 overflow-hidden"
    >
      {content}
    </Link>
  );
};

// Quick action button in mega menu
const QuickActionItem = ({
  to,
  icon: Icon,
  label,
  color,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/70 transition-colors group"
  >
    <div className={cn('p-2 rounded-lg', color)}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
      {label}
    </span>
  </Link>
);

const DashboardHeader = ({ user, onSignOut }: DashboardHeaderProps) => {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdminOrModerator } = useAdminAuth();
  const { startTour, welcomeDialogProps } = useOnboardingTour();
  const { tier } = useSubscription();

  const isPremium = tier === 'premium' || tier === 'heritage';
  const isHeritage = tier === 'heritage';

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <>
      <TourWelcomeDialog {...welcomeDialogProps} />
      <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-[hsl(215_50%_18%)] backdrop-blur-md border-b border-[hsl(215_50%_25%)] shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 shrink-0"
            data-tour="dashboard"
          >
            <img
              src={logo}
              alt="Family Garden"
              className="w-9 h-9 object-contain"
              width="36"
              height="36"
              loading="eager"
            />
            <span className="text-lg font-display font-semibold text-white hidden sm:inline">
              Family<span className="text-secondary">Garden</span>
            </span>
          </Link>

          {/* Desktop Navigation - Mega Menu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              {/* Accueil */}
              <NavigationMenuItem>
                <Link
                  to="/dashboard"
                  data-tour="nav-dashboard"
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    'hover:bg-white/10 hover:text-white',
                    isActive('/dashboard')
                      ? 'bg-white/15 text-white'
                      : 'text-white/80'
                  )}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t('nav.home')}
                </Link>
              </NavigationMenuItem>

              {/* Souvenirs - Mega Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  data-tour="nav-capsules"
                  className={cn(
                    'h-10 rounded-lg bg-transparent text-white/80 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/15',
                    isActivePrefix('/capsule') ||
                      isActive('/categories') ||
                      isActive('/timeline')
                      ? 'text-white bg-white/15'
                      : ''
                  )}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('nav.memories')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[650px] p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            {t('nav.memories')}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {t('nav.memoriesDesc')}
                        </p>
                      </div>
                      <Link
                        to="/capsules/new"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {t('nav.newMemory')}
                      </Link>
                    </div>

                    {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-2">
                      <FeatureCard
                        to="/capsules"
                        icon={BookOpen}
                        title={t('nav.allMemories')}
                        description={t('nav.allMemoriesDesc')}
                        gradient="bg-gradient-to-br from-primary to-primary/70"
                      />
                      <FeatureCard
                        to="/categories"
                        icon={FolderOpen}
                        title={t('nav.categories')}
                        description={t('nav.categoriesDesc')}
                        gradient="bg-gradient-to-br from-accent to-accent/70"
                      />
                      <FeatureCard
                        to="/timeline"
                        icon={Clock}
                        title={t('nav.timeline')}
                        description={t('nav.timelineDesc')}
                        gradient="bg-gradient-to-br from-emerald-600 to-emerald-500"
                      />
                      <FeatureCard
                        to="/statistics"
                        icon={BarChart3}
                        title={t('nav.statistics')}
                        description={t('nav.statisticsDesc')}
                        gradient="bg-gradient-to-br from-violet-600 to-violet-500"
                      />
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Famille - Mega Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  data-tour="nav-circles"
                  className={cn(
                    'h-10 rounded-lg bg-transparent text-white/80 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/15',
                    isActivePrefix('/family-tree') || isActive('/circles')
                      ? 'text-white bg-white/15'
                      : ''
                  )}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('nav.family')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[550px] p-5">
                      {/* Header */}
                      <div className="mb-4 pb-3 border-b border-border">
                        <h3 className="text-base font-semibold text-foreground">
                          {t('nav.family')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t('nav.familyDesc')}
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <FeatureCard
                        to="/circles"
                        icon={Users}
                        title={t('nav.circles')}
                        description={t('nav.circlesDesc')}
                        gradient="bg-gradient-to-br from-secondary to-secondary/70"
                      />
                      
                      {isHeritage ? (
                        <FeatureCard
                          to="/family-tree"
                          icon={GitBranch}
                          title={t('nav.familyTree')}
                          description={t('nav.familyTreeDesc')}
                          gradient="bg-gradient-to-br from-primary to-primary/70"
                          badge={t('plans.heritage')}
                        />
                      ) : (
                        <div className="relative">
                          <FeatureCard
                            to="/premium?tier=heritage"
                            icon={GitBranch}
                            title={t('nav.familyTree')}
                            description={t('nav.upgradeDescHeritage')}
                            gradient="bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/30"
                            badge={t('plans.heritage')}
                          />
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                            <Link
                              to="/premium?tier=heritage"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-colors shadow-lg"
                            >
                              <Crown className="w-4 h-4" />
                              {t('nav.unlock')}
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upgrade CTA for non-heritage users */}
                      {!isHeritage && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary/20">
                              <Sparkles className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {tier === 'premium' ? t('nav.upgradeTitleHeritage') : t('nav.upgradeTitle')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tier === 'premium' 
                                  ? t('nav.upgradeDescHeritage')
                                  : t('nav.upgradeDesc')}
                            </p>
                          </div>
                          <Link
                            to={tier === 'premium' ? '/premium?tier=heritage' : '/premium'}
                              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-colors"
                            >
                              {t('nav.discover')}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Admin (conditionnel) */}
              {isAdminOrModerator && (
                <NavigationMenuItem>
                  <Link
                    to="/admin"
                    className={cn(
                      'inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      'hover:bg-white/10 hover:text-white',
                      isActivePrefix('/admin')
                        ? 'bg-white/15 text-white'
                        : 'text-white/80'
                    )}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('nav.admin')}
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="hidden md:block" data-tour="search">
              {user.id && <GlobalSearch userId={user.id} />}
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div data-tour="notifications">
              {user.id && <NotificationsBell userId={user.id} />}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 pl-2 pr-3 hover:bg-white/10 text-white"
                  data-tour="user-menu"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white/20">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName || 'Avatar'} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium text-white max-w-24 truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.displayName || t('userMenu.user')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    {t('userMenu.myProfile')}
                  </Link>
                </DropdownMenuItem>
                {tier !== 'heritage' && (
                  <DropdownMenuItem asChild>
                    <Link
                      to={tier === 'premium' ? '/premium?tier=heritage' : '/premium'}
                      className="flex items-center gap-3 cursor-pointer text-secondary"
                    >
                      <Crown className="h-4 w-4" />
                      {tier === 'premium' ? t('userMenu.upgradeHeritage') : t('userMenu.upgradePremium')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={startTour}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('userMenu.guidedTour')}
                </DropdownMenuItem>
                {isAdminOrModerator && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 cursor-pointer text-primary"
                      >
                        <Shield className="h-4 w-4" />
                        {t('userMenu.backoffice')}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t('userMenu.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
    </>
  );
};

export default DashboardHeader;
