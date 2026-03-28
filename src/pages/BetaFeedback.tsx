import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Sparkles, CheckCircle2, Heart, MessageSquare, Star as StarIcon, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/feedback/StarRating';
import NoIndex from '@/components/seo/NoIndex';
import { toast } from '@/hooks/use-toast';

const FEATURE_QUESTIONS = [
  { key: 'memory_creation', label: 'Création de souvenirs (texte, photo)', desc: 'Facilité de création et édition des souvenirs' },
  { key: 'navigation', label: 'Navigation et ergonomie générale', desc: 'Facilité à trouver les fonctionnalités' },
  { key: 'timeline', label: 'Timeline / Chronologie', desc: 'Visualisation chronologique de vos souvenirs' },
  { key: 'circles', label: 'Cercles de partage', desc: 'Partage avec vos proches' },
  { key: 'family_tree', label: 'Arbre généalogique', desc: 'Création et navigation dans l\'arbre' },
  { key: 'categories', label: 'Catégories et sous-catégories', desc: 'Organisation thématique des souvenirs' },
  { key: 'search', label: 'Recherche globale', desc: 'Retrouver rapidement un souvenir' },
  { key: 'story_mode', label: 'Mode Story', desc: 'Visualisation en mode histoire' },
  { key: 'profile', label: 'Profil utilisateur', desc: 'Gestion de votre profil et paramètres' },
  { key: 'notifications', label: 'Notifications', desc: 'Alertes et rappels' },
  { key: 'inspirations', label: 'Inspirations / Suggestions', desc: 'Idées de souvenirs à créer' },
];

const UX_QUESTIONS = [
  { key: 'ease_of_use', label: 'Facilité de prise en main', desc: 'Intuitivité dès la première utilisation' },
  { key: 'design', label: 'Design et esthétique', desc: 'Qualité visuelle de l\'interface' },
  { key: 'speed', label: 'Rapidité de chargement', desc: 'Performance et fluidité' },
  { key: 'clarity', label: 'Clarté des textes et instructions', desc: 'Compréhension des libellés' },
  { key: 'mobile', label: 'Expérience mobile', desc: 'Utilisation sur téléphone ou tablette' },
  { key: 'signup', label: 'Processus d\'inscription', desc: 'Création de compte et connexion' },
  { key: 'media_upload', label: 'Gestion des médias', desc: 'Upload de photos et vidéos' },
];

const TOTAL_STEPS = 5;

