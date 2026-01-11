import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Image, Video, Music, FileText, Layers, ChevronRight, Plus, Filter, X, Play, ChevronUp, Folder } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StoryViewer from '@/components/story/StoryViewer';
import { useStoryMode } from '@/hooks/useStoryMode';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import { useCategories, type Category } from '@/hooks/useCategories';

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

const capsuleTypeConfig: Record<CapsuleType, { icon: typeof FileText; label: string; color: string }> = {
  text: { icon: FileText, label: 'Texte', color: 'bg-blue-500' },
  photo: { icon: Image, label: 'Photo', color: 'bg-emerald-500' },
  video: { icon: Video, label: 'Vidéo', color: 'bg-purple-500' },
  audio: { icon: Music, label: 'Audio', color: 'bg-orange-500' },
  mixed: { icon: Layers, label: 'Mixte', color: 'bg-pink-500' },
};

const statusConfig: Record<CapsuleStatus, { label: string }> = {
  draft: { label: 'Brouillon' },
  published: { label: 'Publié' },
  scheduled: { label: 'Programmé' },
  archived: { label: 'Archivé' },
};

interface GroupedCapsules {
  [year: string]: {
    [month: string]: Capsule[];
  };
}

const Timeline = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [activeDecade, setActiveDecade] = useState<string | null>(null);
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});

  // Story mode
  const { isOpen: storyOpen, items: storyItems, initialIndex, loading: storyLoading, openStory, closeStory } = useStoryMode();

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<CapsuleType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CapsuleStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Extract all unique tags from capsules
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    capsules.forEach((c) => c.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [capsules]);

  // Filtered capsules
  const filteredCapsules = useMemo(() => {
    return capsules.filter((capsule) => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(capsule.capsule_type);
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(capsule.status);
      const tagMatch = selectedTags.length === 0 || selectedTags.some((t) => capsule.tags?.includes(t));
      const categoryMatch = selectedCategories.length === 0 || 
        (capsuleCategories[capsule.id] && selectedCategories.includes(capsuleCategories[capsule.id].id));
      return typeMatch && statusMatch && tagMatch && categoryMatch;
    });
  }, [capsules, selectedTypes, selectedStatuses, selectedTags, selectedCategories, capsuleCategories]);

  // Extract decades from filtered capsules
  const decades = useMemo(() => {
    const decadeSet = new Set<string>();
    filteredCapsules.forEach((capsule) => {
      const year = parseInt(format(parseISO(capsule.created_at), 'yyyy'));
      const decade = Math.floor(year / 10) * 10;
      decadeSet.add(decade.toString());
    });
    return Array.from(decadeSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [filteredCapsules]);

  // Scroll to decade
  const scrollToDecade = (decade: string) => {
    const element = document.getElementById(`decade-${decade}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Track active decade on scroll
  useEffect(() => {
    const handleScroll = () => {
      const decadeElements = decades.map((d) => ({
        decade: d,
        element: document.getElementById(`decade-${d}`),
      }));

      for (const { decade, element } of decadeElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom > 0) {
            setActiveDecade(decade);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [decades]);

  const activeFiltersCount = selectedTypes.length + selectedStatuses.length + selectedTags.length + selectedCategories.length;

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSelectedCategories([]);
  };

  const toggleType = (type: CapsuleType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleStatus = (status: CapsuleStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [capsulesRes, profileRes] = await Promise.all([
          supabase
            .from('capsules')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (capsulesRes.data) {
          setCapsules(capsulesRes.data);
          
          // Fetch categories for all capsules
          if (capsulesRes.data.length > 0) {
            const capsuleIds = capsulesRes.data.map(c => c.id);
            const { data: categoriesData } = await supabase
              .from('capsule_categories')
              .select(`
                capsule_id,
                is_primary,
                category:categories(*)
              `)
              .in('capsule_id', capsuleIds)
              .eq('is_primary', true);

            if (categoriesData) {
              const categoryMap: Record<string, Category> = {};
              (categoriesData as any[]).forEach((item) => {
                if (item.category) {
                  categoryMap[item.capsule_id] = item.category;
                }
              });
              setCapsuleCategories(categoryMap);
            }
          }
        }
        if (profileRes.data) setProfile(profileRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Group filtered capsules by decade, year and month
  const groupedByDecade = useMemo(() => {
    const result: Record<string, GroupedCapsules> = {};
    
    filteredCapsules.forEach((capsule) => {
      const date = parseISO(capsule.created_at);
      const year = format(date, 'yyyy');
      const month = format(date, 'MMMM', { locale: fr });
      const decade = (Math.floor(parseInt(year) / 10) * 10).toString();

      if (!result[decade]) result[decade] = {};
      if (!result[decade][year]) result[decade][year] = {};
      if (!result[decade][year][month]) result[decade][year][month] = [];
      result[decade][year][month].push(capsule);
    });

    return result;
  }, [filteredCapsules]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Story Viewer Modal */}
      <AnimatePresence>
        {storyOpen && storyItems.length > 0 && (
          <StoryViewer
            items={storyItems}
            initialIndex={initialIndex}
            onClose={closeStory}
            autoPlay
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-warm">
      <DashboardHeader
        user={{
          id: user.id,
          email: user.email,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold shadow-gold mb-4">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Votre Chronologie
          </h1>
          <p className="text-muted-foreground">
            {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (sur ${capsules.length})`}
          </p>
          
          {/* Story Mode Button */}
          {filteredCapsules.length > 0 && (
            <Button
              onClick={() => openStory(filteredCapsules)}
              disabled={storyLoading}
              className="mt-4 gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
            >
              <Play className="w-4 h-4" />
              {storyLoading ? 'Chargement...' : 'Lancer le diaporama'}
            </Button>
          )}
        </motion.div>

        {/* Filters */}
        {capsules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
          >
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Type
                  {selectedTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedTypes.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-popover">
                <DropdownMenuLabel>Type de capsule</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(capsuleTypeConfig) as CapsuleType[]).map((type) => {
                  const config = capsuleTypeConfig[type];
                  return (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    >
                      <config.icon className="w-4 h-4 mr-2" />
                      {config.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Statut
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-popover">
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(statusConfig) as CapsuleStatus[]).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  >
                    {statusConfig[status].label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Mots-clés
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 max-h-64 overflow-y-auto bg-popover">
                  <DropdownMenuLabel>Mots-clés</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Folder className="w-4 h-4" />
                    Catégorie
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 max-h-64 overflow-y-auto bg-popover">
                  <DropdownMenuLabel>Catégorie</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name_fr}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Effacer ({activeFiltersCount})
              </Button>
            )}
          </motion.div>
        )}

        {capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-2xl border border-border"
          >
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Votre chronologie est vide
            </h2>
            <p className="text-muted-foreground mb-6">
              Créez votre première capsule pour commencer
            </p>
            <Button
              onClick={() => navigate('/capsules/new')}
              className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Créer une capsule
            </Button>
          </motion.div>
        ) : filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-2xl border border-border"
          >
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucune capsule trouvée
            </h2>
            <p className="text-muted-foreground mb-6">
              Aucune capsule ne correspond à vos filtres
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Effacer les filtres
            </Button>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Decade Navigation - Sticky */}
            {decades.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-16 z-20 mb-8 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-lg border-b border-border"
              >
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-2 font-medium">Décennies:</span>
                  {decades.map((decade) => (
                    <Button
                      key={decade}
                      variant={activeDecade === decade ? "default" : "outline"}
                      size="sm"
                      onClick={() => scrollToDecade(decade)}
                      className={`text-sm font-medium transition-all ${
                        activeDecade === decade
                          ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                          : 'hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      {decade}s
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Animated progress line */}
            <motion.div
              className="absolute left-[23px] sm:left-1/2 sm:-translate-x-[2px] top-0 bottom-0 w-1 bg-gradient-gold origin-top rounded-full"
              style={{ scaleY, opacity: 0.3 }}
            />
            
            {/* Static timeline line */}
            <div className="absolute left-[23px] sm:left-1/2 sm:-translate-x-[2px] top-0 bottom-0 w-1 bg-border rounded-full" />

            {Object.entries(groupedByDecade)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([decade, years]) => (
              <div key={decade} id={`decade-${decade}`} className="relative">
                {/* Decade marker */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-center mb-8 pt-4"
                >
                  <div className="px-8 py-3 bg-gradient-to-r from-secondary to-primary text-primary-foreground rounded-full font-display font-bold text-xl shadow-lg">
                    Années {decade}
                  </div>
                </motion.div>

                {Object.entries(years)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, months]) => (
                  <div key={year} className="relative mb-8">
                    {/* Year marker */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.3 }}
                      className="sticky top-32 z-10 flex items-center justify-center mb-6"
                    >
                      <div className="px-5 py-1.5 bg-card border border-border text-foreground rounded-full font-display font-semibold text-base shadow-sm">
                        {year}
                      </div>
                    </motion.div>

                    {Object.entries(months).map(([month, monthCapsules]) => (
                      <div key={`${year}-${month}`} className="mb-10">
                        {/* Month marker */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 mb-6 ml-12 sm:ml-0 sm:justify-center"
                        >
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium text-secondary capitalize">
                            {month}
                          </span>
                        </motion.div>

                        {/* Capsules */}
                        <div className="space-y-6">
                          {monthCapsules.map((capsule, index) => (
                            <TimelineItem
                              key={capsule.id}
                              capsule={capsule}
                              index={index}
                              isLeft={index % 2 === 0}
                              onClick={() => navigate(`/capsules/${capsule.id}`)}
                              category={capsuleCategories[capsule.id]}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Scroll to top button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-30 p-3 bg-gradient-gold text-primary-foreground rounded-full shadow-gold hover:opacity-90 transition-opacity"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </main>
    </div>
    </>
  );
};

const TimelineItem = ({
  capsule,
  index,
  isLeft,
  onClick,
  category,
}: {
  capsule: Capsule;
  index: number;
  isLeft: boolean;
  onClick: () => void;
  category?: Category;
}) => {
  const config = capsuleTypeConfig[capsule.capsule_type];
  const Icon = config.icon;
  const date = parseISO(capsule.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative flex items-center gap-4 ${
        isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
    >
      {/* Timeline dot */}
      <div className="absolute left-[19px] sm:left-1/2 sm:-translate-x-1/2 z-10">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`w-3 h-3 rounded-full ${config.color} ring-4 ring-background shadow-lg`}
        />
      </div>

      {/* Spacer for mobile */}
      <div className="w-12 flex-shrink-0 sm:hidden" />

      {/* Content card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={onClick}
        className={`flex-1 sm:w-[calc(50%-2rem)] cursor-pointer group ${
          isLeft ? 'sm:pr-8' : 'sm:pl-8'
        }`}
      >
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all duration-300">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
                {capsule.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(date, 'd MMMM yyyy, HH:mm', { locale: fr })}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>

          {/* Description */}
          {capsule.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {capsule.description}
            </p>
          )}

          {/* Tags, Category & Status */}
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <CategoryBadge category={category} size="sm" />
            )}
            <Badge
              variant={capsule.status === 'published' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {capsule.status === 'published' ? 'Publié' : 'Brouillon'}
            </Badge>
            {capsule.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {capsule.tags && capsule.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{capsule.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Desktop spacer */}
      <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
    </motion.div>
  );
};

export default Timeline;
