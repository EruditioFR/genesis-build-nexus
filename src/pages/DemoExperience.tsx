import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Lock, Shield, Users, Baby, UserRound, Image as ImageIcon, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SEOHead from "@/components/seo/SEOHead";
import ImageCropDialog from "@/components/demo/ImageCropDialog";
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
  const [title, setTitle] = useState("L'été à La Baule");
  const [text, setText] = useState("Le matin où ils ont découvert la mer, pieds nus dans le sable.");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showAbandon, setShowAbandon] = useState(false);
  const [step6CtaVisible, setStep6CtaVisible] = useState(false);
  const [step5CtaVisible, setStep5CtaVisible] = useState(false);
  const [tutoStep, setTutoStep] = useState<1 | 2 | 3>(1);
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
        setPendingImage(reader.result);
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
                Vos souvenirs se perdent déjà.
                <br />
                <span className="text-secondary">Vous ne vous en rendez pas compte.</span>
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
                Pour qui voulez-vous éviter de perdre ces souvenirs ?
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
                Étape {tutoStep} sur 3
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center">
                {tutoStep === 1 && "Commencez par une photo"}
                {tutoStep === 2 && "Donnez-lui un titre"}
                {tutoStep === 3 && "Racontez ce moment"}
              </h2>
              <p className="mt-2 text-center text-sm text-white/70 px-2">
                {tutoStep === 1 && "Choisissez une image qui ramène ce souvenir à la surface."}
                {tutoStep === 2 && "Quelques mots suffisent pour le retrouver plus tard."}
                {tutoStep === 3 && "Notez ce qui pourrait s'oublier avec le temps."}
              </p>

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

              {tutoStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 h-48 rounded-2xl bg-cover bg-center relative overflow-hidden ring-2 ring-secondary/40"
                  style={{ backgroundImage: `url(${userImage || ctaImg})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/95 hover:bg-black/30 transition-colors"
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
                  {!userImage && (
                    <span className="absolute bottom-2 right-3 text-xs text-white/80 flex items-center gap-1 pointer-events-none">
                      <ImageIcon className="w-3 h-3" /> Exemple
                    </span>
                  )}
                </motion.div>
              )}

              {tutoStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-medium text-white/80">Le titre</label>
                  <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex. L'été à La Baule"
                    className="mt-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    Un titre court, celui qui vous reviendra en tête dans dix ans.
                  </p>
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
                    placeholder="Ce que vous voulez ne pas oublier…"
                    className="mt-1 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    Une phrase, un détail, une émotion. Ce qui s'effacerait sinon.
                  </p>
                </motion.div>
              )}
            </div>
            <div className="p-5 pb-8 border-t border-white/10 bg-[#0f0f1e]/80 flex gap-3">
              {tutoStep > 1 && (
                <Button
                  size="mobileLg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10"
                  onClick={() => setTutoStep((s) => (s - 1) as 1 | 2 | 3)}
                >
                  Retour
                </Button>
              )}
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
                  Mettre à l'abri
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          </Container>
        )}

        {step === 4 && personaCopy && (
          <Container key="s4" className="bg-gradient-to-b from-[#1a1a2e] via-[#1f1a3e] to-[#0f0f1e]">
            <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
              <p className="text-center text-xs uppercase tracking-widest text-secondary">Ce souvenir est maintenant à l'abri</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-center">
                Voilà. Il ne se perdra plus.
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-6 rounded-3xl overflow-hidden bg-white text-foreground shadow-gold"
              >
                <div
                  className="h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${userImage || ctaImg})` }}
                />
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold">{title || "L'été à La Baule"}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <personaCopy.icon className="w-4 h-4 text-secondary" />
                    </span>
                    <span className="text-sm font-medium">Pour {personaCopy.possessive}, un jour</span>
                  </div>
                </div>
              </motion.div>

              {/* Mini timeline */}
              <div className="mt-6 pl-4 border-l-2 border-secondary/40 space-y-4">
                {[
                  { y: "Aujourd'hui", t: title || "L'été à La Baule" },
                  { y: "L'an prochain", t: "La rentrée des classes" },
                  { y: "Dans dix ans", t: "Un anniversaire en famille" },
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
                Un souvenir à sa place, prêt à être raconté.
              </p>
            </div>
            <div className="p-5 pb-8">
              <Button
                size="mobileLg"
                className="w-full bg-secondary text-secondary-foreground shadow-gold hover:bg-secondary/90"
                onClick={() => goTo(5)}
              >
                L'offrir à {personaCopy.share}
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
                Sans endroit pour le garder,
                <br />
                <span className="text-white/70">ce souvenir aurait fini par disparaître.</span>
              </h2>
              <p className="mt-6 text-base text-white/60">Comme beaucoup d'autres, déjà oubliés.</p>
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
                Dans quelques années, vous pourriez ne plus vous souvenir de ce moment.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-6 text-xl font-display text-secondary"
              >
                Sauf si vous le conservez.
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
                      Garder mes souvenirs
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
                Gardez vos souvenirs en sécurité
              </h2>
              <p className="mt-3 text-center text-muted-foreground">
                Un espace simple pour ne plus les perdre.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  { Icon: Shield, t: "Conservés à l'abri, hébergés en France" },
                  { Icon: Lock, t: "Privé par nature, ouvert à vos seuls proches" },
                  { Icon: Heart, t: "Une mémoire de famille qui se transmet" },
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
                En savoir plus avant de me lancer
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

      <ImageCropDialog
        open={!!pendingImage}
        imageSrc={pendingImage}
        aspect={16 / 10}
        onCancel={() => setPendingImage(null)}
        onConfirm={(url) => {
          setUserImage(url);
          setPendingImage(null);
          trackEvent("demo_upload_image", "demo");
        }}
      />
    </div>
  );
};

export default DemoExperience;
