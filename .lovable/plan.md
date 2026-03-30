

## Plan: Déplacer la section Tutoriels sous "Comment ça marche ?"

Actuellement dans `src/pages/Index.tsx`, l'ordre est :
1. FeaturesSection
2. **HowItWorksVideo** (Tutoriels) ← à déplacer
3. HowItWorksSection (Comment ça marche ?)

**Changement** : Inverser les lignes 2 et 3 dans le bloc `<Suspense>` pour obtenir :
1. FeaturesSection
2. HowItWorksSection (Comment ça marche ?)
3. **HowItWorksVideo** (Tutoriels)

Un seul fichier modifié : `src/pages/Index.tsx`.

