import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Lock, Shield, Users, Baby, UserRound, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SEOHead from "@/components/seo/SEOHead";
import useGoogleAnalytics from "@/hooks/useGoogleAnalytics";
import heroBg from "@/assets/hero-background.webp";
import ctaImg from "@/assets/cta-family-moment.jpg";
import { cn } from "@/lib/utils";

type Persona = "enfants" | "famille" | "parents";

const PERSONA_COPY: Record<Persona, { label: string; possessive: string; share: string; icon: typeof Users }> = {
  enfants: { label: "Mes enfants", possessive: "vos enfants", share: "vos enfants", icon: Baby },
  famille: { label: "Ma famille", possessive: "votre famille", share: "votre famille", icon: Users },
  parents: { label: "Mes parents", possessive: "vos parents", share: "vos parents", icon: UserRound },
};

const STORAGE_KEY = "fg_demo_state_v1";

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
  const [title, setTitle] = useState("Vacances à la mer");
  const [text, setText] = useState("Le jour où ils ont vu l'océan pour la première fois");
  const [showAbandon, setShowAbandon] = useState(false);
  const [step6CtaVisible, setStep6CtaVisible] = useState(false);
  const [step5CtaVisible, setStep5CtaVisible] = useState(false);
  const startedRef = useRef(false);

  // restore state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.persona) setPersona(s.persona);
        if (s.title) setTitle(s.title);
        if (s.text) setText(s.text);
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
      if (step >= 3 && step <= 6) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step]);

  // step 5 timed CTA
  useEffect(() => {
    if (step === 5) {
      setStep5CtaVisible(false);
      const t = setTimeout(() => setStep5CtaVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  // step 6 timed CTA + tracking
  useEffect(() => {
    if (step === 6) {
      setStep6CtaVisible(false);
      trackEvent("reach_projection", "demo", persona ?? undefined);
      const t = setTimeout(() => setStep6CtaVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, [step, trackEvent, persona]);

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
        title="Découvrez Family Garden en 1 minute — Journal de famille privé"
        description="Vivez en 60 secondes ce que Family Garden change pour vos souvenirs de famille. Créez, protégez et transmettez ce qui compte vraiment."
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
                Vos souvenirs disparaissent.
                <br />
                <span className="text-secondary">Vous ne vous en rendez pas compte.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 text-lg text-white/80 max-w-sm"
              >
                Ils sont partout… et donc nulle part.
              </motion.p>
            </div>
            <div className="relative p-6 pb-10">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={() => goTo(2)}
              >
                Créer un souvenir
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </Container>
        )}

        {step === 2 && (
          <Container key="s2" className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
            <div className="flex-1 flex flex-col justify-center px-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-center leading-snug">
                Pour qui voulez-vous garder ces souvenirs ?
              </h2>
              <div className="mt-10 space-y-4">
                {(Object.keys(PERSONA_COPY) as Persona[]).map((p) => {
                  const Icon = PERSONA_COPY[p].icon;
                  return (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handlePersona(p)}
                      className={cn(
                        "w-full min-h-[64px] rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm",
                        "px-6 flex items-center gap-4 text-left transition-all hover:bg-white/10 hover:border-secondary/60",
                        persona === p && "border-secondary bg-secondary/15"
                      )}
                    >
                      <span className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-secondary" />
                      </span>
                      <span className="text-lg font-medium">{PERSONA_COPY[p].label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Container>
        )}

        {step === 3 && (
          <Container key="s3" className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
              <p className="text-center text-sm text-secondary/90 font-medium uppercase tracking-wide">
                En quelques secondes
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center">
                Créez un souvenir qui dure toute une vie
              </h2>

              <div
                className="mt-5 h-40 rounded-2xl bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url(${ctaImg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 right-3 text-xs text-white/80 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Photo suggérée
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">Titre</label>
                  <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">Souvenir</label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="mt-1 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 pb-8 border-t border-white/10 bg-[#0f0f1e]/80">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={handleCreate}
                disabled={!title.trim()}
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </Container>
        )}

        {step === 4 && personaCopy && (
          <Container key="s4" className="bg-gradient-to-b from-[#1a1a2e] via-[#1f1a3e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
              <p className="text-center text-xs uppercase tracking-widest text-secondary">Votre souvenir</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center">
                Structuré. Retrouvé. Vivant.
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-6 rounded-3xl overflow-hidden bg-white text-foreground shadow-gold"
              >
                <div
                  className="h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${ctaImg})` }}
                />
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold">{title || "Vacances à la mer"}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <personaCopy.icon className="w-4 h-4 text-secondary" />
                    </span>
                    <span className="text-sm font-medium">Pour {personaCopy.possessive}</span>
                  </div>
                </div>
              </motion.div>

              {/* Mini timeline */}
              <div className="mt-6 pl-4 border-l-2 border-secondary/40 space-y-4">
                {[
                  { y: "Aujourd'hui", t: title || "Vacances à la mer" },
                  { y: "L'année prochaine", t: "Premier jour d'école" },
                  { y: "Plus tard", t: "Anniversaire en famille" },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="relative"
                  >
                    <span className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-secondary" />
                    <p className="text-xs text-secondary uppercase tracking-wide">{m.y}</p>
                    <p className="text-sm text-white/90">{m.t}</p>
                  </motion.div>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-white/70">
                Votre souvenir est maintenant structuré, retrouvé, vivant.
              </p>
            </div>
            <div className="p-5 pb-8">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={() => goTo(5)}
              >
                Partager avec {personaCopy.share}
              </Button>
            </div>
          </Container>
        )}

        {step === 5 && (
          <Container key="s5" className="bg-black">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col justify-center items-center px-8 text-center"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                Sans espace dédié,
                <br />
                <span className="text-white/70">ce souvenir aurait été perdu.</span>
              </h2>
              <p className="mt-6 text-base text-white/60">Comme des milliers d'autres.</p>
            </motion.div>
            <div className="p-5 pb-8 min-h-[88px]">
              <AnimatePresence>
                {step5CtaVisible && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button
                      size="mobileLg"
                      variant="outline"
                      className="w-full border-white/30 text-white bg-transparent hover:bg-white/10"
                      onClick={() => goTo(6)}
                    >
                      Continuer
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        )}

        {step === 6 && (
          <Container key="s6" className="bg-gradient-to-b from-[#1a1a2e] to-black">
            <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-2xl sm:text-3xl font-bold"
              >
                Dans 10 ans, vous pourrez encore le revivre.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-6 text-xl font-display text-secondary"
              >
                Et le transmettre.
              </motion.p>
            </div>
            <div className="p-5 pb-8 min-h-[88px]">
              <AnimatePresence>
                {step6CtaVisible && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button
                      size="mobileLg"
                      className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                      onClick={() => goTo(7)}
                    >
                      Je veux ça pour ma famille
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        )}

        {step === 7 && (
          <Container key="s7" className="bg-gradient-warm text-foreground">
            <div className="flex-1 overflow-y-auto px-6 pt-10 pb-4">
              <h2 className="font-display text-3xl font-bold text-center text-foreground">
                Créez votre espace famille privé
              </h2>
              <p className="mt-3 text-center text-muted-foreground">
                Tout ce qui compte, à un seul endroit. À vie.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  { Icon: Shield, t: "Vos souvenirs protégés à vie" },
                  { Icon: Lock, t: "Partage uniquement avec vos proches" },
                  { Icon: Heart, t: "Une mémoire familiale qui ne disparaît plus" },
                ].map(({ Icon, t }, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur border border-border"
                  >
                    <span className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-secondary" />
                    </span>
                    <span className="text-base text-foreground font-medium pt-1.5">{t}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="p-5 pb-8 space-y-3">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={handleConvert}
              >
                Créer mon espace
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <button
                onClick={() => navigate("/")}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
              >
                Voir un exemple
              </button>
            </div>
          </Container>
        )}
      </AnimatePresence>

      {/* Discreet exit handle (top-right) — opens abandon dialog instead of leaving silently */}
      {step >= 3 && step <= 6 && (
        <button
          onClick={() => setShowAbandon(true)}
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-white/10 backdrop-blur text-white/70 hover:text-white text-xs"
          aria-label="Quitter la démo"
        >
          ✕
        </button>
      )}

      {/* Step indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i + 1 === step ? "w-6 bg-secondary" : i + 1 < step ? "w-3 bg-white/60" : "w-3 bg-white/20"
            )}
          />
        ))}
      </div>

      <Dialog open={showAbandon} onOpenChange={setShowAbandon}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Votre souvenir n'a pas été enregistré.</DialogTitle>
          <DialogDescription>
            Encore quelques secondes pour le sauver et le partager avec vos proches.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => setShowAbandon(false)}
            >
              Reprendre
            </Button>
            <button
              onClick={() => {
                setShowAbandon(false);
                navigate("/");
              }}
              className="text-sm text-muted-foreground hover:text-foreground py-1"
            >
              Quitter quand même
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoExperience;
