import { motion } from 'framer-motion';
import { Calendar, ChevronDown, ImageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr, enUS, es, ko, zhCN, type Locale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import CosmicTimeline from './CosmicTimeline';
import type { Satellite } from './OrbitingSatellite';
import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];

interface CapsuleMedia {
  id: string;
  file_url: string;
  file_type: string;
  capsule_id: string;
}

interface YearEntry {
  year: string;
  count: number;
  satellites: Satellite[];
}

interface DecadeBranchProps {
  decade: string;
  years: YearEntry[];
  onSatelliteClick: (capsuleId: string) => void;
  capsules: Capsule[];
  capsuleMedias: Record<string, CapsuleMedia | null>;
  onCapsuleClick: (capsuleId: string) => void;
  /** If provided, the branch will open with this year already expanded */
  initialExpandedYear?: string | null;
}

const getCapsuleDate = (capsule: Capsule): Date => {
  if (capsule.memory_date) return parseISO(capsule.memory_date);
  return parseISO(capsule.created_at);
};

const DecadeBranch = ({
  decade,
  years,
  onSatelliteClick,
  capsules,
  capsuleMedias,
  onCapsuleClick,
  initialExpandedYear = null,
}: DecadeBranchProps) => {
  const { t, i18n } = useTranslation('dashboard');

  const getLocale = (): Locale => {
    const map: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };
    return map[i18n.language] || fr;
  };

  const [expandedYear, setExpandedYear] = useState<string | null>(initialExpandedYear);

  const yearKeys = useMemo(() => years.map((y) => y.year), [years]);
  const yearCounts = useMemo(() => {
    const r: Record<string, number> = {};
    years.forEach((y) => { r[y.year] = y.count; });
    return r;
  }, [years]);
  const yearSatellites = useMemo(() => {
    const r: Record<string, Satellite[]> = {};
    years.forEach((y) => { r[y.year] = y.satellites; });
    return r;
  }, [years]);

  const capsulesByYear = useMemo(() => {
    const r: Record<string, Capsule[]> = {};
    capsules.forEach((c) => {
      const date = getCapsuleDate(c);
      const year = format(date, 'yyyy');
      const decadeOfYear = (Math.floor(parseInt(year) / 10) * 10).toString();
      if (decadeOfYear !== decade) return;
      if (!r[year]) r[year] = [];
      r[year].push(c);
    });
    Object.keys(r).forEach((y) => {
      r[y].sort((a, b) => getCapsuleDate(b).getTime() - getCapsuleDate(a).getTime());
    });
    return r;
  }, [capsules, decade]);

  const expandedCapsules = expandedYear ? capsulesByYear[expandedYear] || [] : [];

  // The memory cards branch — passed as `expandedBranch` to the inner CosmicTimeline
  const memoriesBranch = expandedYear ? (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'hsl(var(--gold) / 0.15)' }}
            >
              <Calendar
                className="w-5 h-5"
                style={{ color: 'hsl(var(--gold))' }}
                strokeWidth={2.25}
              />
            </div>
            <div>
              <h4 className="font-display font-semibold text-xl text-foreground">
                {expandedYear}
              </h4>
              <p className="text-sm text-muted-foreground">
                {expandedCapsules.length}{' '}
                {t('timeline.memories', { count: expandedCapsules.length })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedYear(null)}
            className="gap-1.5"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            {t('common.close', { defaultValue: 'Fermer' })}
          </Button>
        </div>

        {expandedCapsules.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t('timeline.empty.title', { defaultValue: 'Aucun souvenir' })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {expandedCapsules.map((capsule, idx) => {
              const media = capsuleMedias[capsule.id];
              const date = getCapsuleDate(capsule);
              return (
                <motion.button
                  key={capsule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  onClick={() => onCapsuleClick(capsule.id)}
                  className="group text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-foreground/20 transition-all"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {media && media.file_type.startsWith('image/') ? (
                      <img
                        src={media.file_url}
                        alt={capsule.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'hsl(var(--gold) / 0.08)' }}
                      >
                        <ImageIcon
                          className="w-9 h-9"
                          style={{ color: 'hsl(var(--gold) / 0.6)' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h5 className="font-display font-semibold text-base text-foreground line-clamp-2 mb-1.5">
                      {capsule.title}
                    </h5>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(date, 'd MMMM yyyy', { locale: getLocale() })}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full">
      {years.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {t('timeline.empty.title', { defaultValue: 'Aucun souvenir' })}
        </div>
      ) : (
        <CosmicTimeline
          decades={yearKeys}
          decadeCounts={yearCounts}
          decadeSatellites={yearSatellites}
          onDecadeClick={(year) =>
            setExpandedYear((prev) => (prev === year ? null : year))
          }
          onSatelliteClick={onSatelliteClick}
          isYearMode
          expandedDecade={expandedYear}
          expandedBranch={memoriesBranch}
        />
      )}
    </div>
  );
};

export default DecadeBranch;
