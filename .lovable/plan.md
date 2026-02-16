

# Harmoniser les couleurs des souvenirs avec la charte graphique

## Probleme identifie

La palette du projet est "Bleu nuit, Or chaud, Terracotta, Gris perle" (definie dans `index.css`), mais les couleurs associees aux types de souvenirs utilisent des couleurs Tailwind generiques qui ne s'integrent pas :

| Type | CapsuleCardVisuals | TimelineCapsuleCard | YearModal |
|------|-------------------|---------------------|-----------|
| Texte | sky-500 | blue-500 | blue-500 |
| Photo | amber-500 | emerald-500 | emerald-500 |
| Video | violet-500 | purple-500 | purple-500 |
| Audio | orange-500 | orange-500 | orange-500 |
| Mixte | emerald-500 | pink-500 | pink-500 |

Trois problemes :
1. Les couleurs ne respectent pas la charte (bleu nuit, or, terracotta, perle)
2. Les definitions sont incoherentes entre les fichiers
3. Trop de teintes vives differentes creent un effet "arc-en-ciel" peu harmonieux

## Solution

Adopter une palette unique basee sur les tokens du design system, avec des teintes sobres et coherentes :

| Type | Nouvelle couleur | Justification |
|------|-----------------|---------------|
| Texte | `--secondary` (or chaud) | L'ecriture evoque le parchemin, la chaleur |
| Photo | `--primary` (bleu nuit) | Couleur principale sobre et elegante |
| Video | `--accent` (terracotta) | Couleur d'accent vive mais douce |
| Audio | `--navy-light` (bleu clair) | Variante du bleu, distingue de photo |
| Mixte | `--gold-light` (or clair) | Variante de l'or, distingue de texte |

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/capsule/CapsuleCardVisuals.tsx` | Mettre a jour `getTypeStyles` avec les couleurs harmonisees, ajuster les fallback visuels (audio wave bg, text bg) |
| `src/components/timeline/TimelineCapsuleCard.tsx` | Aligner `capsuleTypeConfig` sur les memes couleurs |
| `src/components/timeline/YearModal.tsx` | Aligner `capsuleTypeConfig` sur les memes couleurs |

## Detail technique

Les couleurs utiliseront les variables CSS du design system via des classes Tailwind personnalisees ou les tokens HSL existants. Par exemple :

```text
getTypeStyles:
  photo  -> bg-[hsl(var(--primary))]
  video  -> bg-[hsl(var(--accent))]
  text   -> bg-[hsl(var(--secondary))]
  audio  -> bg-[hsl(var(--navy-light))]  (215 40% 38%)
  mixed  -> bg-[hsl(var(--gold-light))]  (38 40% 60%)
```

Les backgrounds de fallback (audio wave, text quote) seront aussi ajustes pour utiliser les memes teintes en version legere.

