import { motion } from 'framer-motion';
import { Clock, Image, Users, Calendar, TrendingUp } from 'lucide-react';

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
      gradient: 'from-primary via-primary to-primary/80',
      iconBg: 'bg-white/20',
      bgPattern: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    {
      label: 'Médias stockés',
      value: stats.totalMedias,
      icon: Image,
      gradient: 'from-secondary via-secondary to-secondary/80',
      iconBg: 'bg-white/20',
      bgPattern: 'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    {
      label: 'Cercles partagés',
      value: stats.sharedCircles,
      icon: Users,
      gradient: 'from-accent via-accent to-accent/80',
      iconBg: 'bg-white/20',
      bgPattern: 'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    {
      label: 'Événements',
      value: stats.upcomingEvents,
      icon: Calendar,
      gradient: 'from-emerald-500 via-emerald-500 to-emerald-400',
      iconBg: 'bg-white/20',
      bgPattern: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative p-5 md:p-6 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-default`}
          style={{ backgroundImage: card.bgPattern }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              {card.value > 0 && (
                <div className="flex items-center gap-1 text-white/70 text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>Actif</span>
                </div>
              )}
            </div>
            
            <p className="text-4xl md:text-3xl font-display font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300 origin-left">
              {card.value}
            </p>
            <p className="text-sm text-white/80 font-medium">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
