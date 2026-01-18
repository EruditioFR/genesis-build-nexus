import { motion } from 'framer-motion';
import { FileText, Image, Video, Music, Layers, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];

interface CapsulePreviewProps {
  title: string;
  description: string;
  content: string;
  capsuleType: CapsuleType;
  tags: string[];
}

const typeConfig: Record<CapsuleType, { icon: typeof FileText; label: string; color: string }> = {
  text: { icon: FileText, label: 'Texte', color: 'bg-primary/10 text-primary' },
  photo: { icon: Image, label: 'Photo', color: 'bg-secondary/10 text-secondary' },
  video: { icon: Video, label: 'Vidéo', color: 'bg-accent/10 text-accent' },
  audio: { icon: Music, label: 'Audio', color: 'bg-navy-light/10 text-navy-light' },
  mixed: { icon: Layers, label: 'Mixte', color: 'bg-terracotta/10 text-terracotta' },
};

const CapsulePreview = ({ title, description, content, capsuleType, tags }: CapsulePreviewProps) => {
  const config = typeConfig[capsuleType];
  const Icon = config.icon;
  const hasContent = title || description || content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">Aperçu du souvenir</h3>
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Commencez à remplir le formulaire<br />pour voir l'aperçu
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">{config.label}</span>
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-xl font-display font-bold text-foreground line-clamp-2">
              {title}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}

          {/* Content preview */}
          {content && capsuleType === 'text' && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                {content}
              </p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CapsulePreview;
