import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Plus, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Accueil' },
    { to: '/capsules', icon: FolderOpen, label: 'Capsules' },
    { to: '/capsules/new', icon: Plus, label: 'Créer', isAction: true },
    { to: '/timeline', icon: Clock, label: 'Chrono' },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  return (
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
                <span className="text-xs font-semibold text-secondary mt-1">{item.label}</span>
              </Link>
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
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
