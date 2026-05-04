import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Lock, Shield, Users, Baby, UserRound, Camera, X, Share2, TreePine, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SEOHead from "@/components/seo/SEOHead";

import useGoogleAnalytics from "@/hooks/useGoogleAnalytics";
import heroBg from "@/assets/hero-background.webp";
import logo from "@/assets/logo.png";

import { cn } from "@/lib/utils";

type Persona = "enfants" | "famille" | "parents";

const PERSONA_COPY: Record<Persona, { label: string; possessive: string; share: string; icon: typeof Users }> = {
  enfants: { label: "Mes enfants", possessive: "vos enfants", share: "vos enfants", icon: Baby },
  famille: { label: "Ma famille", possessive: "votre famille", share: "votre famille", icon: Users },
  parents: { label: "Mes parents", possessive: "vos parents", share: "vos parents", icon: UserRound },
};

const INSPIRATION_THEMES: { key: string; emoji: string; label: string; description: string; questions: string[] }[] = [
  {
    key: "enfance",
    emoji: "🌱",
    label: "Enfance",
    description: "Vos premières années, vos jeux, vos repères",
    questions: [
      "À quoi ressemblait la maison de votre enfance ?",
      "Quel était votre jeu préféré et avec qui y jouiez-vous ?",
      "Quelle odeur vous ramène immédiatement à votre enfance ?",
      "Quel était votre plat préféré quand vous étiez petit·e ?",
      "Qui était votre meilleur ami·e d'enfance ?",
      "Quel était votre coin secret pour vous réfugier ?",
      "Quelle bêtise vous vaut encore une anecdote en famille ?",
      "Quel cadeau vous a le plus marqué enfant ?",
      "À quoi ressemblaient vos dimanches en famille ?",
      "Quelle peur d'enfant vous semble drôle aujourd'hui ?",
    ],
  },
  {
    key: "ecole",
    emoji: "🎒",
    label: "École",
    description: "Camarades, professeurs, premiers apprentissages",
    questions: [
      "Un professeur vous a marqué. Pourquoi ?",
      "Quel souvenir gardez-vous de votre première rentrée ?",
      "Quelle matière aimiez-vous le plus, et laquelle vous résistait ?",
      "Comment se passaient vos récréations ?",
      "Quel voyage scolaire vous a laissé un souvenir vivace ?",
      "Quelle bêtise avez-vous faite en classe ?",
      "Qui était votre meilleur ami·e à l'école ?",
      "Quel diplôme ou résultat vous a rendu·e fier·e ?",
      "Quelle activité extrascolaire vous a façonné·e ?",
      "Quel souvenir gardez-vous du jour où vous avez quitté l'école ?",
    ],
  },
  {
    key: "famille",
    emoji: "👨‍👩‍👧",
    label: "Famille",
    description: "Liens, traditions, anecdotes familiales",
    questions: [
      "Quelle tradition aimeriez-vous transmettre ?",
      "Quel souvenir gardez-vous de vos grands-parents ?",
      "Quel a été le plus beau Noël de votre vie ?",
      "Quelle anecdote familiale fait toujours rire à table ?",
      "Quel objet de famille a une histoire à raconter ?",
      "Quel rituel partagiez-vous avec un parent ?",
      "Comment vos parents se sont-ils rencontrés ?",
      "Quelle leçon d'un proche vous guide encore ?",
      "Quel mariage ou fête de famille vous a marqué·e ?",
      "Quel plat familial est devenu votre madeleine ?",
    ],
  },
  {
    key: "musiques",
    emoji: "🎵",
    label: "Musiques",
    description: "Chansons, films et émotions qui vous habitent",
    questions: [
      "Quelle chanson vous ramène instantanément en arrière ?",
      "Quel a été votre tout premier disque ou cassette ?",
      "Quel concert avez-vous vu et n'oublierez jamais ?",
      "Quel film a marqué une période de votre vie ?",
      "Quelle musique passait à votre mariage ou à un grand jour ?",
      "Quel artiste vous accompagne depuis toujours ?",
      "Quelle chanson chantiez-vous à vos enfants ?",
      "Quel livre vous a transformé·e ?",
      "Quelle émission de télé regardiez-vous en famille ?",
      "Quelle musique vous donne envie de danser, encore aujourd'hui ?",
    ],
  },
  {
    key: "vie",
    emoji: "✨",
    label: "Vie",
    description: "Choix, rencontres et tournants importants",
    questions: [
      "Quel moment a changé le cours de votre vie ?",
      "Quelle rencontre vous a profondément marqué·e ?",
      "Quel voyage vous a transformé·e ?",
      "Quelle décision difficile êtes-vous fier·e d'avoir prise ?",
      "Quel a été votre premier vrai métier ?",
      "Quel jour avez-vous su que vous étiez amoureux·se ?",
      "Quel défi avez-vous relevé contre toute attente ?",
      "Quelle naissance a bouleversé votre vie ?",
      "Quel lieu vous semble être votre véritable refuge ?",
      "Quelle phrase voudriez-vous laisser à ceux qui vous suivront ?",
    ],
  },
];

