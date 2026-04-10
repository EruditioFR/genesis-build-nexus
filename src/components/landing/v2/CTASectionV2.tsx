import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASectionV2 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[hsl(var(--navy))] via-[hsl(220,30%,15%)] to-[hsl(var(--navy))] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-80 h-80 bg-[hsl(var(--gold))]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-20 w-60 h-60 bg-[hsl(var(--terracotta))]/10 rounded-full blur-[80px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold))]/20 to-[hsl(var(--terracotta))]/20 flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="h-8 w-8 text-[hsl(var(--gold-light))]" />
          </motion.div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            {t('v2.ctaFinal.title')}
            <br />
            {t('v2.ctaFinal.titleMiddle')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] to-[hsl(var(--terracotta-light))]">
              {t('v2.ctaFinal.titleHighlight')}
            </span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto whitespace-pre-line">
            {t('v2.ctaFinal.subtitle')}
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="w-[80vw] sm:w-auto bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--terracotta))] hover:opacity-90 text-white text-sm sm:text-lg px-8 py-6 rounded-xl shadow-2xl shadow-[hsl(var(--accent))]/30 hover:shadow-[hsl(var(--accent))]/50 transition-all"
          >
            {t('v2.ctaFinal.button')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/50 text-sm mt-6">{t('v2.ctaFinal.trust')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASectionV2;
