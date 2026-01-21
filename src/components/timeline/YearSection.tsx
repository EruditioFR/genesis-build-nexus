import { motion } from 'framer-motion';
import { Hash, ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface YearSectionProps {
  year: string;
  capsuleCount: number;
  children: ReactNode;
}

const YearSection = ({ year, capsuleCount, children }: YearSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3 }}
        className="sticky top-[100px] z-20 mb-4"
      >
        <CollapsibleTrigger asChild>
          <button className="group w-full flex items-center justify-center gap-2 cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-secondary/50 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Hash className="w-4 h-4 text-secondary" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                {year}
              </span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                {capsuleCount}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-0' : '-rotate-90'
                }`} 
              />
            </div>
          </button>
        </CollapsibleTrigger>
      </motion.div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default YearSection;