const BetaFeedback = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [featureRatings, setFeatureRatings] = useState<Record<string, number>>({});
  const [uxRatings, setUxRatings] = useState<Record<string, number>>({});
  const [generalOpinion, setGeneralOpinion] = useState('');
  const [issues, setIssues] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [recommendReason, setRecommendReason] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user]);

  useEffect(() => {
    if (user) {
      supabase
        .from('beta_feedback')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setAlreadySubmitted(true);
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const setFeatureRating = (key: string, value: number) => {
    setFeatureRatings(prev => ({ ...prev, [key]: value }));
  };

  const setUxRating = (key: string, value: number) => {
    setUxRatings(prev => ({ ...prev, [key]: value }));
  };

  const totalRatingsGiven = Object.keys(featureRatings).length + Object.keys(uxRatings).length;
  const hasOpenFeedback = generalOpinion.trim() || issues.trim() || suggestions.trim() || wouldRecommend !== null;

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('beta_feedback').insert({
        user_id: user.id,
        feature_ratings: featureRatings,
        ux_ratings: uxRatings,
        general_opinion: generalOpinion.trim() || null,
        issues_encountered: issues.trim() || null,
        feature_suggestions: suggestions.trim() || null,
        would_recommend: wouldRecommend,
        recommend_reason: recommendReason.trim() || null,
      });
      if (error) throw error;
      setStep(5);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const progressValue = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepIcons = [Sparkles, StarIcon, ClipboardList, MessageSquare, CheckCircle2];
  const stepLabels = ['Bienvenue', 'Fonctionnalités', 'Expérience', 'Avis libres', 'Merci'];

  return (
    <>
      <NoIndex />
      <AuthenticatedLayout
        user={{ id: user.id, email: user.email, displayName: profile?.display_name || undefined, avatarUrl: profile?.avatar_url || undefined }}
        onSignOut={handleSignOut}
      >
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              {stepLabels.map((label, i) => {
                const Icon = stepIcons[i];
                const isActive = step === i + 1;
                const isDone = step > i + 1;
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-secondary text-white' : isDone ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium hidden sm:block ${isActive ? 'text-secondary' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {alreadySubmitted && step !== 5 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Merci pour votre retour !</h2>
                <p className="text-muted-foreground mb-6">Vous avez déjà soumis votre avis. Nous l'avons bien reçu et il nous sera précieux.</p>
                <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1 — Welcome */}
                {step === 1 && (
                  <Card className="border-secondary/20">
                    <CardContent className="p-6 md:p-10 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Heart className="w-10 h-10 text-white" />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                        Merci {profile?.display_name?.split(' ')[0] || 'cher testeur'} ! 🙏
                      </h1>
                      <p className="text-muted-foreground text-base md:text-lg mb-4 max-w-lg mx-auto">
                        En tant que beta testeur du forfait <span className="font-semibold text-secondary">Héritage</span>, votre avis est essentiel pour faire évoluer Family Garden.
                      </p>
                      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                        Ce formulaire ne prend que <span className="font-semibold">5 minutes</span>. Vos réponses nous aideront à améliorer chaque aspect du site avant le lancement officiel.
                      </p>
                      <Button size="lg" className="min-w-[200px]" onClick={() => setStep(2)}>
                        Commencer <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2 — Feature Ratings */}
                {step === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <StarIcon className="w-5 h-5 text-secondary" />
                        Évaluation des fonctionnalités
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Notez chaque fonctionnalité de 1 à 5 étoiles selon votre satisfaction.</p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      {FEATURE_QUESTIONS.map(q => (
                        <StarRating
                          key={q.key}
                          label={q.label}
                          description={q.desc}
                          value={featureRatings[q.key] || 0}
                          onChange={(v) => setFeatureRating(q.key, v)}
                        />
                      ))}
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setStep(1)}>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                        <Button onClick={() => setStep(3)}>
                          Suivant <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3 — UX Ratings */}
                {step === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <ClipboardList className="w-5 h-5 text-secondary" />
                        Qualité de l'expérience utilisateur
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Évaluez la qualité globale de votre expérience sur le site.</p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      {UX_QUESTIONS.map(q => (
                        <StarRating
                          key={q.key}
                          label={q.label}
                          description={q.desc}
                          value={uxRatings[q.key] || 0}
                          onChange={(v) => setUxRating(q.key, v)}
                        />
                      ))}
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setStep(2)}>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                        <Button onClick={() => setStep(4)}>
                          Suivant <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4 — Open Feedback */}
                {step === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="w-5 h-5 text-secondary" />
                        Vos retours libres
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Exprimez-vous librement ! Chaque retour compte.</p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-6">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">💬 Votre avis général sur Family Garden</Label>
                        <Textarea
                          value={generalOpinion}
                          onChange={(e) => setGeneralOpinion(e.target.value)}
                          placeholder="Partagez votre impression générale sur le site..."
                          className="min-h-[100px]"
                          maxLength={2000}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">🐛 Problèmes rencontrés pendant le test</Label>
                        <Textarea
                          value={issues}
                          onChange={(e) => setIssues(e.target.value)}
                          placeholder="Bugs, erreurs, comportements inattendus, difficultés..."
                          className="min-h-[100px]"
                          maxLength={2000}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-2 block">💡 Fonctionnalités à ajouter ou améliorer</Label>
                        <Textarea
                          value={suggestions}
                          onChange={(e) => setSuggestions(e.target.value)}
                          placeholder="Quelles fonctionnalités aimeriez-vous voir sur Family Garden ?"
                          className="min-h-[100px]"
                          maxLength={2000}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold mb-3 block">❤️ Recommanderiez-vous Family Garden à un proche ?</Label>
                        <div className="flex gap-3 mb-3">
                          <Button
                            type="button"
                            variant={wouldRecommend === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setWouldRecommend(true)}
                          >
                            Oui 👍
                          </Button>
                          <Button
                            type="button"
                            variant={wouldRecommend === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setWouldRecommend(false)}
                          >
                            Non 👎
                          </Button>
                        </div>
                        {wouldRecommend !== null && (
                          <Textarea
                            value={recommendReason}
                            onChange={(e) => setRecommendReason(e.target.value)}
                            placeholder={wouldRecommend ? 'Qu\'est-ce qui vous a le plus plu ?' : 'Qu\'est-ce qui pourrait vous faire changer d\'avis ?'}
                            className="min-h-[80px]"
                            maxLength={1000}
                          />
                        )}
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep(3)}>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Envoyer mon avis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 5 — Confirmation */}
                {step === 5 && (
                  <Card className="border-secondary/20">
                    <CardContent className="p-8 md:p-12 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                      </motion.div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                        Merci infiniment ! 🎉
                      </h2>
                      <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                        Votre retour est précieux et nous aidera à construire la meilleure expérience possible pour préserver les souvenirs de famille.
                      </p>
                      <div className="bg-muted/50 rounded-xl p-4 mb-8 max-w-sm mx-auto">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{totalRatingsGiven}</span> fonctionnalités évaluées
                          {hasOpenFeedback && <> · <span className="font-semibold text-foreground">commentaires</span> ajoutés</>}
                        </p>
                      </div>
                      <Button size="lg" onClick={() => navigate('/dashboard')}>
                        Retour au tableau de bord
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default BetaFeedback;
