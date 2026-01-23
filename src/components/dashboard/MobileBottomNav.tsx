import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FolderOpen, Plus, Clock, User, HelpCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MobileBottomNav = () => {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const { startTour } = useOnboardingTour();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: Home, labelKey: 'mobileNav.home' },
    { to: '/capsules', icon: FolderOpen, labelKey: 'mobileNav.memories' },
    { to: '/capsules/new', icon: Plus, labelKey: 'mobileNav.add', isAction: true },
    { to: '/timeline', icon: Clock, labelKey: 'mobileNav.timeline' },
    { to: '/profile', icon: User, labelKey: 'mobileNav.profile', openSheet: true },
  ];

  const handleStartTour = () => {
    setSheetOpen(false);
    // Small delay to let sheet close
    setTimeout(() => {
      startTour();
    }, 300);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] border-t border-white/10 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/dashboard' && item.to !== '/capsules/new' && location.pathname.startsWith(item.to));
            
            if (item.isAction) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                    <item.icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-semibold text-secondary mt-1">{t(item.labelKey)}</span>
                </Link>
              );
            }

            if (item.openSheet) {
              return (
                <Sheet key={item.to} open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[60px] min-h-[60px] rounded-xl transition-colors",
                        isActive
                          ? "text-secondary"
                          : "text-white/60"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "w-7 h-7 mb-1",
                          isActive && "text-secondary"
                        )} 
                        strokeWidth={isActive ? 2.5 : 2} 
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        isActive ? "text-secondary font-semibold" : "text-white/60"
                      )}>
                        {t(item.labelKey)}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                    <SheetHeader className="mb-4">
                      <SheetTitle>{t('mobileNav.myAccount')}</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-14 text-base"
                        asChild
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link to="/profile">
                          <User className="w-5 h-5" />
                          {t('mobileNav.myProfile')}
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-14 text-base"
                        asChild
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link to="/circles">
                          <Users className="w-5 h-5" />
                          {t('mobileNav.myCircles')}
                        </Link>
                      </Button>
                      
                      <Separator className="my-2" />
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-14 text-base text-secondary"
                        onClick={handleStartTour}
                      >
                        <HelpCircle className="w-5 h-5" />
                        {t('mobileNav.guidedTour')}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] min-h-[60px] rounded-xl transition-colors",
                  isActive
                    ? "text-secondary"
                    : "text-white/60"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-7 h-7 mb-1",
                    isActive && "text-secondary"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-secondary font-semibold" : "text-white/60"
                )}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
