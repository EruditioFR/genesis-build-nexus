# Vignettes de souvenirs flottantes dans le hero

Ajouter une couche visuelle discrète et élégante autour du titre du hero : de petites cartes évoquant des souvenirs (photo, voix, récit, date) qui flottent lentement. Le slider de captures d'écran actuel reste inchangé, en dessous.

## Ce que verra le visiteur

- Sur desktop : 4 vignettes positionnées de part et d'autre du titre et du sous-titre, légèrement inclinées, avec une animation de flottement très lente (quelques pixels, en boucle) et une apparition en fondu au chargement.
  - Vignette photo : miniature façon polaroïd avec une légende courte ("Été 1998, la maison de Mamie").
  - Vignette voix : forme d'onde stylisée avec une durée ("La voix de Papy — 2:14").
  - Vignette récit : quelques lignes de texte tronquées avec un titre ("Notre premier voyage").
  - Vignette date : puce de chronologie ("12 juin 1975").
- Sur mobile : vignettes masquées (l'espace est déjà dense) — le hero reste identique à aujourd'hui.
- Accessibilité : couche purement décorative (`aria-hidden`), non cliquable, et animations désactivées si l'utilisateur préfère les mouvements réduits.

## Détails techniques

- Nouveau composant `src/components/landing/v3/HeroFloatingCards.tsx`, rendu en position absolue dans `HeroSectionV3.tsx` juste après le fond dégradé, avec `pointer-events-none` et un z-index sous le contenu texte.
- Framer Motion (déjà utilisé dans le hero) : `initial/animate` pour le fondu, boucle `y`/`rotate` infinie, court-circuitée via `useReducedMotion`.
- Couleurs uniquement via les tokens existants du hero (`hsl(var(--gold))`, blanc translucide, `hsl(215 50% 14%)`), verre dépoli `backdrop-blur` et bordures dorées comme le reste du hero.
- Textes des vignettes ajoutés sous `v3.hero.floatingCards.*` dans les 7 fichiers `public/locales/*/landing.json` (fr, en, es, it, pt, ko, zh), en respectant le vouvoiement et la terminologie « souvenirs ».
- Aucune image externe : la vignette photo utilise un dégradé/placeholder stylisé pour ne pas alourdir le LCP.
- Vérification visuelle par capture d'écran du hero en desktop et mobile après implémentation.
