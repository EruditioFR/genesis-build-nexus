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
  const items = [
    {
      label: 'Capsules',
      value: stats.totalCapsules,
      icon: Clock,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
    {
      label: 'Médias',
      value: stats.totalMedias,
      icon: Image,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Cercles',
      value: stats.sharedCircles,
      icon: Users,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
    },
    {
      label: 'Événements',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-2 sm:gap-4 py-4 px-3 sm:px-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#1a1a2e]/10"
    >
      {items.map((item, index) => (
        <div 
          key={item.label} 
          className="flex flex-col items-center text-center flex-1"
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-2`}>
            <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            {item.value}
          </p>
          <p className="text-xs sm:text-sm text-[#1a1a2e]/60 font-medium">
            {item.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
