import { motion } from 'framer-motion';
import { Plus, Clock, Users, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      label: 'Nouveau souvenir',
      description: 'Ajouter un souvenir',
      icon: Plus,
      href: '/capsules/new',
      gradient: 'from-secondary via-secondary to-amber-400',
      iconBg: 'bg-white/20',
      primary: true,
    },
    {
      label: 'Ma chronologie',
      description: 'Parcourir le temps',
      icon: Clock,
      href: '/timeline',
      gradient: 'from-primary/90 to-primary',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Mes cercles',
      description: 'Famille & amis',
      icon: Users,
      href: '/circles',
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Calendrier',
      description: 'Dates importantes',
      icon: Calendar,
      href: '/calendar',
      gradient: 'from-accent to-rose-400',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Desktop: horizontal layout with enhanced design */}
      <div className="hidden md:flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
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
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className={`w-10 h-10 rounded-xl ${action.iconBg} backdrop-blur-sm flex items-center justify-center`}>
                <action.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{action.label}</span>
                <span className="text-xs text-white/70">{action.description}</span>
              </div>
              {action.primary && (
                <Sparkles className="w-4 h-4 ml-1 animate-pulse" />
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile: 2x2 grid app-like layout with enhanced design */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={action.href}
              className={`group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl font-medium text-sm transition-all duration-300 min-h-[120px] bg-gradient-to-br ${action.gradient} text-white shadow-lg overflow-hidden`}
            >
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white/5" />
              
              <div className={`relative w-14 h-14 rounded-2xl ${action.iconBg} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-7 h-7" strokeWidth={2} />
                {action.primary && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-secondary" />
                  </div>
                )}
              </div>
              <div className="relative text-center">
                <span className="font-bold block">{action.label}</span>
                <span className="text-xs text-white/70">{action.description}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
