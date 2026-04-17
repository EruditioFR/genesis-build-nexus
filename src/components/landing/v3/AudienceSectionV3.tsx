import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Gift, Calendar, Camera, Map } from 'lucide-react';

import parentsImg from '@/assets/audience/parents.jpg';
import familiesImg from '@/assets/audience/families.jpg';
import legacyImg from '@/assets/audience/legacy.jpg';
import eventsImg from '@/assets/audience/events.jpg';
import mariageImg from '@/assets/audience/mariage.jpg';
import voyageImg from '@/assets/audience/voyage.jpg';

type Persona = {
  key: string;
  image: string;
  icon: typeof Heart;
  badge: string;
  title: string;
  problem: string;
  promise: string;
  cta: string;
};

const personas: Persona[] = [
  {
    key: 'families',
    image: familiesImg,
    icon: Heart,
    badge: 'Familles multigénérationnelles',
    title: 'Reconnecter les générations autour d\'une histoire commune',
    problem:
      'Les souvenirs des grands-parents restent dans leur tête, les photos des parents sur leur téléphone, et les enfants ne savent presque rien de ceux qui les ont précédés.',
    promise:
      'Family Garden réunit grands-parents, parents et enfants dans un même espace privé : chacun ajoute ses souvenirs, et toute la famille en hérite.',
    cta: 'Réunir ma famille',
  },
  {
    key: 'parents',
    image: parentsImg,
    icon: Sparkles,
    badge: 'Jeunes parents',
    title: 'Garder une trace de chaque "première fois" avant qu\'elle ne s\'efface',
    problem:
      'Premiers pas, premiers mots, fous rires du soir : tout va si vite. Les vidéos s\'entassent dans la pellicule, les anecdotes se perdent, et dans dix ans il ne restera que des bribes.',
    promise:
      'Créez le journal de votre enfant en quelques secondes : photo, mot, vidéo, daté et raconté. Un livre vivant qu\'il pourra lire un jour.',
    cta: 'Commencer le journal de bébé',
  },
  {
    key: 'legacy',
    image: legacyImg,
    icon: Gift,
    badge: 'Transmission',
    title: 'Transmettre ce qui ne s\'écrit nulle part ailleurs',
    promise:
      'Programmez la diffusion de souvenirs choisis, désignez des proches de confiance et laissez un héritage vivant — pas seulement matériel.',
    problem:
      'Les histoires de famille, les recettes, les valeurs, la voix d\'un parent... Tout cela disparaît avec ceux qui les portent, faute d\'avoir été enregistré à temps.',
    cta: 'Préparer ma transmission',
  },
  {
    key: 'mariage',
    image: mariageImg,
    icon: Camera,
    badge: 'Mariage',
    title: 'Revivre le plus beau jour, au-delà de l\'album du photographe',
    problem:
      'Vous recevez des centaines de photos et vidéos de vos invités, éparpillées sur WhatsApp, Drive, AirDrop. Six mois plus tard, plus personne ne sait où elles sont.',
    promise:
      'Centralisez tous les médias du mariage dans un album privé partagé : invités, témoins et famille déposent leurs souvenirs au même endroit, organisés et sauvegardés.',
    cta: 'Créer l\'album de mariage',
  },
  {
    key: 'voyage',
    image: voyageImg,
    icon: Map,
    badge: 'Voyages en famille',
    title: 'Garder vivantes les aventures, pas seulement les photos',
    problem:
      'Au retour d\'un voyage, on partage 10 photos sur Instagram, puis tout disparaît dans la pellicule. Les anecdotes, les rencontres, les fous rires : oubliés.',
    promise:
      'Racontez chaque étape avec photos, vidéos, audio et texte. Vos enfants pourront un jour rouvrir le carnet de bord de vos voyages — comme s\'ils y étaient.',
    cta: 'Créer un carnet de voyage',
  },
  {
    key: 'events',
    image: eventsImg,
    icon: Calendar,
    badge: 'Réunions & événements de famille',
    title: 'Faire vivre les retrouvailles bien après la fin de la fête',
    problem:
      'Anniversaires, baptêmes, retrouvailles d\'été : tout le monde prend des photos, personne ne les partage vraiment. La magie du moment s\'évapore en quelques jours.',
    promise:
      'Ouvrez un espace dédié à l\'événement, invitez la famille à y déposer ses souvenirs, et conservez le tout dans un cercle privé accessible à vie.',
    cta: 'Créer un espace événement',
  },
];

const AudienceSectionV3 = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
            <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold))] tracking-wider uppercase">
              Pour qui ?
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Une réponse différente pour chaque{' '}
            <span className="text-[hsl(var(--gold))]">moment de famille</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Family Garden s'adapte à votre histoire — qu'il s'agisse de bâtir un héritage,
            de garder trace d'une enfance ou de rassembler un mariage.
          </p>
        </motion.div>

        {/* Personas alternés */}
        <div className="space-y-16 md:space-y-28 max-w-6xl mx-auto">
          {personas.map((persona, i) => {
            const isReversed = i % 2 === 1;
            const Icon = persona.icon;

            return (
              <motion.article
                key={persona.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  isReversed ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Image */}
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] md:aspect-[4/3]">
                    <img
                      src={persona.image}
                      alt={persona.badge}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={600}
                      height={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
                  </div>
                  {/* Badge floating */}
                  <div
                    className={`hidden md:flex absolute -bottom-4 ${
                      isReversed ? '-left-4' : '-right-4'
                    } items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--gold))]/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[hsl(var(--gold))]" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-foreground pr-1">
                      {persona.badge}
                    </span>
                  </div>
                </div>

                {/* Texte */}
                <div>
                  {/* Mobile badge */}
                  <div className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
                    <Icon className="w-3.5 h-3.5 text-[hsl(var(--gold))]" strokeWidth={2} />
                    <span className="text-xs font-semibold text-[hsl(var(--gold))]">
                      {persona.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
                    {persona.title}
                  </h3>

                  {/* Problème */}
                  <div className="relative pl-5 mb-5 border-l-2 border-muted-foreground/25">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                      Aujourd'hui
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {persona.problem}
                    </p>
                  </div>

                  {/* Promesse */}
                  <div className="relative pl-5 mb-7 border-l-2 border-[hsl(var(--gold))]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--gold))] mb-1.5">
                      Avec Family Garden
                    </div>
                    <p className="text-sm md:text-base text-foreground leading-relaxed font-medium">
                      {persona.promise}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-2 text-[hsl(var(--gold))] font-semibold text-sm md:text-base hover:gap-3 transition-all"
                  >
                    {persona.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudienceSectionV3;
