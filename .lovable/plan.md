

## Rendre le Hero V2 plus lumineux

### Probleme actuel
Les deux overlays sombres combinés (`from-black/65 via-black/40 to-black/20` + `from-black/50 via-transparent to-black/20`) assombrissent fortement les aquarelles. Le résultat est lisible mais "triste".

### Approche
Alléger les overlays tout en gardant le contraste texte/fond grâce à un `text-shadow` plus marqué sur les textes et un léger fond flou derrière le bloc de contenu.

### Modifications dans `HeroSectionV2.tsx`

1. **Réduire les overlays** :
   - Overlay horizontal : `from-black/40 via-black/20 to-transparent` (au lieu de 65/40/20)
   - Overlay vertical : `from-black/35 via-transparent to-black/10` (au lieu de 50/transparent/20)

2. **Ajouter un fond semi-transparent flou derrière le bloc texte** :
   - Wraper le `max-w-3xl` dans un `div` avec `bg-black/15 backdrop-blur-[2px] rounded-3xl px-8 py-10` pour créer un "glass card" subtil qui isole le texte sans noircir toute l'image

3. **Renforcer les text-shadows** :
   - Sur le `h1` : ajouter un style inline `textShadow: '0 2px 12px rgba(0,0,0,0.5)'`
   - Sur le subtitle : `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

4. **Boutons de navigation** : alléger de `bg-black/30` a `bg-white/20 hover:bg-white/35` pour coller au ton lumineux

5. **Category pill** : passer de `bg-white/15` a `bg-white/25` pour plus de visibilite

### Resultat attendu
Les aquarelles sont nettement plus visibles, l'ambiance est chaleureuse et lumineuse. Le texte reste parfaitement lisible grace au glass effect et aux text-shadows.

