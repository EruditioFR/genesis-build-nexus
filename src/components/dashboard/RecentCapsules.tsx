import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Image, Video, FileText, Plus, ArrowRight, Music, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/hooks/useCategories';

interface Capsule {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'audio' | 'mixed';
  date: string;
  thumbnail?: string;
}

interface RecentCapsulesProps {
  capsules: Capsule[];
}

interface CapsuleCategoryData {
  capsule_id: string;
  is_primary: boolean;
  category: Category;
}

const RecentCapsules = ({ capsules }: RecentCapsulesProps) => {
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      if (capsules.length === 0) return;
      
      const capsuleIds = capsules.map(c => c.id);
      const { data } = await supabase
        .from('capsule_categories')
        .select(`
          capsule_id,
          is_primary,
          category:categories(*)
        `)
        .in('capsule_id', capsuleIds)
        .eq('is_primary', true);

      if (data) {
        const categoryMap: Record<string, Category> = {};
        (data as unknown as CapsuleCategoryData[]).forEach((item) => {
          if (item.category) {
            categoryMap[item.capsule_id] = item.category;
          }
        });
        setCapsuleCategories(categoryMap);
      }
    };

    fetchCategories();
  }, [capsules]);

  const getTypeIcon = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'mixed': return Layers;
      case 'text': return FileText;
    }
  };

  const getTypeLabel = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return 'Photo';
      case 'video': return 'Vidéo';
      case 'audio': return 'Audio';
      case 'mixed': return 'Mixte';
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
                <CapsuleThumbnail
                  thumbnailUrl={capsule.thumbnail}
                  fallbackIcon={
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                  }
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {capsule.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground">
                      {getTypeLabel(capsule.type)} • {capsule.date}
                    </p>
                    {capsuleCategories[capsule.id] && (
                      <CategoryBadge 
                        category={capsuleCategories[capsule.id]} 
                        size="sm" 
                        showIcon={true}
                      />
                    )}
                  </div>
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
