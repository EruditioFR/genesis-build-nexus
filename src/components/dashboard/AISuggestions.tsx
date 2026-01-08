import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Calendar, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Suggestion {
  id: string;
  type: 'memory' | 'event' | 'gift';
  title: string;
  description: string;
}

interface AISuggestionsProps {
  suggestions: Suggestion[];
  userName?: string;
}

const AISuggestions = ({ suggestions, userName }: AISuggestionsProps) => {
  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'memory': return Lightbulb;
      case 'event': return Calendar;
      case 'gift': return Gift;
    }
  };

  const getTypeColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'memory': return 'bg-secondary/10 text-secondary';
      case 'event': return 'bg-accent/10 text-accent';
      case 'gift': return 'bg-primary/10 text-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold animate-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Suggestions IA
          </h3>
          <p className="text-sm text-muted-foreground">
            Personnalisées pour vous{userName ? `, ${userName}` : ''}
          </p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            Ajoutez plus de contenu pour recevoir des suggestions personnalisées
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = getTypeIcon(suggestion.type);
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-secondary/50 hover:shadow-soft transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${getTypeColor(suggestion.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground gap-2">
        <Sparkles className="w-4 h-4" />
        Générer plus de suggestions
      </Button>
    </motion.div>
  );
};

export default AISuggestions;
