import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Filter, X, Folder, CalendarRange, FileText, Image, Video, Music, Play } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import StoryViewer from '@/components/story/StoryViewer';
import { useStoryMode } from '@/hooks/useStoryMode';
import { useCategories, type Category } from '@/hooks/useCategories';
import DecadeGrid from '@/components/timeline/DecadeGrid';
import DecadeModal from '@/components/timeline/DecadeModal';
import YearModal from '@/components/timeline/YearModal';
import { TimelineEmpty, TimelineHeader } from '@/components/timeline';

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

// Helper to get the relevant date for timeline
const getCapsuleDate = (capsule: Capsule): Date => {
  if (capsule.memory_date) {
    return parseISO(capsule.memory_date);
  }
  return parseISO(capsule.created_at);
};

const capsuleTypeConfig: Record<CapsuleType, { icon: typeof FileText; label: string }> = {
  text: { icon: FileText, label: 'Texte' },
  photo: { icon: Image, label: 'Photo' },
  video: { icon: Video, label: 'Vidéo' },
  audio: { icon: Music, label: 'Audio' },
  mixed: { icon: Layers, label: 'Mixte' },
};

const statusConfig: Record<CapsuleStatus, { label: string }> = {
  draft: { label: 'Brouillon' },
  published: { label: 'Publié' },
  scheduled: { label: 'Programmé' },
  archived: { label: 'Archivé' },
};

const Timeline = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});

  // Modal states
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Story mode
  const { isOpen: storyOpen, items: storyItems, initialIndex, loading: storyLoading, openStory, closeStory } = useStoryMode();

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<CapsuleType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CapsuleStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Extract all unique tags
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
      
      const capsuleDate = getCapsuleDate(capsule);
      const dateFromMatch = !dateFrom || !isBefore(capsuleDate, startOfDay(dateFrom));
      const dateToMatch = !dateTo || !isAfter(capsuleDate, endOfDay(dateTo));
      
      return typeMatch && statusMatch && tagMatch && categoryMatch && dateFromMatch && dateToMatch;
    });
  }, [capsules, selectedTypes, selectedStatuses, selectedTags, selectedCategories, capsuleCategories, dateFrom, dateTo]);

  // Extract decades with counts
  const { decades, decadeCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCapsules.forEach((capsule) => {
      const date = getCapsuleDate(capsule);
      const year = parseInt(format(date, 'yyyy'));
      const decade = (Math.floor(year / 10) * 10).toString();
      counts[decade] = (counts[decade] || 0) + 1;
    });
    const sortedDecades = Object.keys(counts).sort((a, b) => parseInt(b) - parseInt(a));
    return { decades: sortedDecades, decadeCounts: counts };
  }, [filteredCapsules]);

  // Get years for selected decade
  const yearsForDecade = useMemo(() => {
    if (!selectedDecade) return {};
    const years: Record<string, number> = {};
    filteredCapsules.forEach((capsule) => {
      const date = getCapsuleDate(capsule);
      const year = format(date, 'yyyy');
      const decade = (Math.floor(parseInt(year) / 10) * 10).toString();
      if (decade === selectedDecade) {
        years[year] = (years[year] || 0) + 1;
      }
    });
    return years;
  }, [filteredCapsules, selectedDecade]);

  // Get capsules for selected year
  const capsulesForYear = useMemo(() => {
    if (!selectedYear) return [];
    return filteredCapsules.filter((capsule) => {
      const date = getCapsuleDate(capsule);
      return format(date, 'yyyy') === selectedYear;
    }).sort((a, b) => {
      const dateA = getCapsuleDate(a);
      const dateB = getCapsuleDate(b);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredCapsules, selectedYear]);

  const activeFiltersCount = selectedTypes.length + selectedStatuses.length + selectedTags.length + selectedCategories.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSelectedCategories([]);
    setDateFrom(undefined);
    setDateTo(undefined);
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
          const sortedCapsules = [...capsulesRes.data].sort((a, b) => {
            const dateA = getCapsuleDate(a);
            const dateB = getCapsuleDate(b);
            return dateB.getTime() - dateA.getTime();
          });
          setCapsules(sortedCapsules);
          
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement de votre chronologie...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Story Viewer */}
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

      {/* Decade Modal */}
      <DecadeModal
        decade={selectedDecade && !selectedYear ? selectedDecade : null}
        years={yearsForDecade}
        onClose={() => setSelectedDecade(null)}
        onYearClick={(year) => setSelectedYear(year)}
      />

      {/* Year Modal */}
      <YearModal
        year={selectedYear}
        decade={selectedDecade}
        capsules={capsulesForYear}
        capsuleCategories={capsuleCategories}
        onClose={() => {
          setSelectedYear(null);
          setSelectedDecade(null);
        }}
        onBackToDecade={() => setSelectedYear(null)}
        onCapsuleClick={(id) => navigate(`/capsules/${id}`)}
      />

      <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0 overflow-x-hidden">
        <DashboardHeader
          user={{
            id: user.id,
            email: user.email,
            displayName: profile?.display_name || undefined,
            avatarUrl: profile?.avatar_url || undefined,
          }}
          onSignOut={handleSignOut}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <TimelineHeader
            filteredCount={filteredCapsules.length}
            totalCount={capsules.length}
            activeFiltersCount={activeFiltersCount}
            storyLoading={storyLoading}
            onLaunchStory={() => openStory(filteredCapsules)}
            hasCapules={capsules.length > 0}
          />

          {/* Filters */}
          {capsules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8 flex flex-wrap items-center justify-center gap-2"
            >
              {/* Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 px-3">
                    <Layers className="w-4 h-4" />
                    <span className="hidden xs:inline">Type</span>
                    {selectedTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-popover">
                  <DropdownMenuLabel>Type de souvenir</DropdownMenuLabel>
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
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 px-3">
                    <Filter className="w-4 h-4" />
                    <span className="hidden xs:inline">Statut</span>
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 px-3">
                      <span className="hidden xs:inline">Mots-clés</span>
                      <span className="xs:hidden">#</span>
                      {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 px-3">
                      <Folder className="w-4 h-4" />
                      <span className="hidden xs:inline">Catégorie</span>
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
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

              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 px-3">
                    <CalendarRange className="w-4 h-4" />
                    <span className="hidden xs:inline">Période</span>
                    {(dateFrom || dateTo) && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {(dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Du</p>
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        disabled={(date) => dateTo ? isAfter(date, dateTo) : false}
                        initialFocus
                        className="pointer-events-auto"
                      />
                      {dateFrom && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {format(dateFrom, 'd MMMM yyyy', { locale: fr })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDateFrom(undefined)}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Effacer
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <p className="text-sm font-medium text-foreground">Au</p>
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        disabled={(date) => dateFrom ? isBefore(date, dateFrom) : false}
                        className="pointer-events-auto"
                      />
                      {dateTo && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {format(dateTo, 'd MMMM yyyy', { locale: fr })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDateTo(undefined)}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Effacer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-1 text-muted-foreground hover:text-foreground h-9"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Effacer</span> ({activeFiltersCount})
                </Button>
              )}
            </motion.div>
          )}

          {/* Content */}
          {capsules.length === 0 ? (
            <TimelineEmpty type="no-capsules" />
          ) : filteredCapsules.length === 0 ? (
            <TimelineEmpty type="no-results" onClearFilters={clearAllFilters} />
          ) : (
            <DecadeGrid
              decades={decades}
              decadeCounts={decadeCounts}
              onDecadeClick={setSelectedDecade}
            />
          )}
        </main>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default Timeline;
