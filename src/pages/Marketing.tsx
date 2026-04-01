import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Clock, Users, Shield, Download, Image, Video, Mic,
  Upload, Layers, Share2, Heart, Play, Headphones,
  Sparkles, TreePine, Check, ArrowRight,
  Zap, Eye, Volume2
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

import heroImg from "@/assets/marketing/hero-memories.jpg";
import podcastImg from "@/assets/marketing/podcast-feature.jpg";
import timelineImg from "@/assets/marketing/timeline-feature.jpg";
import familyImg from "@/assets/marketing/family-sharing.jpg";

const PricingSection = lazy(() => import("@/components/landing/PricingSection"));

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }
  })
};

const Marketing = () => {
  return (
    <>
      <SEOHead
        title="FamilyGarden — Vos souvenirs méritent un écrin numérique"
        description="Centralisez photos, vidéos, textes et audio dans un espace privé et sécurisé. Partagez avec vos proches. Écoutez vos souvenirs en podcast audio."
      />

      {/* ========== HERO — PAIN POINT ========== */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0f0f1a]">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f1a]/60 via-[#0f0f1a]/80 to-[#0f0f1a]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-24 sm:py-32">
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="max-w-4xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" /> Le journal familial nouvelle génération
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
              Vos souvenirs sont
              <span className="block text-accent"> éparpillés partout.</span>
              <span className="block text-secondary mt-2 text-3xl sm:text-4xl md:text-5xl">
                Il est temps de les réunir.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
              Photos perdues dans votre téléphone. Vidéos oubliées sur un disque dur. Histoires qui s'effacent avec le temps.
              <strong className="text-white"> FamilyGarden</strong> rassemble tout dans un espace privé, sécurisé et magnifique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-accent/30">
                <Link to="/signup">
                  Créer mon espace gratuit <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                <a href="#demo-video">
                  <Play className="mr-2 w-5 h-5" /> Voir la démo
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Pain point stats */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl"
          >
            {[
              { stat: "73%", desc: "des familles n'ont aucune sauvegarde organisée de leurs souvenirs" },
              { stat: "2 000+", desc: "photos prises par an en moyenne — combien seront retrouvées dans 10 ans ?" },
              { stat: "1 sur 4", desc: "disque dur tombe en panne dans les 4 premières années" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-display font-bold text-secondary mb-2">{item.stat}</div>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== LE PROBLÈME ========== */}
      <section className="py-20 sm:py-28 bg-[#f5f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Vos souvenirs méritent mieux qu'un
              <span className="text-destructive"> dossier en vrac</span>
            </h2>
            <p className="text-lg text-[#1a1a2e]/70">
              Google Photos mélange tout. Les albums papier se détériorent.
              Les clés USB se perdent. Et vos histoires ? Elles restent dans votre tête.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: "😰", title: "Le problème", items: ["Photos dispersées sur 5 appareils", "Vidéos trop lourdes à envoyer", "Pas de contexte : qui, quand, où ?", "Aucune sauvegarde fiable"] },
              { icon: "💡", title: "La solution", items: ["Un espace unique et privé", "Multi-média : photo, vidéo, audio, texte", "Date, lieu, personnes associées", "Sauvegarde sécurisée en Europe"] },
              { icon: "🎁", title: "Le résultat", items: ["Une histoire familiale complète", "Partagée avec vos proches", "Transmise aux générations futures", "Écoutable en podcast audio !"] },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-white rounded-3xl p-8 border border-primary/10 shadow-lg"
              >
                <div className="text-4xl mb-4">{col.icon}</div>
                <h3 className="text-xl font-display font-bold text-[#1a1a2e] mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#1a1a2e]/70">
                      <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CE QU'EST UN SOUVENIR ========== */}
      <section className="py-20 sm:py-28 bg-[#1a1a2e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> Stories multimédia
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Bien plus qu'une simple photo :
              <span className="text-secondary"> un souvenir vivant</span>
            </h2>
            <p className="text-lg text-white/70">
              Chaque souvenir sur FamilyGarden combine photos, vidéos, texte et audio pour capturer un moment dans toute sa richesse.
            </p>
          </motion.div>

          {/* Media types showcase */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              { icon: Image, label: "Photos", desc: "Uploadez et organisez vos photos avec dates et légendes", color: "from-blue-500 to-blue-700" },
              { icon: Video, label: "Vidéos", desc: "Intégrez vos vidéos et liens YouTube directement", color: "from-rose-500 to-rose-700" },
              { icon: Mic, label: "Audio", desc: "Enregistrez la voix de vos proches, leurs histoires", color: "from-amber-500 to-amber-700" },
              { icon: BookOpen, label: "Textes", desc: "Racontez l'histoire derrière chaque moment", color: "from-emerald-500 to-emerald-700" },
            ].map((type, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{type.label}</h3>
                  <p className="text-sm text-white/60">{type.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Souvenir anatomy */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-4xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 sm:p-12"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-8 text-center">
              🎬 Anatomie d'un souvenir
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[
                  { step: "1", text: "Titre et description de votre moment" },
                  { step: "2", text: "Photos et vidéos (glissez-déposez)" },
                  { step: "3", text: "Enregistrement audio ou podcast" },
                  { step: "4", text: "Date, lieu et personnes concernées" },
                  { step: "5", text: "Catégorie et étiquettes" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="relative">
                <img src={timelineImg} alt="Interface timeline" className="rounded-2xl shadow-2xl w-full" loading="lazy" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1a1a2e]/50 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== PODCAST AUDIO — STAR FEATURE ========== */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#1a0a2e] via-[#0f0f1a] to-[#0a1a2e] overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6">
                <Headphones className="w-4 h-4" /> Exclusivité FamilyGarden
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Écoutez vos souvenirs
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-accent"> comme un podcast</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Transformez vos souvenirs en histoires audio racontées ! L'IA génère un podcast à partir de vos textes, photos et contextes.
                Écoutez l'histoire de votre famille en marchant, en cuisinant, ou partagez-la avec un proche au téléphone.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Génération automatique à partir de vos souvenirs écrits",
                  "Voix naturelle et narration fluide grâce à l'IA",
                  "Téléchargeable en fichier audio MP3",
                  "Parfait pour les personnes malvoyantes ou les seniors",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-accent flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-accent hover:from-purple-700 hover:to-accent/90 text-white text-lg px-8 py-6 rounded-xl shadow-lg">
                <Link to="/signup">
                  Essayer le podcast audio <Volume2 className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={2}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <img src={podcastImg} alt="Podcast audio familial" className="w-full" loading="lazy" />
              </div>
              {/* Audio waveform decorative */}
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-accent flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Vacances d'été 1998</div>
                  <div className="text-xs text-white/50">3:42 • Généré par IA</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FONCTIONNALITÉS CLÉS ========== */}
      <section className="py-20 sm:py-28 bg-[#f5f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Tout ce dont vous avez besoin pour
              <span className="text-secondary"> préserver votre histoire</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: "Timeline interactive", desc: "Naviguez par décennies dans vos souvenirs. Visualisez votre histoire familiale sur une frise chronologique immersive.", color: "bg-accent" },
              { icon: Users, title: "Cercles de partage", desc: "Famille proche, grands-parents, amis d'enfance : choisissez qui voit quoi avec des cercles privés sécurisés.", color: "bg-violet-600" },
              { icon: Eye, title: "Mode Story", desc: "Visionnez vos souvenirs comme des stories Instagram : immersif, fluide, avec musique de fond.", color: "bg-blue-600" },
              { icon: TreePine, title: "Arbre généalogique", desc: "Construisez votre arbre familial interactif et reliez chaque souvenir aux personnes concernées.", color: "bg-emerald-600" },
              { icon: Shield, title: "Sécurité & confidentialité", desc: "Hébergement européen RGPD, accès contrôlé, vos données restent les vôtres.", color: "bg-primary" },
              { icon: Download, title: "Export PDF & backup", desc: "Exportez vos souvenirs en PDF, récupérez vos médias à tout moment.", color: "bg-rose-500" },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#1a1a2e] mb-3">{feat.title}</h3>
                  <p className="text-[#1a1a2e]/70 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE — PAS À PAS ========== */}
      <section className="py-20 sm:py-28 bg-[#1a1a2e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Simple comme bonjour
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Commencez en
              <span className="text-secondary"> 4 étapes simples</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Upload, num: "01", title: "Créez votre compte", desc: "Inscription gratuite en 30 secondes. Aucune carte bancaire requise.", color: "from-primary to-primary/70" },
              { icon: Layers, num: "02", title: "Ajoutez un souvenir", desc: "Uploadez photos, vidéos, enregistrez votre voix et racontez l'histoire.", color: "from-secondary to-secondary/70" },
              { icon: Share2, num: "03", title: "Organisez & partagez", desc: "Classez par catégories, invitez votre famille dans des cercles privés.", color: "from-accent to-accent/70" },
              { icon: Heart, num: "04", title: "Revivez à l'infini", desc: "Timeline, mode story, podcast audio : retrouvez vos moments à tout instant.", color: "from-purple-500 to-purple-700" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
              >
                <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all h-full">
                  <div className="absolute -top-4 -right-4 text-[80px] font-display font-bold text-white/5 select-none pointer-events-none">
                    {step.num}
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== VIDÉO DÉMO ========== */}
      <section id="demo-video" className="py-20 sm:py-28 bg-[#f5f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Découvrez FamilyGarden
              <span className="text-secondary"> en action</span>
            </h2>
            <p className="text-lg text-[#1a1a2e]/70">
              Regardez comment créer votre premier souvenir en quelques minutes
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/afoWU3vDcOg?rel=0"
                  title="Tutoriel FamilyGarden"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== PARTAGE FAMILIAL ========== */}
      <section className="py-20 sm:py-28 bg-[#1a1a2e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
            >
              <img src={familyImg} alt="Famille partageant des souvenirs" className="rounded-3xl shadow-2xl w-full" loading="lazy" />
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={1}
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                Des souvenirs qui
                <span className="text-secondary"> rapprochent les générations</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Invitez grands-parents, parents, enfants et petits-enfants à contribuer ensemble.
                Chacun ajoute ses souvenirs, commente ceux des autres, et l'histoire familiale se construit collectivement.
              </p>
              <div className="space-y-4">
                {[
                  "Cercles privés avec invitations par email",
                  "Chaque membre peut ajouter ses propres souvenirs",
                  "Réactions et commentaires sur chaque souvenir",
                  "Gardiens de mémoire pour la transmission",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== TARIFS ========== */}
      <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <PricingSection />
      </Suspense>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#1a1a2e] via-primary to-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Chaque jour qui passe, un souvenir risque de
              <span className="text-accent"> disparaître</span>
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Commencez dès maintenant : créez votre premier souvenir en 1 minute.
              Gratuit, sans engagement, sans carte bancaire.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white text-xl px-10 py-7 rounded-xl shadow-lg shadow-accent/30">
              <Link to="/signup">
                Créer mon journal familial <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-white/50">
              ✓ Inscription gratuite • ✓ Aucune carte bancaire • ✓ Données hébergées en Europe
            </p>
          </motion.div>
        </div>
      </section>

      {/* Simple footer link back */}
      <div className="bg-[#0f0f1a] py-8 text-center">
        <Link to="/" className="text-white/50 hover:text-white transition text-sm">
          ← Retour à l'accueil FamilyGarden
        </Link>
      </div>
    </>
  );
};

export default Marketing;
