

## Rendre les tarifs plus lisibles

### Probleme
Le bloc prix est dense : le badge promo, le prix barré, le prix promo, le "/mois" et le texte "puis X€/mois" sont tous entassés avec peu d'espacement et des tailles trop proches, rendant la lecture difficile.

### Modifications dans `PricingSection.tsx`

1. **Séparer visuellement prix barré et prix promo** : passer de `flex items-baseline gap-1` à `flex flex-col items-center gap-1` pour empiler le prix barré au-dessus du prix promo au lieu de les mettre côte à côte

2. **Agrandir le prix principal** : augmenter la taille du prix promo/actuel à `text-4xl sm:text-5xl` pour qu'il domine visuellement

3. **Réduire et styliser le prix barré** : le passer en `text-base sm:text-lg` avec `opacity-60` pour un effet plus discret

4. **Mettre "/mois" sur sa propre ligne** : sortir le "/mois" du flex des prix et l'afficher en dessous en `text-sm text-muted-foreground` avec un `mt-1`

5. **Espacer le texte "puis X€/mois"** : ajouter `mt-2` au lieu de `mt-1` et passer en `text-sm` (au lieu de `text-xs`) pour plus de lisibilité

6. **Badge promo** : augmenter légèrement la taille à `text-sm` et ajouter `mb-4` pour plus de respiration avant le prix

### Resultat attendu
Chaque information tarifaire occupe son propre espace visuel : badge promo en haut, prix barré discret, gros prix promo dominant, période en dessous, et mention post-promo bien séparée.

