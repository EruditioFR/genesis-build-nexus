import { motion } from 'framer-motion';

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
      singular: 'Souvenir',
      plural: 'Souvenirs',
      value: stats.totalCapsules,
    },
    {
      singular: 'Média',
      plural: 'Médias',
      value: stats.totalMedias,
    },
    {
      singular: 'Partage',
      plural: 'Partages',
      value: stats.sharedCircles,
    },
    {
      singular: 'Événement',
      plural: 'Événements',
      value: stats.upcomingEvents,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-2 sm:gap-4 py-4 px-3 sm:px-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#1a1a2e]/10"
      data-tour="stats"
    >
      {items.map((item) => (
        <div 
          key={item.singular} 
          className="flex flex-col items-center text-center flex-1"
        >
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            {item.value}
          </p>
          <p className="text-xs sm:text-sm text-[#1a1a2e]/60 font-medium">
            {item.value === 1 ? item.singular : item.plural}
          </p>
        </div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
