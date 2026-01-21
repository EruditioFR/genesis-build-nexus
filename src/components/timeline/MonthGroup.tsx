import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { ReactNode } from 'react';

interface MonthGroupProps {
  month: string;
  capsuleCount: number;
  children: ReactNode;
}

const MonthGroup = ({ month, capsuleCount, children }: MonthGroupProps) => {
  return (
    <div className="mb-8 last:mb-0">
      {/* En-tête du mois */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-4 ml-12 sm:ml-0 sm:justify-center"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
          <Calendar className="w-3.5 h-3.5 text-secondary" />
          <span className="text-sm font-medium text-secondary capitalize">
            {month}
          </span>
          <span className="text-xs text-secondary/70 font-normal">
            ({capsuleCount})
          </span>
        </div>
      </motion.div>

      {/* Grille des capsules */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default MonthGroup;
