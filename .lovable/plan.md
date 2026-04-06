

## Plan : Carte interactive des lieux de naissance

### Concept

Ajouter un bouton "Carte" dans la toolbar de l'arbre généalogique qui ouvre un dialog plein écran affichant une carte Leaflet avec un marqueur pour chaque membre ayant un lieu de naissance. Les lieux sans coordonnées sont géocodés à la volée via Nominatim (gratuit, côté client) puis cachés en base.

### Fichiers à créer

**1. `src/lib/geocoding.ts`** — Utilitaire de géocodage Nominatim
- File d'attente avec délai 1.1s entre requêtes (rate-limit Nominatim)
- Cache mémoire pour éviter les appels répétés dans la même session
- Fonction `geocodeBirthPlace(place: string)` → `{ lat, lng } | null`
- Fonction `geocodeAndCachePersons(persons, supabaseClient)` : pour chaque personne ayant `birth_place` mais pas de coordonnées, géocode puis met à jour `birth_place_lat/lng` en base

**2. `src/components/familyTree/BirthPlaceMap.tsx`** — Composant carte
- Dialog plein écran avec carte Leaflet (tiles OpenStreetMap)
- Clustering via `react-leaflet-cluster` pour les marqueurs proches
- Marqueurs colorés : bleu (homme), rose (femme), gris (autre/inconnu)
- Popup au clic : nom complet, dates, lieu
- `fitBounds` automatique pour englober tous les marqueurs
- Indicateur de progression du géocodage (spinner + "X/Y lieux géocodés")
- Message vide si aucun lieu renseigné

### Fichiers à modifier

**3. `src/pages/FamilyTreePage.tsx`**
- Import du composant `BirthPlaceMap`
- Ajout d'un state `showMap` et d'un bouton MapPin dans la toolbar
- Passer la liste des personnes au composant carte

**4. `public/locales/*/familyTree.json` (7 langues)**
- Nouvelles clés : `map.title`, `map.noLocations`, `map.personsLocated`, `map.geocoding`

### Dépendances à installer

- `leaflet` + `react-leaflet` + `@types/leaflet` + `react-leaflet-cluster`

### Détails techniques

- Nominatim est appelé uniquement côté client (navigateur), zéro coût cloud
- Les coordonnées sont persistées en base via un simple `UPDATE` sur `family_persons` (colonnes `birth_place_lat/lng` existantes), ce qui fait que le géocodage ne se produit qu'une fois par lieu
- Rate-limit : 1 requête/seconde via une queue séquentielle avec `setTimeout`
- Pas de migration DB nécessaire (les colonnes lat/lng existent déjà)

### Estimation

~2 fichiers créés, ~1 fichier modifié, ~7 fichiers de traduction mis à jour. ~300 lignes ajoutées.

