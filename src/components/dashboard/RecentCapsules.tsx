import { motion } from 'framer-motion';
import { Clock, Image, Video, FileText, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Capsule {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text';
  date: string;
  thumbnail?: string;
}

interface RecentCapsulesProps {
  capsules: Capsule[];
}

const RecentCapsules = ({ capsules }: RecentCapsulesProps) => {
  const getTypeIcon = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'text': return FileText;
    }
  };

  const getTypeLabel = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return 'Photo';
      case 'video': return 'Vidéo';
      case 'text': return 'Texte';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-6 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Dernières capsules
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/capsules">
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {capsules.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore créé de capsule
          </p>
          <Button className="gap-2" asChild>
            <Link to="/capsules/new">
              <Plus className="w-4 h-4" />
              Créer ma première capsule
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {capsules.map((capsule, index) => {
            const Icon = getTypeIcon(capsule.type);
            return (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {capsule.thumbnail ? (
                  <img 
                    src={capsule.thumbnail} 
                    alt={capsule.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {capsule.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getTypeLabel(capsule.type)} • {capsule.date}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecentCapsules;
