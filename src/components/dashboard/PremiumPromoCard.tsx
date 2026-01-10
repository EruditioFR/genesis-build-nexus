import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TreeDeciduous, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PremiumPromoCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shrink-0">
              <TreeDeciduous className="h-8 w-8 text-primary" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Arbre Généalogique
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                Créez votre arbre généalogique interactif et reliez vos capsules à vos proches. 
                Préservez l'histoire de votre famille pour les générations futures.
              </p>
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Arbre illimité
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Liens capsules
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Export PDF
                </span>
              </div>
              
              <Button asChild className="w-full sm:w-auto mt-2" variant="default">
                <Link to="/premium" className="inline-flex items-center gap-2">
                  Découvrir Premium
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumPromoCard;
