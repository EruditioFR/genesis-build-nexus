

# Chronologie Ludique — Frise Cosmique par Décennie

## Objectif

Remplacer la grille statique actuelle des décennies (`DecadeGrid.tsx`) par une **frise chronologique horizontale immersive** où chaque décennie est représentée par un "monde" autour duquel **gravitent les médias** (photos, vidéos, lieux) extraits des souvenirs de cette époque.

## Concept visuel

```text
        ┌─────────────────── FRISE HORIZONTALE (scroll) ───────────────────┐
        
         ✨ photo                    🎥 vidéo            📍 Paris
              ↘                      ↗                       ↘
                ╔═══════╗       ╔═══════╗            ╔═══════╗
                ║ 1970s ║───────║ 1980s ║────────────║ 1990s ║
                ╚═══════╝       ╚═══════╝            ╚═══════╝
              ↗     ↑               ↘                     ↗
        📍 Lyon   12 souvenirs     ✨ photo          🎥 vidéo
        
        ←━━━━━━━━━━━━━━━ ligne du temps animée ━━━━━━━━━━━━━━━━→
```

Chaque "planète décennie" :
- **Cœur central** : grosse pastille avec le label `1980's`, le compteur de souvenirs et un dégradé propre à la décennie (palette existante conservée).
- **Satellites en orbite** : 4 à 6 vignettes (photos miniatures, icône vidéo, pin de lieu) qui **flottent en orbite circulaire** autour de la pastille, animées en continu (rotation lente + léger bobbing).
- **Ligne de temps** : trait horizontal continu reliant toutes les décennies, avec marqueurs et points lumineux animés.
- **Clic sur la pastille** → ouvre le `DecadeModal` existant (pas de changement de comportement).
- **Clic sur un satellite** → ouvre directement le souvenir correspondant.

## Comportements & ergonomie

- **Mobile (≤ 640px)** : frise verticale empilée, orbites plus petites (rayon réduit), 3 satellites max, animations ralenties pour ne pas surcharger.
- **Desktop** : frise horizontale scrollable avec ancrages, 5–6 satellites, parallax léger au scroll.
- **Préférence `prefers-reduced-motion`** : les orbites se figent (les satellites restent disposés autour mais sans rotation).
- **Performance** : satellites limités, vignettes déjà chargées via `capsuleMedias`/`allMedias`. Les "lieux" sont extraits depuis `metadata` ou tags géographiques des souvenirs (fallback : icône lieu générique si aucune donnée).

## Fichiers à créer

1. **`src/components/timeline/DecadePlanet.tsx`** — composant unique d'une décennie : noyau central + satellites en orbite (framer-motion `animate` boucle infinie).
2. **`src/components/timeline/CosmicTimeline.tsx`** — conteneur de toutes les `DecadePlanet`, gère la ligne de temps SVG, le scroll horizontal/vertical responsive.
3. **`src/components/timeline/OrbitingSatellite.tsx`** — vignette satellite (photo, video, place) avec son animation orbitale propre (angle de départ, rayon, vitesse).

## Fichiers à modifier

1. **`src/pages/Timeline.tsx`**
   - Remplacer `<DecadeGrid />` par `<CosmicTimeline />`.
   - Étendre l'agrégation `decadeThumbnails` pour produire un objet `decadeSatellites: Record<string, Satellite[]>` contenant `{ type: 'photo'|'video'|'place', url?, label?, capsuleId }` issu des souvenirs filtrés (réutilise `allMedias` + extraction des lieux depuis `capsule.metadata`/`capsule.tags`).
   - Passer aussi `onSatelliteClick(capsuleId)` qui navigue vers `/capsules/:id`.

2. **`src/components/timeline/DecadeGrid.tsx`** — conservé temporairement comme fallback, sera supprimé après validation.

## Détails techniques

- **Animation orbitale** : `motion.div` avec `animate={{ rotate: 360 }}` sur le wrapper d'orbite, contre-rotation sur la vignette pour qu'elle reste droite. Durées 20–40s (lente) pour effet "gravitation".
- **Palette** : on garde les `decadeColors` existantes de `DecadeGrid.tsx` (amber, rose, purple, teal, etc.) pour cohérence.
- **Satellites - sources de données** :
  - Photos/vidéos → `allMedias` filtré par décennie.
  - Lieux → champs `metadata.location`, `metadata.place` ou tags des `capsules` du décennie (extraction simple, premier lieu unique).
- **i18n** : ajout de clés `timeline.cosmic.satellite.photo`, `.video`, `.place`, `.openMemory` dans les 8 fichiers `dashboard.json`.
- **Accessibilité** : chaque satellite est un `<button>` avec `aria-label` descriptif ; la pastille décennie conserve son `aria-label` actuel.

## Hors périmètre

- Pas de changement aux modales `DecadeModal` / `YearModal` (déjà bien).
- Pas de modification des filtres ou de l'en-tête.
- Pas de nouvelle requête DB — on réutilise les données déjà chargées.

