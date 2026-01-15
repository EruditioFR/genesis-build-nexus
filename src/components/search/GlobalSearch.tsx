import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Image, Video, Music, Layers, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

const typeIcons: Record<CapsuleType, typeof FileText> = {
  text: FileText,
  photo: Image,
  video: Video,
  audio: Music,
  mixed: Layers,
};

const typeColors: Record<CapsuleType, string> = {
  text: 'bg-blue-500',
  photo: 'bg-emerald-500',
  video: 'bg-purple-500',
  audio: 'bg-orange-500',
  mixed: 'bg-pink-500',
};

interface GlobalSearchProps {
  userId: string;
}

const GlobalSearch = ({ userId }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Capsule[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);

      try {
        const searchTerm = query.toLowerCase().trim();
        
        // Search by title, description, and tags
        const { data, error } = await supabase
          .from('capsules')
          .select('*')
          .eq('user_id', userId)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Also filter by tags client-side since array contains is tricky
        let filteredResults = data || [];
        
        // If no results from title/description, try tags
        if (filteredResults.length === 0) {
          const { data: allCapsules } = await supabase
            .from('capsules')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (allCapsules) {
            filteredResults = allCapsules.filter(capsule =>
              capsule.tags?.some(tag => 
                tag.toLowerCase().includes(searchTerm)
              )
            ).slice(0, 10);
          }
        } else {
          // Also include tag matches
          const { data: allCapsules } = await supabase
            .from('capsules')
            .select('*')
            .eq('user_id', userId);

          if (allCapsules) {
            const tagMatches = allCapsules.filter(capsule =>
              capsule.tags?.some(tag => 
                tag.toLowerCase().includes(searchTerm)
              ) && !filteredResults.find(r => r.id === capsule.id)
            );
            filteredResults = [...filteredResults, ...tagMatches].slice(0, 10);
          }
        }

        setResults(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, userId]);

  const handleSelect = (capsuleId: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/capsules/${capsuleId}`);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-secondary/30 text-secondary-foreground rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 border-white/20 hidden sm:flex"
      >
        <Search className="w-4 h-4" />
        <span>Rechercher...</span>
        <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Mobile search button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden text-primary-foreground hover:bg-white/10"
      >
        <Search className="w-5 h-5" />
      </Button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          </DialogHeader>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 pb-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, description ou tags..."
              className="border-0 focus-visible:ring-0 px-0 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => setQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Aucune capsule trouvée pour "{query}"
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground">
                  {results.length} résultat{results.length > 1 ? 's' : ''}
                </p>
                <AnimatePresence>
                  {results.map((capsule, index) => {
                    const Icon = typeIcons[capsule.capsule_type];
                    const color = typeColors[capsule.capsule_type];
                    
                    return (
                      <motion.button
                        key={capsule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelect(capsule.id)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {highlightMatch(capsule.title, query)}
                          </p>
                          {capsule.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {highlightMatch(capsule.description, query)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(capsule.created_at), 'd MMM yyyy', { locale: fr })}
                            </span>
                            {capsule.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs h-5">
                                {highlightMatch(tag, query)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : !hasSearched ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground text-sm">
                  Commencez à taper pour rechercher vos capsules
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>Recherche dans vos capsules</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
              <span>sélectionner</span>
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] ml-2">esc</kbd>
              <span>fermer</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
