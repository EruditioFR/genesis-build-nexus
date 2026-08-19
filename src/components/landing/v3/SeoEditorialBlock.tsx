import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EDITORIAL_ORDER, getArticleSlug } from '@/lib/blogArticles';
import { renderInlineLinks } from '@/components/seo/InlineLinkText';


const SeoEditorialBlock = () => {
  const { t, i18n } = useTranslation('landing');

  return (
    <section className="bg-[hsl(35_30%_97%)] border-y border-[hsl(220_15%_90%)] py-12 sm:py-16">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[hsl(215_50%_18%)] leading-tight mb-5">
            {t('v3.editorial.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
            {renderInlineLinks(t('v3.editorial.p1'))}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
            {renderInlineLinks(t('v3.editorial.p2'))}
          </p>


          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {t('v3.editorial.linksTitle')}
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {EDITORIAL_ORDER.map((group, index) => (
              <li key={group}>
                <Link
                  to={`/blog/${getArticleSlug(group, i18n.language)}`}
                  className="group flex items-start gap-2 rounded-xl bg-white border border-[hsl(220_15%_90%)] p-4 text-sm font-medium text-[hsl(215_50%_18%)] shadow-sm transition-colors hover:border-[hsl(var(--gold))]"
                >
                  <span className="flex-1 leading-snug">{t(`v3.editorial.links.l${index + 1}`)}</span>
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-[hsl(var(--gold))] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SeoEditorialBlock;
