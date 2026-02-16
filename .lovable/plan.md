

# Nouvelles couleurs complementaires pour les types de souvenirs

## Constat

Actuellement, les types de souvenirs reutilisent les couleurs principales du site (bleu nuit, or chaud, terracotta). Cela les rend peu distinctifs et "fond dans le decor". L'objectif est de trouver des couleurs **complementaires** qui s'harmonisent avec la charte sans la repeter.

## Charte actuelle du site

| Token | Teinte | HSL |
|-------|--------|-----|
| Primary (Bleu nuit) | 215 degres | 215 50% 23% |
| Secondary (Or chaud) | 38 degres | 38 45% 42% |
| Accent (Terracotta) | 16 degres | 16 55% 55% |

## Nouvelle palette complementaire proposee

En utilisant les principes de complementarite et de triades sur le cercle chromatique :

| Type | Couleur | HSL | Justification |
|------|---------|-----|---------------|
| Photo | Sauge / Vert doux | 155 35% 42% | Complementaire du terracotta (16 degres), evoque la nature, les paysages |
| Video | Prune / Mauve | 280 30% 45% | Complementaire de l'or (38 degres), evoque le cinema, le spectacle |
| Audio | Sarcelle / Teal | 190 40% 40% | Complementaire chaud du terracotta, evoque la profondeur sonore |
| Texte | Rose ancien | 345 30% 52% | Triadique du bleu nuit, evoque le papier ancien, l'ecriture |
| Mixte | Ardoise / Slate | 230 20% 50% | Analogue adouci du bleu nuit, neutre pour le "melange" |

Ces teintes sont **desaturees** (30-40% de saturation) pour rester sobres et elegantes, en accord avec l'esprit du site.

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/index.css` | Ajouter 5 nouveaux tokens CSS (`--capsule-photo`, `--capsule-video`, etc.) dans `:root` et `.dark` |
| `src/components/capsule/CapsuleCardVisuals.tsx` | Mettre a jour `getTypeStyles` pour utiliser les nouveaux tokens |
| `src/components/timeline/TimelineCapsuleCard.tsx` | Aligner `capsuleTypeConfig` sur les nouveaux tokens |
| `src/components/timeline/YearModal.tsx` | Aligner `capsuleTypeConfig` sur les nouveaux tokens |

## Detail technique

Nouveaux tokens CSS dans `index.css` :

```text
:root {
  --capsule-photo: 155 35% 42%;
  --capsule-video: 280 30% 45%;
  --capsule-audio: 190 40% 40%;
  --capsule-text: 345 30% 52%;
  --capsule-mixed: 230 20% 50%;
}
```

Utilisation dans les composants :

```text
getTypeStyles:
  photo -> bg-[hsl(var(--capsule-photo))]  text-white
  video -> bg-[hsl(var(--capsule-video))]  text-white
  audio -> bg-[hsl(var(--capsule-audio))]  text-white
  text  -> bg-[hsl(var(--capsule-text))]   text-white
  mixed -> bg-[hsl(var(--capsule-mixed))]  text-white
```

Les backgrounds de fallback (audio wave, text quote) utiliseront aussi ces tokens en version legere (opacity 10-15%).

## Variantes mode sombre

Les tokens seront legerement ajustes en mode sombre pour maintenir la lisibilite (luminosite augmentee de ~10%).

