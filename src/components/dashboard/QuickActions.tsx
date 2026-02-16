import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, TreeDeciduous, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const { t } = useTranslation('dashboard');

  const actions = [
    {
      labelKey: 'quickActions.newCapsule',
      icon: Plus,
      href: '/capsules/new',
      gradient: 'from-secondary to-secondary/80',
      primary: true,
    },
    {
      labelKey: 'quickActions.viewTimeline',
      icon: Clock,
      href: '/timeline',
      gradient: 'from-primary to-primary/80',
    },
    {
      labelKey: 'quickActions.familyTree',
      icon: TreeDeciduous,
      href: '/family-tree',
      gradient: 'from-muted-foreground/90 to-muted-foreground/70',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      data-tour="quick-actions"
    >
      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.labelKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={action.href}
              className={`group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 bg-gradient-to-r ${action.gradient} text-white shadow-lg hover:shadow-xl overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <action.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" strokeWidth={2.5} />
              </div>
              <span className="font-semibold">{t(action.labelKey)}</span>
              {action.primary && (
                <Sparkles className="w-4 h-4 ml-1 animate-pulse" />
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile: compact horizontal scrollable row */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden scrollbar-hide">
        {actions.map((action, index) => (
          <motion.div
            key={action.labelKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link
              to={action.href}
              className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 bg-gradient-to-r ${action.gradient} text-white shadow-md`}
            >
              <action.icon className="w-4 h-4" strokeWidth={2.5} />
              <span className="whitespace-nowrap">{t(action.labelKey)}</span>
              {action.primary && (
                <Sparkles className="w-3 h-3 animate-pulse" />
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
