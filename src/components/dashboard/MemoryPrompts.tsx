import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Home,
  Wallet,
  Wind,
  ChefHat,
  Target,
  Camera,
  Heart,
  MessageCircle,
  Music,
  Lock,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MemoryPrompt {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  category: 'moments' | 'emotions' | 'heritage';
}

const allPrompts: MemoryPrompt[] = [
  {
    id: 'leaving-home',
    title: 'Le jour où j\'ai quitté la maison',
    description: 'Ce moment de liberté et d\'émotion qui marque le début d\'une nouvelle vie',
    icon: Home,
    gradient: 'from-blue-500 to-indigo-600',
    category: 'moments',
  },
  {
    id: 'first-salary',
    title: 'Mon premier salaire',
    description: 'La fierté de gagner sa vie et ce que vous en avez fait',
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-600',
    category: 'moments',
  },
  {
    id: 'childhood-smell',
    title: 'Une odeur qui me ramène en enfance',
    description: 'Ces parfums qui déclenchent instantanément des souvenirs précieux',
    icon: Wind,
    gradient: 'from-pink-500 to-rose-600',
    category: 'emotions',
  },
  {
    id: 'family-recipe',
    title: 'La recette qui raconte notre famille',
    description: 'Ce plat transmis de génération en génération avec ses secrets',
    icon: ChefHat,
    gradient: 'from-orange-500 to-amber-600',
    category: 'heritage',
  },
  {
    id: 'failure-growth',
    title: 'Un échec qui m\'a construit',
    description: 'Les leçons les plus précieuses viennent souvent des moments difficiles',
    icon: Target,
    gradient: 'from-purple-500 to-violet-600',
    category: 'emotions',
  },
  {
    id: 'photo-story',
    title: 'Une photo et son histoire',
    description: 'Derrière chaque image se cache un récit unique à partager',
    icon: Camera,
    gradient: 'from-cyan-500 to-blue-600',
    category: 'moments',
  },
  {
    id: 'grandchildren-legacy',
    title: 'Ce que j\'aimerais que mes petits-enfants retiennent',
    description: 'Transmettre l\'essentiel de votre vie et de vos valeurs',
    icon: Heart,
    gradient: 'from-red-500 to-rose-600',
    category: 'heritage',
  },
  {
    id: 'best-advice',
    title: 'Le plus beau conseil qu\'on m\'a donné',
    description: 'Ces mots qui ont changé votre façon de voir la vie',
    icon: MessageCircle,
    gradient: 'from-teal-500 to-cyan-600',
    category: 'emotions',
  },
  {
    id: 'life-song',
    title: 'Ma chanson de vie',
    description: 'La mélodie qui vous accompagne et ce qu\'elle représente',
    icon: Music,
    gradient: 'from-fuchsia-500 to-pink-600',
    category: 'emotions',
  },
  {
    id: 'unsaid-words',
    title: 'Ce que je n\'ai jamais osé dire',
    description: 'Les mots du cœur à confier en toute intimité',
    icon: Lock,
    gradient: 'from-slate-500 to-gray-600',
    category: 'heritage',
  },
];

interface MemoryPromptsProps {
  className?: string;
  showAll?: boolean;
}

const MemoryPrompts = ({ className, showAll = false }: MemoryPromptsProps) => {
  const [displayedPrompts, setDisplayedPrompts] = useState<MemoryPrompt[]>(() => {
    // Show 3 random prompts initially
    const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPrompts = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
      setDisplayedPrompts(shuffled.slice(0, 3));
      setIsRefreshing(false);
    }, 300);
  };

  const promptsToShow = showAll ? allPrompts : displayedPrompts;

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/70 text-white shadow-md">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Idées de souvenirs
            </h3>
            <p className="text-sm text-muted-foreground">
              Laissez-vous inspirer pour commencer
            </p>
          </div>
        </div>
        {!showAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPrompts}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            Autres idées
          </Button>
        )}
      </div>

      {/* Prompts Grid */}
      <div className={cn(
        'grid gap-3',
        showAll ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      )}>
        <AnimatePresence mode="wait">
          {promptsToShow.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={`/capsule/create?prompt=${encodeURIComponent(prompt.title)}`}
                className="group flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-card transition-all duration-300"
              >
                <div
                  className={cn(
                    'flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                    prompt.gradient
                  )}
                >
                  <prompt.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors mb-1 line-clamp-1">
                    {prompt.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prompt.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All Link */}
      {!showAll && (
        <div className="mt-4 text-center">
          <Link
            to="/capsule/create"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Voir toutes les idées ou créer librement
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default MemoryPrompts;