const STORAGE_KEY = "fg_demo_state_v2";

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    transition={{ duration: 0.28 }}
    className={cn("absolute inset-0 flex flex-col", className)}
  >
    {children}
  </motion.div>
);

const DemoExperience = () => {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  
  const [showAbandon, setShowAbandon] = useState(false);
  const [tutoStep, setTutoStep] = useState<1 | 2 | 3>(1);
  const [showInspirations, setShowInspirations] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [fromInspiration, setFromInspiration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUserImage(reader.result);
        trackEvent("demo_upload_image", "demo");
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // restore state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.persona) setPersona(s.persona);
      }
    } catch {}
  }, []);

  // start_demo once
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("start_demo", "demo");
    }
  }, [trackEvent]);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ persona, title, text, step }));
    } catch {}
  }, [persona, title, text, step]);

  // anti-abandon
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (step >= 3 && step <= 4) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step]);

  const goTo = useCallback((n: number) => setStep(n), []);

  const personaCopy = persona ? PERSONA_COPY[persona] : null;

  const handlePersona = (p: Persona) => {
    setPersona(p);
    trackEvent("select_persona", "demo", p);
    setTimeout(() => goTo(3), 280);
  };

  const handleCreate = () => {
    trackEvent("complete_creation", "demo", persona ?? undefined);
    goTo(4);
  };

  const handleConvert = () => {
    trackEvent("click_conversion", "demo", persona ?? undefined);
    navigate(`/signup?source=demo${persona ? `&persona=${persona}` : ""}`);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1a1a2e] text-white" style={{ height: "100dvh" }}>
      <SEOHead
        title="Découvrez Family Garden en 1 minute — Gardez vos souvenirs en sécurité"
        description="Vos souvenirs se perdent déjà, sans que vous vous en rendiez compte. Découvrez en une minute comment Family Garden vous aide à les conserver simplement."
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Container key="s1">
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
              style={{ backgroundImage: `url(${heroBg})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/70" aria-hidden />
            <div className="relative flex-1 flex flex-col justify-center items-center px-6 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="font-display text-3xl sm:text-4xl font-bold leading-tight"
              >
                Vos souvenirs se perdent.
                <br />
                <span className="text-secondary">Vous en êtes conscient ?</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 text-lg text-white/80 max-w-sm"
              >
                Photos, vidéos, messages… éparpillés entre vos téléphones, vos applis, vos anciens appareils.
              </motion.p>
            </div>
            <div className="relative p-6 pb-10">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={() => goTo(3)}
              >
                Créer un souvenir
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </Container>
        )}


        {step === 3 && showInspirations && !selectedTheme && (
          <Container key="s3-themes" className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-16 pb-4">
              <p className="text-center text-xs uppercase tracking-widest text-secondary">Pour vous inspirer</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center leading-snug">
                Par quelle thématique commencer ?
              </h2>
              <p className="mt-3 text-center text-sm text-white/70 max-w-sm mx-auto">
                Choisissez un univers, puis une question pour démarrer votre souvenir.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {INSPIRATION_THEMES.map((theme, i) => (
                  <motion.li
                    key={theme.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={cn(i === INSPIRATION_THEMES.length - 1 && INSPIRATION_THEMES.length % 2 === 1 && "col-span-2")}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme.key);
                        trackEvent("demo_pick_theme", "demo", theme.key);
                      }}
                      className="w-full h-full text-left rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:from-secondary/15 hover:to-white/[0.04] hover:border-secondary/60 p-4 transition-all flex flex-col items-start gap-2 min-h-[120px]"
                    >
                      <span className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-2xl leading-none">
                        {theme.emoji}
                      </span>
                      <span className="block text-sm font-semibold text-white/95 leading-snug">{theme.label}</span>
                      <span className="block text-xs text-white/55 leading-snug">{theme.description}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="p-5 pb-8 border-t border-white/10 bg-[#0f0f1e]/80">
              <Button
                variant="outline"
                className="w-full border-white/30 text-white text-sm bg-transparent hover:bg-white/10 py-2 h-auto"
                onClick={() => { setFromInspiration(false); setTitle(""); setShowInspirations(false); setSelectedTheme(null); }}
              >
                Créer avec ma propre idée
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Container>
        )}

        {step === 3 && showInspirations && selectedTheme && (() => {
          const theme = INSPIRATION_THEMES.find((t) => t.key === selectedTheme);
          if (!theme) return null;
          return (
            <Container key="s3-questions" className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
              <div className="flex-1 overflow-y-auto px-5 pt-16 pb-4">
                <button
                  type="button"
                  onClick={() => setSelectedTheme(null)}
                  className="text-xs text-white/60 hover:text-white flex items-center gap-1 mb-2"
                >
                  ← Changer de thématique
                </button>
                <p className="text-center text-xs uppercase tracking-widest text-secondary flex items-center justify-center gap-2">
                  <span>{theme.emoji}</span> {theme.label}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-center leading-snug">
                  Quelle question vous parle ?
                </h2>
                <p className="mt-3 text-center text-sm text-white/70 max-w-sm mx-auto">
                  Une question, un souvenir. Vous pouvez aussi écrire le vôtre.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {theme.questions.map((question, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTitle(question);
                          setFromInspiration(true);
                          setTutoStep(1);
                          setShowInspirations(false);
                          trackEvent("demo_pick_inspiration", "demo", `${theme.key}:${i}`);
                        }}
                        className="w-full text-left rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-secondary/60 px-4 py-3 transition-all"
                      >
                        <span className="block text-sm text-white/90 leading-snug">« {question} »</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="p-5 pb-8 border-t border-white/10 bg-[#0f0f1e]/80">
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white text-sm bg-transparent hover:bg-white/10 py-2 h-auto"
                  onClick={() => { setFromInspiration(false); setTitle(""); setShowInspirations(false); setSelectedTheme(null); }}
                >
                  Créer avec ma propre idée
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Container>
          );
        })()}

        {step === 3 && !showInspirations && (
          <Container key="s3" className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-16 pb-4">
              <p className="text-center text-sm text-secondary/90 font-medium uppercase tracking-wide">
                Étape {tutoStep} sur 3
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center">
                {tutoStep === 1 && (fromInspiration ? "Votre souvenir" : "Une image pour illustrer votre souvenir ?")}
                {tutoStep === 2 && (fromInspiration ? "Une image pour illustrer votre souvenir ?" : "Donnez-lui un titre")}
                {tutoStep === 3 && "Racontez ce moment"}
              </h2>

              {/* Mini progress */}
              <div className="mt-4 flex justify-center gap-1.5">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      n === tutoStep ? "w-6 bg-secondary" : n < tutoStep ? "w-3 bg-white/60" : "w-3 bg-white/20"
                    )}
                  />
                ))}
              </div>

              {((tutoStep === 1 && !fromInspiration) || (tutoStep === 2 && fromInspiration)) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-6 h-48 rounded-2xl relative overflow-hidden ring-2 ring-secondary/40",
                    userImage ? "bg-cover bg-center" : "bg-white/5 border border-dashed border-white/20"
                  )}
                  style={userImage ? { backgroundImage: `url(${userImage})` } : undefined}
                >
                  {userImage && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/95 hover:bg-black/20 transition-colors"
                    aria-label={userImage ? "Changer la photo" : "Ajouter une photo"}
                  >
                    <span className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Camera className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                      {userImage ? "Changer la photo" : "Ajouter une photo"}
                    </span>
                  </button>
                  {userImage && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUserImage(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                      aria-label="Retirer la photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}

              {((tutoStep === 1 && fromInspiration) || (tutoStep === 2 && !fromInspiration)) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-medium text-white/80">Le titre</label>
                  {fromInspiration ? (
                    <Textarea
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      rows={3}
                      className="mt-1 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                    />
                  ) : (
                    <Input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder=""
                      className="mt-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                    />
                  )}
                </motion.div>
              )}

              {tutoStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-medium text-white/80">Le récit</label>
                  <Textarea
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    placeholder=""
                    className="mt-1 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  />
                </motion.div>
              )}
            </div>
            <div className="p-5 pb-8 border-t border-white/10 bg-[#0f0f1e]/80 flex gap-3">
              <Button
                size="mobileLg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10"
                onClick={() => {
                  if (tutoStep === 1) {
                    setShowInspirations(true);
                  } else {
                    setTutoStep((s) => (s - 1) as 1 | 2 | 3);
                  }
                }}
              >
                Retour
              </Button>
              {tutoStep < 3 ? (
                <Button
                  size="mobileLg"
                  className="flex-1 bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                  onClick={() => setTutoStep((s) => (s + 1) as 1 | 2 | 3)}
                  disabled={tutoStep === 2 && !title.trim()}
                >
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="mobileLg"
                  className="flex-1 bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                  onClick={handleCreate}
                  disabled={!title.trim()}
                >
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          </Container>
        )}

        {step === 4 && (
          <Container key="s4" className="bg-gradient-to-b from-[#1a1a2e] via-[#1f1a3e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-16 pb-4">
              <div className="w-full max-w-md mx-auto">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-white">
                  Encore une étape pour mettre votre souvenir à l'abri<span className="text-secondary">*</span>.
                </h2>
                <p className="mt-3 text-center text-sm text-white/70">
                  Un espace simple pour ne plus les perdre.
                </p>

                {/* Capabilities once saved */}
                <div className="mt-6">
                  <p className="text-center text-xs uppercase tracking-widest text-secondary/80">
                    Une fois conservé, ce souvenir pourra…
                  </p>
                  <ul className="mt-3 space-y-2">
                    {[
                      { Icon: Share2, t: "Être partagé avec vos proches" },
                      { Icon: TreePine, t: "Être rattaché à votre arbre généalogique" },
                      { Icon: Clock, t: "Se retrouver dans votre chronologie" },
                    ].map(({ Icon, t }, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-secondary" />
                        </span>
                        <span className="text-sm text-white/90">{t}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Trust — visually distinct: compact 3-col grid with top icons */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-center text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Avec Family Garden
                  </p>
                  <ul className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { Icon: Shield, t: "Hébergé en France" },
                      { Icon: Lock, t: "Strictement privé" },
                      { Icon: Heart, t: "Transmissible" },
                    ].map(({ Icon, t }, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex flex-col items-center text-center gap-2 px-2 py-3 rounded-xl bg-transparent"
                      >
                        <span className="w-9 h-9 rounded-full border border-secondary/40 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-secondary" />
                        </span>
                        <span className="text-[11px] font-medium text-white/75 leading-tight">{t}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-5 pb-8">
              <div className="w-full max-w-md mx-auto space-y-3">
                <Button
                  size="mobileLg"
                  className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90 text-sm sm:text-base whitespace-normal leading-tight px-4 py-3 h-auto min-h-[3.25rem]"
                  onClick={handleConvert}
                >
                  <span className="truncate">Créer mon espace gratuitement</span>
                  <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
                </Button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full text-sm text-white/60 hover:text-white py-2"
                >
                  En savoir plus avant de me lancer
                </button>
                <p className="text-sm text-white/70 text-center leading-snug pt-2">
                  <span className="text-secondary font-semibold">*</span> Votre souvenir sera effacé automatiquement si vous ne poursuivez pas la visite.
                </p>
              </div>
            </div>
          </Container>
        )}
      </AnimatePresence>

      {/* Discreet exit handle (top-right) — opens abandon dialog instead of leaving silently */}
      {step >= 3 && step <= 4 && (
        <button
          onClick={() => setShowAbandon(true)}
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-white/10 backdrop-blur text-white/70 hover:text-white text-xs"
          aria-label="Quitter la démo"
        >
          ✕
        </button>
      )}

      {/* Persistent header: logo + step dots, on same row, never overlap content */}
      <div className="absolute top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Family Garden" className="h-6 sm:h-7 w-auto drop-shadow" />
          <span className="font-display text-sm sm:text-base font-semibold text-white drop-shadow">
            Family<span className="text-secondary">Garden</span>
          </span>
        </div>
        <div className="flex gap-1.5 mr-12">
          {(() => {
            const displayed = step === 1 ? 1 : step === 3 ? 2 : 3;
            return Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i + 1 === displayed ? "w-5 bg-secondary" : i + 1 < displayed ? "w-2.5 bg-white/60" : "w-2.5 bg-white/20"
                )}
              />
            ));
          })()}
        </div>
      </div>

      <Dialog open={showAbandon} onOpenChange={setShowAbandon}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Votre souvenir n'est pas encore à l'abri.</DialogTitle>
          <DialogDescription>
            Encore un instant, et il rejoindra votre journal pour de bon.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => setShowAbandon(false)}
            >
              Reprendre où j'en étais
            </Button>
            <button
              onClick={() => {
                setShowAbandon(false);
                navigate("/");
              }}
              className="text-sm text-muted-foreground hover:text-foreground py-1"
            >
              Quitter tout de même
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoExperience;
