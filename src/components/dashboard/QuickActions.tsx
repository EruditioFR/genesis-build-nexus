import { motion } from 'framer-motion';
import { Plus, Clock, Users, Calendar, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      label: 'Nouvelle capsule',
      icon: Plus,
      href: '/capsules/new',
      color: 'bg-gradient-gold shadow-gold text-primary-foreground',
      primary: true,
    },
    {
      label: 'Ma timeline',
      icon: Clock,
      href: '/timeline',
      color: 'bg-primary/10 text-primary hover:bg-primary/20',
    },
    {
      label: 'Mes cercles',
      icon: Users,
      href: '/circles',
      color: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
    },
    {
      label: 'Calendrier',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-accent/10 text-accent hover:bg-accent/20',
    },
    {
      label: 'Importer',
      icon: Upload,
      href: '/import',
      color: 'bg-muted text-muted-foreground hover:bg-muted/80',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap gap-3"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
        >
          <Link
            to={action.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${action.color} ${action.primary ? 'hover:scale-105' : ''}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickActions;
