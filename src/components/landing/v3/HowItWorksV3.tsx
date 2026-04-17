import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CloudOff,
  FolderHeart,
  Users,
  ImageOff,
  MessageSquareOff,
  HardDrive,
  Sparkles,
  Heart,
  Lock,
} from 'lucide-react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

/**
 * HowItWorksV3 — Section "Avant / Après" en étapes verticales alternées
 *
 * 3 étapes narratives :
 *   1. Le chaos (photos éparpillées) → on rassemble
 *   2. La désorganisation → on structure (chronologie, catégories)
 *   3. L'oubli → on transmet (cercles privés, héritage)
 *
 * Chaque étape : visuel "Avant" (terne/désordre) à gauche OU droite
 * en alternance, texte explicatif de l'autre côté.
 */

type Step = {
  num: string;
  before: {
    title: string;
    items: { icon: typeof CloudOff; label: string }[];
  };
  after: {
    title: string;
    description: string;
    icon: typeof FolderHeart;
    points: string[];
  };
};

const steps: Step[] = [
  {
    num: '01',
    before: {
      title: 'Aujourd\u2019hui : vos souvenirs sont partout',
      items: [
        { icon: MessageSquareOff, label: 'Conversations WhatsApp qui s\u2019effacent' },
        { icon: CloudOff, label: 'iCloud, Google Photos\u2026 c\u2019est \u00e0 qui d\u00e9j\u00e0\u00a0?' },
        { icon: HardDrive, label: 'Vieux disques durs, USB oubli\u00e9es' },
        { icon: ImageOff, label: 'Cartons de photos jamais num\u00e9ris\u00e9s' },
      ],
    },
    after: {
      title: 'Vous rassemblez tout, en un seul endroit',
      description:
        'Importez photos, vid\u00e9os, audios et textes en quelques clics. Family Garden devient le coffre unique de votre famille.',
      icon: FolderHeart,
      points: [
        'Glisser-d\u00e9poser depuis t\u00e9l\u00e9phone ou ordinateur',
        'Enregistrement vocal direct (votre voix compte)',
        'Tout est priv\u00e9 par d\u00e9faut, h\u00e9berg\u00e9 en Europe',
      ],
    },
  },
  {
    num: '02',
    before: {
      title: 'Demain : impossible de retrouver un souvenir pr\u00e9cis',
      items: [
        { icon: ImageOff, label: '\u00ab\u00a0Le mariage de mamie, c\u2019\u00e9tait quelle ann\u00e9e\u00a0?\u00a0\u00bb' },
        { icon: CloudOff, label: 'Photos m\u00e9lang\u00e9es sur 15 ans, sans contexte' },
        { icon: MessageSquareOff, label: 'Personne ne sait qui est sur la photo' },
      ],
    },
    after: {
      title: 'Tout est organis\u00e9, sans effort',
      description:
        'Chronologie automatique, cat\u00e9gories (enfance, mariage, voyages\u2026), arbre g\u00e9n\u00e9alogique reli\u00e9 aux souvenirs. On retrouve tout en quelques secondes.',
      icon: Sparkles,
      points: [
        'Vue Chronologie par d\u00e9cennie, ann\u00e9e, mois',
        'Arbre g\u00e9n\u00e9alogique avec photos et lieux de naissance',
        'Tags personnes\u00a0: Mamie appara\u00eet partout o\u00f9 elle est',
      ],
    },
  },
  {
    num: '03',
    before: {
      title: 'Un jour : tout sera perdu',
      items: [
        { icon: HardDrive, label: 'Disques durs qui meurent en silence' },
        { icon: CloudOff, label: 'Comptes ferm\u00e9s apr\u00e8s un d\u00e9c\u00e8s' },
        { icon: MessageSquareOff, label: 'Histoires que personne n\u2019a jamais racont\u00e9es' },
      ],
    },
    after: {
      title: 'Vous transmettez, vraiment',
      description:
        'Partagez des cercles priv\u00e9s avec vos enfants, petits-enfants, fr\u00e8res et s\u0153urs. Programmez des souvenirs \u00e0 d\u00e9livrer plus tard. Votre m\u00e9moire continue.',
      icon: Heart,
      points: [
        'Cercles familiaux priv\u00e9s (pas de r\u00e9seau social)',
        'Souvenirs \u00e0 d\u00e9livrer \u00e0 une date pr\u00e9cise',
        'Mode H\u00e9ritage\u00a0: gardiens de confiance pour la suite',
      ],
    },
  },
];

