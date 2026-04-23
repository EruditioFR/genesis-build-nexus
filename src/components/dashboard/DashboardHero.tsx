import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeroProps {
  displayName?: string;
  totalCapsules: number;
  totalMedias: number;
  sharedCircles: number;
}

const DashboardHero = ({
  displayName,
  totalCapsules,
  totalMedias,
  sharedCircles,
}: DashboardHeroProps) => {
  const { t } = useTranslation('dashboard');

  const firstName = displayName?.split(' ')[0] || '';

  const stats = [
    { value: totalCapsules, labelKey: 'stats.capsules' },
    { value: totalMedias, labelKey: 'stats.mediaFiles' },
    { value: sharedCircles, labelKey: 'stats.circles' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl mb-6 md:mb-8 shadow-xl"
      style={{
        background:
          'linear-gradient(135deg, hsl(var(--navy)) 0%, hsl(215 50% 18%) 60%, hsl(215 55% 14%) 100%)',
      }}
      data-tour="welcome"
    >
      {/* Decorative gold blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full blur-3xl opacity-25"
        style={{ background: 'hsl(var(--gold))' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full blur-3xl opacity-15"
        style={{ background: 'hsl(var(--gold-light))' }}
      />
      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-6 py-8 md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr,1fr] md:items-center">
          {/* Left: Greeting + CTAs */}
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-3">
              {t('welcome', { name: firstName })}{' '}
              <span style={{ color: 'hsl(var(--gold-light))' }}>👋</span>
            </h1>

            <p className="text-white/70 text-base md:text-lg max-w-xl mb-7">
              {totalCapsules === 0 ? t('subtitleEmpty') : t('subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: 'hsl(var(--gold))',
                  color: 'hsl(0 0% 100%)',
                }}
              >
                <Link to="/capsules/new">
                  <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                  {t('quickActions.newCapsule')}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl font-medium bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                <Link to="/timeline">
                  <Clock className="w-5 h-5 mr-2" />
                  {t('quickActions.viewTimeline')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.labelKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="rounded-2xl p-4 md:p-5 text-center backdrop-blur-sm"
                style={{
                  background: 'hsl(0 0% 100% / 0.06)',
                  border: '1px solid hsl(0 0% 100% / 0.12)',
                }}
              >
                <p
                  className="text-3xl md:text-4xl font-display font-bold leading-none"
                  style={{ color: 'hsl(var(--gold-light))' }}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] md:text-xs uppercase tracking-wider text-white/60 font-medium">
                  {t(s.labelKey, { count: s.value })}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DashboardHero;
