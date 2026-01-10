import { motion } from 'framer-motion';
import { TreePine, Users, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FamilyTreeCardProps {
  personsCount?: number;
}

const FamilyTreeCard = ({ personsCount = 0 }: FamilyTreeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
          <TreePine className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Arbre Généalogique
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Explorez votre histoire familiale
          </p>
        </div>
      </div>

      {personsCount > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {personsCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {personsCount === 1 ? 'membre' : 'membres'} dans votre arbre
              </p>
            </div>
          </div>

          <Button asChild className="w-full gap-2">
            <Link to="/family-tree">
              Voir mon arbre
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <TreePine className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Commencez à construire votre arbre familial
            </p>
            <p className="text-xs text-muted-foreground/70">
              Ajoutez vos ancêtres et reliez-les à vos capsules
            </p>
          </div>

          <Button asChild className="w-full gap-2">
            <Link to="/family-tree">
              Créer mon arbre
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default FamilyTreeCard;
