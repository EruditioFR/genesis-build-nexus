import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, HelpCircle, BookOpen, Heart, Sparkles, LayoutGrid } from 'lucide-react';

const ITEMS = [
  { key: 'pricing', to: '/tarifs', icon: Tag },
  { key: 'faq', to: '/faq', icon: HelpCircle },
  { key: 'blog', to: '/blog', icon: BookOpen },
  { key: 'inspirations', to: '/inspirations', icon: Sparkles },
  { key: 'categories', to: '/categories', icon: LayoutGrid },
  { key: 'about', to: '/about', icon: Heart },
] as const;

const InternalLinksHub = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-[hsl(220_15%_90%)]">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[hsl(215_50%_18%)] leading-tight mb-2">
            {t('v3.hub.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8">
            {t('v3.hub.subtitle')}
          </p>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ITEMS.map(({ key, to, icon: Icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  className="group h-full flex flex-col rounded-xl border border-[hsl(220_15%_90%)] bg-[hsl(35_30%_98%)] p-4 sm:p-5 shadow-sm transition-colors hover:border-[hsl(var(--gold))]"
                >
                  <span className="flex items-center gap-2 text-[hsl(215_50%_18%)] font-semibold text-sm sm:text-base">
                    <Icon className="h-4 w-4 flex-shrink-0 text-[hsl(var(--gold))]" />
                    <span className="flex-1">{t(`v3.hub.items.${key}.title`)}</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-[hsl(var(--gold))] transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t(`v3.hub.items.${key}.desc`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default InternalLinksHub;
