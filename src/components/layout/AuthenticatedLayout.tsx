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
}

const AuthenticatedLayout = ({ children, user, onSignOut }: AuthenticatedLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-warm">
      <DashboardHeader user={user} onSignOut={onSignOut} />
      
      <main className="flex-1">
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
