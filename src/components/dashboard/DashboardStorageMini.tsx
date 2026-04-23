import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HardDrive, ArrowUpRight } from 'lucide-react';
import storageCover from '@/assets/dashboard/storage-cover.jpg';

interface DashboardStorageMiniProps {
  usedMb: number;
  limitMb: number;
  subscriptionLevel: 'free' | 'premium' | 'legacy';
}

const DashboardStorageMini = ({
  usedMb,
  limitMb,
  subscriptionLevel,
}: DashboardStorageMiniProps) => {
  const { t } = useTranslation('dashboard');
  const pct = limitMb > 0 ? Math.min(100, Math.round((usedMb / limitMb) * 100)) : 0;
  const usedGb = (usedMb / 1024).toFixed(1);
  const totalGb = (limitMb / 1024).toFixed(0);

  const isCritical = pct >= 90;
  const isWarning = pct >= 70;

  const barColor = isCritical
    ? 'hsl(var(--destructive))'
    : isWarning
    ? 'hsl(var(--accent))'
    : 'hsl(var(--gold))';

  const planLabel =
    subscriptionLevel === 'legacy'
      ? t('plans.heritage')
      : subscriptionLevel === 'premium'
      ? t('plans.premium')
      : t('plans.free');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="relative h-24 w-full overflow-hidden">
        <img
          src={storageCover}
          alt=""
          loading="lazy"
          width={1024}
          height={512}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
      </div>
      <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'hsl(var(--gold) / 0.12)' }}
          >
            <HardDrive className="w-4.5 h-4.5" style={{ color: 'hsl(var(--gold))' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {t('storage.title')}
            </p>
            <p className="text-[11px] text-muted-foreground">{planLabel}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums">{pct}%</span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: barColor }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {usedGb} GB / {totalGb} GB
      </p>

      {subscriptionLevel !== 'legacy' && (
        <Link
          to="/premium"
          className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          style={{
            background: 'hsl(var(--gold) / 0.1)',
            color: 'hsl(var(--gold))',
          }}
        >
          <span>
            {subscriptionLevel === 'free'
              ? t('storage.upgradePremium')
              : t('storage.upgradeHeritage')}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}
    </motion.div>
  );
};

export default DashboardStorageMini;
