import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Users, TreeDeciduous, FolderHeart, ArrowRight } from 'lucide-react';

const ExploreSection = () => {
  const { t } = useTranslation('dashboard');

  const items = [
    {
      to: '/timeline',
      icon: Clock,
      labelKey: 'nav.timeline',
      descKey: 'nav.timelineDesc',
    },
    {
      to: '/circles',
      icon: Users,
      labelKey: 'nav.circles',
      descKey: 'nav.circlesDesc',
    },
    {
      to: '/family-tree',
      icon: TreeDeciduous,
      labelKey: 'nav.familyTree',
      descKey: 'nav.familyTreeDesc',
    },
    {
      to: '/categories',
      icon: FolderHeart,
      labelKey: 'nav.categories',
      descKey: 'nav.categoriesDesc',
    },
  ];

  return (
    <section className="mt-10 md:mt-14">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
            Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Naviguez à travers vos espaces
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
          >
            <Link
              to={item.to}
              className="group block h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-foreground/15"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{
                  background: 'hsl(var(--navy) / 0.08)',
                }}
              >
                <item.icon
                  className="w-5 h-5"
                  style={{ color: 'hsl(var(--navy))' }}
                  strokeWidth={2}
                />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {t(item.labelKey)}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                {t(item.descKey)}
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: 'hsl(var(--gold))' }}
              >
                Découvrir
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ExploreSection;
