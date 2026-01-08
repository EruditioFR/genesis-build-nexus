import { motion } from 'framer-motion';
import { Clock, Image, Users, Calendar } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalCapsules: number;
    totalMedias: number;
    sharedCircles: number;
    upcomingEvents: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: 'Capsules créées',
      value: stats.totalCapsules,
      icon: Clock,
      color: 'bg-primary/10 text-primary',
      iconBg: 'bg-primary/20',
    },
    {
      label: 'Médias stockés',
      value: stats.totalMedias,
      icon: Image,
      color: 'bg-secondary/10 text-secondary',
      iconBg: 'bg-secondary/20',
    },
    {
      label: 'Cercles partagés',
      value: stats.sharedCircles,
      icon: Users,
      color: 'bg-accent/10 text-accent',
      iconBg: 'bg-accent/20',
    },
    {
      label: 'Événements à venir',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'bg-navy-light/10 text-navy-light',
      iconBg: 'bg-navy-light/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`p-5 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 ${card.color}`}
        >
          <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
            <card.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
          <p className="text-sm text-muted-foreground">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