const HowItWorksV3 = () => {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleCta = useCallback(() => {
    trackEvent('howitworks_cta_click', 'conversion', 'signup_from_howitworks_v3');
    navigate('/signup');
  }, [navigate, trackEvent]);

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-gradient-to-b from-[hsl(35_30%_97%)] via-background to-[hsl(35_30%_97%)]"
    >
      <div className="container mx-auto px-5 sm:px-6">
        {/* En-tête section */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 text-[hsl(215_50%_18%)] text-xs sm:text-sm font-medium mb-5"
          >
            <Lock className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
            <span>Comment ça marche</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[hsl(215_50%_18%)] leading-[1.1] tracking-tight"
          >
            Protégez les souvenirs
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--gold))]"> de votre famille</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Trois étapes pour reprendre la main sur la mémoire de votre famille, sans
            compétences techniques, sans abonnement obligatoire.
          </motion.p>
        </div>

        {/* Étapes alternées */}
        <div className="space-y-20 sm:space-y-28 max-w-6xl mx-auto">
          {steps.map((step, idx) => {
            const reversed = idx % 2 === 1;
            const AfterIcon = step.after.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7 }}
                className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  reversed ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Bloc AVANT (visuel terne) */}
                <div className="relative">
                  <div className="relative rounded-2xl bg-[hsl(220_15%_94%)] border border-[hsl(220_10%_85%)] p-6 sm:p-8 overflow-hidden">
                    {/* Filigrane "Avant" */}
                    <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-[hsl(220_10%_55%)] font-semibold">
                      Avant
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[hsl(220_15%_30%)] mb-5 pr-16">
                      {step.before.title}
                    </h3>

                    <ul className="space-y-3">
                      {step.before.items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-[hsl(220_10%_45%)]"
                          >
                            <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(220_10%_55%)]" />
                            <span>{item.label}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Effet "rayé" en bas */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                      style={{
                        background:
                          'repeating-linear-gradient(45deg, transparent, transparent 6px, hsl(220 10% 88%) 6px, hsl(220 10% 88%) 7px)',
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>

                {/* Bloc APRÈS (texte + visuel chaud) */}
                <div className="relative">
                  {/* Numéro étape */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl sm:text-6xl font-display font-bold text-[hsl(var(--gold))]/30 leading-none">
                      {step.num}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30">
                      <AfterIcon className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                      <span className="text-[10px] uppercase tracking-widest text-[hsl(215_50%_18%)] font-semibold">
                        Avec Family Garden
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[hsl(215_50%_18%)] leading-tight mb-4">
                    {step.after.title}
                  </h3>

                  <p className="text-base text-muted-foreground leading-relaxed mb-5">
                    {step.after.description}
                  </p>

                  <ul className="space-y-2.5">
                    {step.after.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm sm:text-base text-[hsl(215_50%_18%)]"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))] shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-20 sm:mt-28 text-center"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-5 max-w-xl mx-auto">
            Commencez aujourd'hui : créer votre première capsule prend moins de 3 minutes.
          </p>
          <Button
            size="lg"
            onClick={handleCta}
            className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(215_50%_18%)] text-base sm:text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold group"
          >
            Créer mon espace gratuit
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground/80">
            Gratuit, sans carte bancaire · Hébergement européen RGPD
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV3;
