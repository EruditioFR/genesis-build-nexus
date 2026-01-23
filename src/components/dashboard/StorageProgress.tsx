import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, TrendingUp, ChevronDown, Check, Crown, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StorageProgressProps {
  usedMb: number;
  limitMb: number;
  subscriptionLevel: 'free' | 'premium' | 'legacy';
}

interface PlanInfo {
  id: 'free' | 'premium' | 'legacy';
  name: string;
  storageMb: number;
  storageLabel: string;
  price: string;
  color: string;
  features: string[];
}

const plans: PlanInfo[] = [
  {
    id: 'free',
    name: 'Gratuit',
    storageMb: 250,
    storageLabel: '250 Mo',
    price: '0€',
    color: 'bg-muted-foreground',
    features: ['Souvenirs texte & photo', 'Chronologie basique'],
  },
  {
    id: 'premium',
    name: 'Premium',
    storageMb: 10240,
    storageLabel: '10 Go',
    price: '9,99€/mois',
    color: 'bg-secondary',
    features: ['Tous types de médias', 'Chronologie avancée', '1 cercle de partage'],
  },
  {
    id: 'legacy',
    name: 'Héritage',
    storageMb: 51200,
    storageLabel: '50 Go',
    price: '19,99€/mois',
    color: 'bg-primary',
    features: ['Stockage massif', 'Arbre généalogique', 'Partages illimités'],
  },
];

const StorageProgress = ({ usedMb, limitMb, subscriptionLevel }: StorageProgressProps) => {
  const { t } = useTranslation('dashboard');
  const [showComparison, setShowComparison] = useState(false);
  
  const percentage = Math.min((usedMb / limitMb) * 100, 100);
  const usedGb = (usedMb / 1024).toFixed(2);
  const limitGb = (limitMb / 1024).toFixed(1);
  
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 95;

  const plans: PlanInfo[] = [
    {
      id: 'free',
      name: t('plans.free'),
      storageMb: 250,
      storageLabel: '250 Mo',
      price: '0€',
      color: 'bg-muted-foreground',
      features: [t('plans.freeFeature1'), t('plans.freeFeature2')],
    },
    {
      id: 'premium',
      name: t('plans.premium'),
      storageMb: 10240,
      storageLabel: '10 Go',
      price: '9,99€/mois',
      color: 'bg-secondary',
      features: [t('plans.premiumFeature1'), t('plans.premiumFeature2'), t('plans.premiumFeature3')],
    },
    {
      id: 'legacy',
      name: t('plans.heritage'),
      storageMb: 51200,
      storageLabel: '50 Go',
      price: '19,99€/mois',
      color: 'bg-primary',
      features: [t('plans.heritageFeature1'), t('plans.heritageFeature2'), t('plans.heritageFeature3')],
    },
  ];

  const currentPlan = plans.find(p => p.id === subscriptionLevel) || plans[0];
  const maxStorage = plans[plans.length - 1].storageMb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl border border-border bg-card"
      data-tour="storage"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <HardDrive className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">{t('storage.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('storage.subtitle')}
            </p>
          </div>
        </div>
        {subscriptionLevel !== 'legacy' && (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to={subscriptionLevel === 'free' ? '/premium' : '/premium?tier=heritage'}>
              <TrendingUp className="w-4 h-4" />
              {subscriptionLevel === 'free' ? t('storage.upgradePremium') : t('storage.upgradeHeritage')}
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('storage.used', { used: usedGb, total: limitGb })}</span>
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
            ⚠️ {t('storage.nearLimit')}
          </p>
        )}
        {isAtLimit && (
          <p className="text-sm text-destructive">
            🚨 {t('storage.atLimit')}
          </p>
        )}
        {!isNearLimit && subscriptionLevel === 'free' && (
          <p className="text-sm text-muted-foreground">
            {t('storage.needSpace')} <Link to="/premium" className="text-secondary hover:underline font-medium">{t('storage.upgradeNow')}</Link>
          </p>
        )}
      </div>

      <button
        onClick={() => setShowComparison(!showComparison)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{t('storage.comparePlans')}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', showComparison && 'rotate-180')} />
      </button>

      {/* Plans Comparison */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-border mt-2">
              {/* Visual storage comparison bar */}
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {t('storage.storageComparison')}
                </p>
                <div className="space-y-2">
                  {plans.map((plan) => {
                    const planPercentage = (plan.storageMb / maxStorage) * 100;
                    const usedInPlan = subscriptionLevel === plan.id 
                      ? Math.min((usedMb / plan.storageMb) * 100, 100)
                      : 0;
                    const isCurrent = plan.id === subscriptionLevel;
                    
                    return (
                      <div key={plan.id} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-sm font-medium',
                              isCurrent ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {plan.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                                {t('storage.current')}
                              </span>
                            )}
                          </div>
                          <span className={cn(
                            'text-sm font-semibold',
                            isCurrent ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {plan.storageLabel}
                          </span>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          {/* Plan capacity bar */}
                          <div
                            className={cn(
                              'absolute inset-y-0 left-0 rounded-full transition-all',
                              isCurrent ? plan.color : 'bg-muted-foreground/20'
                            )}
                            style={{ width: `${planPercentage}%` }}
                          />
                          {/* Used storage indicator for current plan */}
                          {isCurrent && usedInPlan > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 bg-foreground/30 rounded-full"
                              style={{ width: `${(usedInPlan / 100) * planPercentage}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plans cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((plan) => {
                  const isCurrent = plan.id === subscriptionLevel;
                  const isUpgrade = plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === subscriptionLevel);
                  
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'relative rounded-xl p-4 border transition-all',
                        isCurrent 
                          ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20' 
                          : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                      )}
                    >
                      {/* Plan icon */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          plan.id === 'free' ? 'bg-muted text-muted-foreground' :
                          plan.id === 'premium' ? 'bg-secondary/15 text-secondary' :
                          'bg-primary/15 text-primary'
                        )}>
                          {plan.id === 'legacy' ? (
                            <Crown className="w-4 h-4" />
                          ) : plan.id === 'premium' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <HardDrive className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.price}</p>
                        </div>
                      </div>

                      {/* Storage highlight */}
                      <div className={cn(
                        'text-2xl font-bold mb-3',
                        isCurrent ? 'text-secondary' : 'text-foreground'
                      )}>
                        {plan.storageLabel}
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 mb-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-secondary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      {isCurrent ? (
                        <div className="text-center py-2 text-xs font-medium text-secondary">
                          ✓ {t('storage.yourPlan')}
                        </div>
                      ) : isUpgrade ? (
                        <Button size="sm" className="w-full" variant={plan.id === 'legacy' ? 'default' : 'secondary'} asChild>
                          <Link to={plan.id === 'legacy' ? '/premium?tier=heritage' : '/premium'}>
                            {t('storage.choose')}
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StorageProgress;
