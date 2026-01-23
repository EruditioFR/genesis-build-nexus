import { ReactNode } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import Footer from '@/components/landing/Footer';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  user: {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  onSignOut: () => void;
  /** Hide header (for pages with custom headers) */
  hideHeader?: boolean;
  /** Custom background class instead of default */
  backgroundClass?: string;
}

const AuthenticatedLayout = ({ 
  children, 
  user, 
  onSignOut, 
  hideHeader = false,
  backgroundClass = 'bg-gradient-warm'
}: AuthenticatedLayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass}`}>
      {!hideHeader && <DashboardHeader user={user} onSignOut={onSignOut} />}
      
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Footer - hidden on mobile where bottom nav is shown */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default AuthenticatedLayout;
