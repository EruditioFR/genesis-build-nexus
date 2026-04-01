import { useState } from 'react';
import { UserPlus, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FamilyAvatar } from '@/components/familyTree/FamilyAvatar';
import type { PhotoTag } from '@/hooks/usePhotoTags';

interface FamilyPersonBasic {
  id: string;
  first_names: string;
  last_name: string;
  profile_photo_url?: string | null;
}

interface PhotoTagOverlayProps {
  tags: PhotoTag[];
  isEditing: boolean;
  onClickImage?: (x: number, y: number) => void;
  onRemoveTag?: (tagId: string) => void;
  showTags: boolean;
  // Person picker
  pickerPosition?: { x: number; y: number } | null;
  persons?: FamilyPersonBasic[];
  onSelectPerson?: (person: FamilyPersonBasic) => void;
  onCancelPicker?: () => void;
}

export function PhotoTagOverlay({
  tags,
  isEditing,
  onClickImage,
  onRemoveTag,
  showTags,
  pickerPosition,
  persons = [],
  onSelectPerson,
  onCancelPicker,
}: PhotoTagOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersons = persons.filter(p => {
    const name = `${p.first_names} ${p.last_name}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Already tagged person IDs
  const taggedIds = new Set(tags.map(t => t.person_id));

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !onClickImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onClickImage(x, y);
  };

  return (
    <div
      className="absolute inset-0"
      onClick={handleImageClick}
      style={{ cursor: isEditing ? 'crosshair' : 'default' }}
    >
      {/* Existing tags */}
      <AnimatePresence>
        {showTags && tags.map(tag => (
          <motion.div
            key={tag.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${tag.position_x}%`, top: `${tag.position_y}%` }}
          >
            {/* Tag dot */}
            <div className="w-6 h-6 rounded-full bg-secondary border-2 border-white shadow-lg flex items-center justify-center">
              <UserPlus className="w-3 h-3 text-secondary-foreground" />
            </div>
            {/* Name tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {tag.person_name}
            </div>
            {/* Remove button */}
            {isEditing && onRemoveTag && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveTag(tag.id); }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Person picker popup */}
      <AnimatePresence>
        {pickerPosition && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute z-20 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            style={{
              left: `${Math.min(pickerPosition.x, 70)}%`,
              top: `${Math.min(pickerPosition.y, 60)}%`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">Taguer une personne</span>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onCancelPicker}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-7 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="max-h-48">
              <div className="p-1 space-y-0.5">
                {filteredPersons.filter(p => !taggedIds.has(p.id)).length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Aucune personne disponible
                  </p>
                ) : (
                  filteredPersons
                    .filter(p => !taggedIds.has(p.id))
                    .map(person => (
                      <button
                        key={person.id}
                        onClick={() => onSelectPerson?.(person)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-muted transition-colors"
                      >
                        <FamilyAvatar
                          photoUrl={person.profile_photo_url}
                          fallback={`${person.first_names[0]}${person.last_name[0]}`}
                          className="w-7 h-7"
                          fallbackClassName="text-xs"
                        />
                        <span className="text-sm truncate">
                          {person.first_names} {person.last_name}
                        </span>
                      </button>
                    ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
