# Hero : accent terracotta pour une meilleure lisibilité

Le doré actuel (`--gold`, teinte sombre) placé sur le fond navy du hero offre un contraste faible, ce qui rend les textes importants difficiles à lire. On remplace cet accent par un terracotta chaud et lumineux, uniquement dans le hero de l'accueil.

## Ce qui change (hero uniquement)

- **Cartouche tarif** : le prix passe en terracotta clair, texte parfaitement lisible sur le verre dépoli.
- **Titre H1** : le mot mis en avant passe du doré au terracotta lumineux.
- **Bouton CTA principal** : fond terracotta, texte blanc, ombre chaude — plus visible et plus contrasté que le doré actuel.
- **Ligne de confiance** (bouclier / confidentialité / cadenas) : icônes en terracotta clair.
- **Visuel produit** : halo, liseré de cadre et badges flottants passent en terracotta, pour rester cohérents.
- **Fond décoratif** : le dégradé radial doré devient terracotta discret.

Palette retenue : navy `#0f1b3d` / `#22406b` en fond, accent terracotta `#e8825a`, variante claire `#f6c9a8` pour les petits textes et icônes.

## Ce qui ne change pas

- Le reste du site (blog, tarifs, en-tête, pied de page, tableau de bord) conserve l'identité dorée actuelle.
- Aucun texte, aucune traduction, aucune logique métier n'est modifié.
- La structure et l'espacement du hero restent identiques (le correctif de padding mobile est conservé).

## Détails techniques

- Ajout de tokens `--hero-accent` (`18 76% 63%`) et `--hero-accent-soft` (`22 80% 82%`) dans `src/index.css`, scopés au thème clair.
- Remplacement des occurrences `hsl(var(--gold))` par ces tokens dans `src/components/landing/v3/HeroSectionV3.tsx` uniquement — pas de couleur codée en dur dans le composant.
- Vérification du rendu par capture d'écran mobile (390x844) et desktop après application.
