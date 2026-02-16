import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemoryPrompts } from '@/hooks/useMemoryPrompts';

interface DashboardInspirationWidgetProps {
  className?: string;
}

const DashboardInspirationWidget = ({ className }: DashboardInspirationWidgetProps) => {
  const { loading, memoryCategories, getTotalProgress, getUnusedPrompts } = useMemoryPrompts();

  const totalProgress = getTotalProgress();

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
    );
  }

  // Collect 3 unused prompts from different categories
  const sampledPrompts: { prompt: { id: string; question: string }; categoryId: string; emoji: string }[] = [];
  for (const cat of memoryCategories) {
    if (sampledPrompts.length >= 3) break;
    const unused = getUnusedPrompts(cat);
    if (unused.length > 0) {
      sampledPrompts.push({ prompt: unused[0], categoryId: cat.id, emoji: cat.emoji });
    }
  }

  if (sampledPrompts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <h3 className="text-sm font-semibold text-foreground">Inspirations</h3>
          <span className="text-xs text-muted-foreground">
            {totalProgress.used}/{totalProgress.total}
          </span>
        </div>
        <Link
          to="/inspirations"
          className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
        >
          Tout voir
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 3 prompt previews - full text, no truncation */}
      <div className="space-y-2">
        {sampledPrompts.map(({ prompt, categoryId, emoji }) => (
          <Link
            key={prompt.id}
            to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${categoryId}`}
            className="group flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <span className="text-base flex-shrink-0 mt-0.5">{emoji}</span>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
              {prompt.question}
            </p>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-secondary flex-shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardInspirationWidget;
