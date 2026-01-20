import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Circle, Plus, Users, User, X, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import MemoryPrompts from './MemoryPrompts';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  hasProfile: boolean;
  hasCapsule: boolean;
  hasCircle: boolean;
  onDismiss: () => void;
}

const OnboardingChecklist = ({
  hasProfile,
  hasCapsule,
  hasCircle,
  onDismiss,
}: OnboardingChecklistProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complétez votre profil',
      description: 'Ajoutez une photo et vos informations',
      icon: User,
      href: '/profile',
      completed: hasProfile,
    },
    {
      id: 'capsule',
      title: 'Créez votre premier souvenir',
      description: 'Commencez à préserver vos souvenirs précieux',
      icon: Plus,
      href: '/capsules/new',
      completed: hasCapsule,
    },
    {
      id: 'circle',
      title: 'Invitez vos proches',
      description: 'Partagez avec votre famille ou amis',
      icon: Users,
      href: '/circles',
      completed: hasCircle,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const allCompleted = completedCount === steps.length;

  // Auto-dismiss when all completed
  useEffect(() => {
    if (allCompleted) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-border overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        {/* Main Content */}
        <div className="relative p-6">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground z-10"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg">
              {allCompleted ? (
                <Sparkles className="w-7 h-7 text-white" />
              ) : (
                <Rocket className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                {allCompleted ? '🎉 Félicitations !' : 'Bienvenue sur Family Garden !'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {allCompleted
                  ? 'Vous êtes prêt à préserver vos souvenirs précieux.'
                  : 'Préservez vos souvenirs pour les transmettre à vos proches.'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-foreground">
                Progression : {completedCount}/{steps.length} étapes
              </span>
              <span className="text-secondary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {step.completed ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground/60 line-through">
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-secondary bg-secondary/15 px-3 py-1.5 rounded-full">
                      ✓ Fait
                    </span>
                  </div>
                ) : (
                  <Link
                    to={step.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
                      <step.icon className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Toggle Memory Prompts */}
          {!hasCapsule && (
            <div className="border-t border-border pt-5">
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-foreground">
                    Besoin d'inspiration pour votre premier souvenir ?
                  </span>
                </div>
                <ArrowRight className={`w-5 h-5 text-muted-foreground transition-transform ${showPrompts ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showPrompts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <MemoryPrompts />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Skip button */}
          {!allCompleted && (
            <div className="mt-4 text-center">
              <button
                onClick={handleDismiss}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Passer pour l'instant
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingChecklist;
