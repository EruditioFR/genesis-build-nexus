## Diagnostic du slider actuel

Le slider du hero fonctionne mais reste **passif et anonyme** :
- Les images défilent sans contexte (on ne sait pas ce qu'on regarde : mariage, voyage, école…)
- Les indicateurs (petits points en bas) sont peu visibles et discrets
- Pas de lien émotionnel entre l'image affichée et le message de souscription
- Aucun "preview" de ce qui arrive ensuite → l'œil ne s'accroche pas
- Pas de respiration visuelle (effet Ken Burns / zoom lent) qui donnerait du cinéma

Résultat : l'utilisateur perçoit un fond joli mais générique, pas une **promesse de produit**.

## Objectif

Transformer le slider en **vitrine narrative** qui montre concrètement *ce que Family Garden permet de préserver*, et donne envie de commencer.

## Améliorations proposées

### 1. Étiquette thématique animée (en haut à gauche du contenu)
Ajouter une petite "pill" élégante qui apparaît en fondu à chaque changement de slide :
- 💍 « Mariage de Claire & Thomas — 2018 »
- 🎂 « Les 80 ans de Mamie Jeanne »
- ✈️ « Road trip en Toscane »
- 🎓 « Remise de diplôme »
- 🎵 « La playlist de papa »

→ Effet : chaque image devient un **souvenir incarné**, plus une simple photo stock.

### 2. Effet Ken Burns (zoom + pan lent)
Remplacer l'apparition statique par un lent zoom-in (scale 1 → 1.08 sur 6s) + léger pan horizontal. Donne une qualité "documentaire / cinéma" et retient l'œil bien plus longtemps.

### 3. Vignettes preview en bas (remplace les points)
Remplacer les petits points par une **rangée de mini-vignettes** (40×40px arrondies) :
- La vignette active est agrandie, bordure dorée, légèrement surélevée
- Les autres sont en opacité 60%
- Au survol → preview agrandi
- Cliquables pour naviguer

→ L'utilisateur **voit ce qui vient** = curiosité + sentiment de richesse de contenu.

### 4. Barre de progression fine sous les vignettes
Une fine barre dorée qui se remplit en 5s et se réinitialise à chaque slide. Crée une attente subtile et un rythme.

### 5. Micro-CTA contextuel (optionnel, discret)
Sous l'étiquette thématique, une ligne discrète :
> *« Préservez vos moments comme celui-ci → »*

Le lien renvoie vers `/signup`. Renforce le pont visuel entre image émotionnelle et action.

### 6. Indicateur de pause au survol
Quand l'utilisateur survole le hero, le slider se met en pause (avec une icône ⏸ discrète). Donne du contrôle et empêche la frustration de "rater" un slide.

## Détails techniques

**Fichier modifié** : `src/components/landing/HeroSection.tsx` uniquement.

**Changements** :
1. Enrichir `heroSlides` avec `theme` (emoji + label thématique court).
2. Ajouter état `isPaused` (mouseenter/mouseleave sur la section).
3. Wrapper l'image active dans un `motion.img` avec `animate={{ scale: [1, 1.08] }}` durée 6s ease-out.
4. Nouveau composant interne `<SlideThumbnails>` : flex row de boutons 40×40 rounded-xl avec `bg-cover` de chaque slide ; vignette active scale-110, ring-2 ring-secondary.
5. Ajouter `<motion.div>` barre de progression : key={currentSlide} avec `animate={{ width: '100%' }}` sur 5s, `bg-secondary` h-0.5.
6. Ajouter `<motion.div>` étiquette thématique : `AnimatePresence mode="wait"`, position au-dessus du titre H1 (centré), pill `bg-white/15 backdrop-blur-md border-white/20`.
7. Conserver les indicateurs actuels uniquement sur mobile (les vignettes seraient trop chargées sur petit écran) — ou version compacte 28×28 avec scroll horizontal.

**Responsive** :
- Mobile : étiquette thématique conservée + points indicateurs (vignettes masquées)
- ≥sm : vignettes preview visibles à la place des points

**Performance** :
- Vignettes utilisent les mêmes `src` déjà préchargés → pas de requêtes additionnelles
- Ken Burns en CSS transform → GPU, pas de jank
- Pas de nouvelle dépendance

**Accessibilité** :
- `aria-label` détaillé sur chaque vignette (« Voir le souvenir : Mariage »)
- `aria-live="polite"` sur l'étiquette thématique
- Respect de `prefers-reduced-motion` → désactive Ken Burns

## Hors scope

- Pas de modification du `PricingSection` ni du flow checkout
- Pas de nouvelles images (on réutilise les 6 slides existantes)
- Pas de changement i18n majeur (les libellés thématiques peuvent être ajoutés plus tard dans `landing.json` si validé)
