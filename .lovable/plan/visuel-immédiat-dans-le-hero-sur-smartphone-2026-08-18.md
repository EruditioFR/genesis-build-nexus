# Visuel immédiat dans le hero sur smartphone

Sur mobile, le premier écran ne contient aujourd'hui que du texte et les boutons : le slider produit n'apparaît qu'après un long défilement, et ses images sont chargées en différé. On ajoute une image visible dès le chargement, sans attendre le slider.

## Ce que verra le visiteur (mobile uniquement)

- Une bande visuelle compacte (environ 170 px de haut, coins arrondis, fine bordure dorée) insérée entre le sous-titre et les boutons d'action, donc visible dès l'ouverture de la page.
- Photo chaleureuse déjà présente dans le projet (`src/assets/hero-slides/famille`/`anniversaire`), avec un léger voile dégradé bleu nuit pour garder la lisibilité et l'harmonie du hero.
- Une courte légende en surimpression rappelant la promesse (« Vos souvenirs de famille, réunis et protégés »), traduite dans les 7 langues.
- Aucun changement sur desktop, et le slider de captures d'écran reste identique en dessous.

## Performance

- Image chargée en priorité (`loading="eager"`, `fetchpriority="high"`, `decoding="async"`) avec largeur/hauteur fixées pour éviter tout décalage de mise en page.
- Déclinaison légère de la photo générée en WebP redimensionné (~600 px de large) pour ne pas dégrader le LCP mobile.
- Les images du slider restent en `loading="lazy"` : elles ne concurrencent pas le nouveau visuel.

## Détails techniques

- Modification de `src/components/landing/v3/HeroSectionV3.tsx` : nouveau bloc `sm:hidden` placé après le paragraphe de sous-titre, avant le bloc des CTA, avec une apparition en fondu courte (Framer Motion, désactivée si mouvements réduits).
- Couleurs et bordures via les tokens du hero existants (`hsl(var(--gold))`, blanc translucide) — pas de couleur en dur.
- Nouvelle clé `v3.hero.mobileVisual.caption` (et `alt`) ajoutée dans les 7 fichiers `public/locales/*/landing.json`, vouvoiement et terminologie « souvenirs » respectés.
- Vérification par capture d'écran en viewport mobile après implémentation.
