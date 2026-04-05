

## Plan : Test A/B sur la page d'accueil

### Concept

Ajouter un système de test A/B simple qui affiche aléatoirement (50/50) l'une des deux variantes de la page d'accueil aux visiteurs non identifiés. La variante est persistée en `localStorage` pour que le visiteur voie toujours la meme version.

### Variante B — Positionnement "moderne / jeune"

Structure narrative en storytelling, axée sur le problème et la solution :

1. **Hero** — Accroche émotionnelle sur la douleur : "Vos souvenirs sont éparpillés entre 10 apps. Un jour, ils disparaîtront." CTA fort.
2. **Section Problème** — 3 pain points illustrés (photos perdues dans le cloud, stories éphémères, réseaux sociaux = public). Comparaison visuelle Family Garden vs réseaux sociaux.
3. **Section Solution / Fonctionnalités** — Cards modernes avec les fonctionnalités clés présentées comme des réponses aux douleurs (privé vs public, durable vs éphémère, organisé vs chaos).
4. **Section Public concerné** — 3 profils cibles : jeunes parents, familles multigénérationnelles, personnes souhaitant transmettre un héritage.
5. **Section Social Proof** — Témoignages + chiffres clés.
6. **CTA final** — Urgence douce : "Commencez avant que le prochain souvenir ne se perde."
7. Footer (réutilisé).

### Implémentation technique

**Fichiers créés :**
- `src/lib/abTest.ts` — Hook `useABVariant('landing', 2)` qui tire au sort une variante (0 ou 1), la stocke dans `localStorage`, et envoie un event Google Analytics (`ab_test_variant`).
- `src/components/landing/v2/HeroSectionV2.tsx` — Hero storytelling sombre/moderne.
- `src/components/landing/v2/PainPointsSection.tsx` — Section "Le problème" avec comparaison réseaux sociaux.
- `src/components/landing/v2/SolutionSection.tsx` — Fonctionnalités comme réponses aux douleurs.
- `src/components/landing/v2/AudienceSection.tsx` — 3 profils cibles.
- `src/pages/IndexV2.tsx` — Assemblage de la variante B (réutilise Header, Footer, PricingSection, FAQSection, TestimonialsSection, CookieBanner existants).

**Fichier modifié :**
- `src/pages/Index.tsx` — Utilise le hook A/B pour rendre soit le contenu actuel (variante A), soit `IndexV2` (variante B).

**Traductions :** Ajout de clés `landingV2` dans les fichiers `landing.json` des 7 langues (fr, en, es, pt, it, ko, zh).

### Tracking A/B

Le hook envoie automatiquement un événement GA `ab_test_variant` avec la variante attribuée. Cela permet de comparer les taux de conversion (inscription) entre les deux versions dans Google Analytics.

### Sections réutilisées de la V1

PricingSection, FAQSection, TestimonialsSection, Footer et CookieBanner sont partagés entre les deux variantes pour garder la cohérence et limiter le code dupliqué.

