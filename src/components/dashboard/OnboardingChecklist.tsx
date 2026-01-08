import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Circle, Plus, Users, User, Image, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
      title: 'Créez votre première capsule',
      description: 'Commencez à préserver vos souvenirs',
      icon: Plus,
      href: '/capsules/new',
      completed: hasCapsule,
    },
    {
      id: 'circle',
      title: 'Invitez votre cercle',
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
        className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-border p-6 shadow-card overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="relative flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Sparkles className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              {allCompleted ? '🎉 Félicitations !' : 'Bienvenue sur MemoriaVita !'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allCompleted
                ? 'Vous êtes prêt à préserver vos souvenirs.'
                : 'Complétez ces étapes pour bien démarrer.'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">
              {completedCount}/{steps.length} étapes
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="relative space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {step.completed ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground line-through opacity-60">
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                    Fait !
                  </span>
                </div>
              ) : (
                <Link
                  to={step.href}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-soft transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                    <step.icon className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground group-hover:text-secondary transition-colors">
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Circle className="w-5 h-5 text-muted-foreground/50" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Skip button */}
        {!allCompleted && (
          <div className="relative mt-6 text-center">
            <button
              onClick={handleDismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Passer pour l'instant
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingChecklist;
