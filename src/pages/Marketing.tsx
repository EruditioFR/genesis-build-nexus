import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Clock, Users, Shield, Download, Image, Video, Mic,
  Play, Headphones, TreePine, Check,
  Eye, Volume2, Sprout, Flower2, Leaf
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
        title="FamilyGarden — Cultivez vos souvenirs, récoltez votre histoire"
        description="Plantez vos souvenirs dans un jardin numérique privé et sécurisé. Photos, vidéos, textes, audio. Regardez votre histoire familiale fleurir et porter ses fruits."
      />

      {/* ========== HERO — JARDIN / RACINES ========== */}
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold mb-8">
              <Sprout className="w-4 h-4" /> Cultivez votre jardin de souvenirs
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
              Plantez vos souvenirs.
              <span className="block text-emerald-400"> Regardez-les fleurir.</span>
              <span className="block text-secondary mt-2 text-3xl sm:text-4xl md:text-5xl">
                Récoltez votre histoire familiale.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
              Comme un jardinier prend soin de ses plantes, prenez soin de vos souvenirs.
              <strong className="text-white"> FamilyGarden</strong> est le terreau fertile où chaque photo, vidéo, texte et audio
              prend racine pour créer un héritage qui traverse les générations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/30">
                <Link to="/signup">
                  Planter ma première graine <Sprout className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                <a href="#demo-video">
                  <Play className="mr-2 w-5 h-5" /> Voir la démo
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Garden metaphor stats */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl"
          >
            {[
              { stat: "🌱", num: "73%", desc: "des familles laissent leurs souvenirs faner, sans aucune sauvegarde organisée" },
              { stat: "🍂", num: "2 000+", desc: "photos par an — autant de graines perdues si elles ne sont pas plantées" },
              { stat: "🥀", num: "1 sur 4", desc: "disque dur tombe en panne : comme un jardin sans soin, tout s'éteint" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-display font-bold text-emerald-400 mb-2">{item.stat} {item.num}</div>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== LE PROBLÈME — JARDIN ABANDONNÉ ========== */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-[#f5f0e8] to-[#e8f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Sans soin, même le plus beau jardin
              <span className="text-destructive"> se fane</span> 🥀
            </h2>
            <p className="text-lg text-[#1a1a2e]/70">
              Vos souvenirs sont comme des fleurs fragiles : dispersés, ils se perdent.
              Rassemblés et cultivés, ils deviennent un jardin magnifique.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: "🍂", title: "Le jardin en friche", items: ["Photos dispersées comme des feuilles au vent", "Vidéos oubliées — des fruits qui pourrissent", "Pas de contexte : des fleurs sans étiquette", "Aucune protection — le gel détruit tout"] },
              { icon: "🌱", title: "Le terreau fertile", items: ["Un seul jardin privé et sécurisé", "Photos, vidéos, audio, texte : toutes les espèces", "Date, lieu, personnes : chaque plante identifiée", "Hébergement européen : une serre protectrice"] },
              { icon: "🌳", title: "La récolte", items: ["Un arbre familial complet et vivant", "Des fruits partagés avec vos proches", "Des racines transmises aux générations futures", "Un podcast audio : l'histoire racontée !"] },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-lg"
              >
                <div className="text-4xl mb-4">{col.icon}</div>
                <h3 className="text-xl font-display font-bold text-[#1a1a2e] mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#1a1a2e]/70">
                      <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CE QU'EST UN SOUVENIR — ANATOMIE D'UNE GRAINE ========== */}
      <section className="py-20 sm:py-28 bg-[#1a1a2e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6">
              <Flower2 className="w-4 h-4" /> Une graine multimédia
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Chaque souvenir est une
              <span className="text-emerald-400"> graine précieuse</span>
            </h2>
            <p className="text-lg text-white/70">
              Plantez des graines riches : photos, vidéos, texte et audio. Chacune germe en un moment vivant, prêt à être partagé et transmis.
            </p>
          </motion.div>

          {/* Media types as garden elements */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              { icon: Image, label: "Photos", desc: "Les pétales de vos souvenirs : capturez la beauté de chaque instant", color: "from-emerald-500 to-emerald-700", emoji: "🌸" },
              { icon: Video, label: "Vidéos", desc: "Les racines vivantes : le mouvement et la vie de vos moments", color: "from-amber-500 to-amber-700", emoji: "🌿" },
              { icon: Mic, label: "Audio", desc: "Le parfum de vos souvenirs : la voix de ceux que vous aimez", color: "from-rose-500 to-rose-700", emoji: "🌺" },
              { icon: BookOpen, label: "Textes", desc: "La sève de votre histoire : les mots qui nourrissent la mémoire", color: "from-teal-500 to-teal-700", emoji: "🍃" },
            ].map((type, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <type.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl">{type.emoji}</span>
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
            className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-900/30 to-white/5 backdrop-blur border border-emerald-500/20 rounded-3xl p-8 sm:p-12"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-8 text-center">
              🌱 Anatomie d'une graine de souvenir
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[
                  { step: "🌰", text: "Titre et description : la graine" },
                  { step: "🌸", text: "Photos et vidéos : les pétales" },
                  { step: "🎵", text: "Enregistrement audio : le parfum" },
                  { step: "📍", text: "Date, lieu, personnes : les racines" },
                  { step: "🏷️", text: "Catégorie et étiquettes : le terroir" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-xl flex items-center justify-center shrink-0">
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

      {/* ========== PODCAST AUDIO — LE FRUIT DE VOS SOUVENIRS ========== */}
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
                <Headphones className="w-4 h-4" /> 🍎 Le plus beau fruit de votre jardin
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Récoltez vos souvenirs
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-accent"> en podcast audio</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Le plus beau fruit de votre jardin de souvenirs : l'IA transforme vos textes, photos et contextes
                en une histoire racontée. Écoutez votre histoire familiale en marchant, en cuisinant, ou offrez-la comme un bouquet à un proche.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "🌰 Vos souvenirs écrits sont la graine du podcast",
                  "🌿 L'IA fait germer une narration fluide et naturelle",
                  "🍎 Récoltez un fichier audio MP3 à écouter partout",
                  "👵 Parfait pour les seniors — comme raconter au coin du feu",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-accent hover:from-purple-700 hover:to-accent/90 text-white text-lg px-8 py-6 rounded-xl shadow-lg">
                <Link to="/signup">
                  Récolter mon premier podcast <Volume2 className="ml-2 w-5 h-5" />
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
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-accent flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Vacances d'été 1998</div>
                  <div className="text-xs text-white/50">3:42 • Fruit de vos souvenirs 🍎</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FONCTIONNALITÉS — OUTILS DU JARDINIER ========== */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-[#e8f0e8] to-[#f5f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <Leaf className="w-4 h-4" /> Les outils du jardinier
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Tout pour cultiver et faire
              <span className="text-emerald-600"> prospérer votre jardin</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: "🌿 Timeline interactive", desc: "Parcourez les saisons de votre vie. Naviguez par décennies dans votre jardin de souvenirs, comme un arbre qui révèle ses cernes.", color: "bg-emerald-600" },
              { icon: Users, title: "🌻 Cercles de partage", desc: "Partagez les fruits de votre jardin : famille proche, grands-parents, amis. Choisissez qui cueille quoi.", color: "bg-amber-600" },
              { icon: Eye, title: "🌸 Mode Story", desc: "Visitez votre jardin en mode immersif : vos souvenirs s'enchaînent comme une promenade fleurie.", color: "bg-rose-500" },
              { icon: TreePine, title: "🌳 Arbre généalogique", desc: "Visualisez vos racines ! Construisez votre arbre familial et reliez chaque souvenir à ses branches.", color: "bg-emerald-700" },
              { icon: Shield, title: "🏡 Serre sécurisée", desc: "Votre jardin est protégé : hébergement européen RGPD, accès contrôlé, vos données à l'abri du gel.", color: "bg-primary" },
              { icon: Download, title: "🧺 Récolte & export", desc: "Cueillez vos souvenirs en PDF, récupérez vos médias : votre récolte vous appartient toujours.", color: "bg-teal-600" },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
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

      {/* ========== COMMENT ÇA MARCHE — CULTIVER EN 4 SAISONS ========== */}
      <section className="py-20 sm:py-28 bg-[#1a1a2e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6">
              <Sprout className="w-4 h-4" /> De la graine à l'arbre
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Cultivez votre jardin en
              <span className="text-emerald-400"> 4 saisons</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Sprout, num: "🌱", title: "Préparez le terrain", desc: "Inscription gratuite en 30 secondes. Votre parcelle vous attend.", color: "from-emerald-500 to-emerald-700", season: "Printemps" },
              { icon: Flower2, num: "🌸", title: "Plantez vos graines", desc: "Uploadez photos, vidéos, enregistrez votre voix, racontez l'histoire.", color: "from-rose-400 to-rose-600", season: "Été" },
              { icon: Leaf, num: "🍂", title: "Cultivez & partagez", desc: "Organisez par catégories, invitez votre famille à jardiner ensemble.", color: "from-amber-500 to-amber-700", season: "Automne" },
              { icon: TreePine, num: "🌳", title: "Récoltez les fruits", desc: "Timeline, mode story, podcast audio : savourez votre récolte à tout instant.", color: "from-emerald-600 to-emerald-800", season: "Hiver" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
              >
                <div className="relative bg-white/5 backdrop-blur border border-emerald-500/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all h-full">
                  <div className="absolute -top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    {step.season}
                  </div>
                  <div className="text-4xl mb-4">{step.num}</div>
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
      <section id="demo-video" className="py-20 sm:py-28 bg-gradient-to-b from-[#f5f0e8] to-[#e8f0e8]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6">
              Visitez le jardin
              <span className="text-emerald-600"> en vidéo</span> 🌿
            </h2>
            <p className="text-lg text-[#1a1a2e]/70">
              Découvrez comment planter votre premier souvenir en quelques minutes
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-100">
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

      {/* ========== PARTAGE FAMILIAL — L'ARBRE QUI RASSEMBLE ========== */}
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
                Un arbre dont chaque branche
                <span className="text-emerald-400"> porte des fruits</span> 🌳
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Comme un arbre centenaire, votre histoire familiale se nourrit de chaque génération.
                Grands-parents, parents, enfants : chacun apporte sa sève, ses fleurs et ses fruits.
              </p>
              <div className="space-y-4">
                {[
                  "🌿 Chaque branche = un cercle privé de partage",
                  "🌸 Chaque membre plante ses propres souvenirs",
                  "💬 Commentaires et réactions : la pollinisation des émotions",
                  "🛡️ Gardiens de mémoire : les racines du futur",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
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
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#0a2e1a] via-emerald-900 to-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mx-auto"
          >
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Chaque jour sans soin, un souvenir
              <span className="text-emerald-400"> se fane</span>
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Plantez votre première graine dès maintenant. En 1 minute, votre jardin de souvenirs commence à pousser.
              Gratuit, sans engagement.
            </p>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl px-10 py-7 rounded-xl shadow-lg shadow-emerald-500/30">
              <Link to="/signup">
                Planter ma première graine <Sprout className="ml-2 w-6 h-6" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-white/50">
              🌱 Inscription gratuite • 🔒 Aucune carte bancaire • 🇪🇺 Données hébergées en Europe
            </p>
          </motion.div>
        </div>
      </section>

      {/* Simple footer link back */}
      <div className="bg-[#0f0f1a] py-8 text-center">
        <Link to="/" className="text-white/50 hover:text-white transition text-sm">
          ← Retour au jardin FamilyGarden
        </Link>
      </div>
    </>
  );
};

export default Marketing;
