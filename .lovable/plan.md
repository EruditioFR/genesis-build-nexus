# Cartouche tarif masqué par le header sur smartphone

## Diagnostic

Le header est en position fixe et mesure environ 88 px de haut sur mobile en état initial (padding vertical `py-6` + logo 40 px). Le hero, lui, démarre avec `pt-20` (80 px) sur mobile. Le cartouche prix/essai, qui est le tout premier élément du hero, passe donc sous le header.

## Recommandation

Ajouter du padding plutôt que masquer le header.

Masquer le header au chargement puis le révéler au scroll nuirait à la conversion (le bouton « S'inscrire » disparaît du premier écran), à l'accessibilité et à la stabilité visuelle (décalage de mise en page au premier scroll). Le problème est purement un décalage de quelques pixels.

## Modification

Fichier : `src/components/landing/v3/HeroSectionV3.tsx`

- Passer le padding haut mobile de `pt-20` à `pt-28` (112 px) pour dégager entièrement le cartouche sous le header, en conservant `sm:pt-32` sur desktop.
- Réduire légèrement la marge basse du cartouche pour que le H1 et le CTA restent visibles au-dessus de la ligne de flottaison sur petit écran.

## Vérification

Capture d'écran mobile (375 px) via navigateur automatisé pour confirmer que le cartouche est entièrement visible et que le CTA principal reste dans le premier écran.
