import { motion } from 'framer-motion';
import { HardDrive, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StorageProgressProps {
  usedMb: number;
  limitMb: number;
  subscriptionLevel: 'free' | 'premium' | 'legacy';
}

const StorageProgress = ({ usedMb, limitMb, subscriptionLevel }: StorageProgressProps) => {
  const percentage = Math.min((usedMb / limitMb) * 100, 100);
  const usedGb = (usedMb / 1024).toFixed(2);
  const limitGb = (limitMb / 1024).toFixed(1);
  
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 95;

  const subscriptionLabels = {
    free: 'Gratuit',
    premium: 'Premium',
    legacy: 'Héritage',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <HardDrive className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Espace de stockage</h3>
            <p className="text-sm text-muted-foreground">
              Abonnement {subscriptionLabels[subscriptionLevel]}
            </p>
          </div>
        </div>
        {subscriptionLevel === 'free' && (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/premium">
              <TrendingUp className="w-4 h-4" />
              Passer Premium
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {usedGb} Go utilisés sur {limitGb} Go
          </span>
          <span className={`font-medium ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-accent' : 'text-foreground'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={`h-3 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-accent' : '[&>div]:bg-gradient-to-r [&>div]:from-secondary [&>div]:to-gold-light'}`}
        />

        {isNearLimit && !isAtLimit && (
          <p className="text-sm text-accent">
            ⚠️ Votre espace de stockage est presque plein
          </p>
        )}
        {isAtLimit && (
          <p className="text-sm text-destructive">
            🚨 Espace de stockage épuisé. Passez à Premium pour continuer.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StorageProgress;
