import { motion } from 'framer-motion';
import { ArrowLeft, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SharedCapsulesSection from '@/components/circles/SharedCapsulesSection';
import NoIndex from '@/components/seo/NoIndex';

const SharedWithMePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AuthenticatedLayout>
      <NoIndex />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/circles')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux cercles
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Share className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Souvenirs partagés avec moi
              </h1>
              <p className="text-muted-foreground text-sm">
                Les souvenirs que vos proches ont partagés avec vous
              </p>
            </div>
          </div>

          <SharedCapsulesSection userId={user.id} />
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SharedWithMePage;
