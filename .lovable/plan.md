

## Plan : Améliorations complètes de l'arbre généalogique

### 1. Corriger les bugs logiques

**A. Calcul réel du nombre de générations** (`useFamilyTree.tsx`)
- Remplacer le `generationsCount: 1 // TODO` par un algorithme BFS réel : charger les relations parent-enfant, construire un graphe orienté, calculer la profondeur maximale depuis les personnes sans parents (ancêtres racine).

**B. Ajouter `deleteUnion` et `deleteRelationship`** (`useFamilyTree.tsx`)
- Créer `deleteUnion(unionId: string)` : supprime l'union dans `family_unions` + met à null les `union_id` dans `family_parent_child` qui référencent cette union.
- Créer `deleteRelationship(relationshipId: string)` : supprime le lien parent-enfant dans `family_parent_child`.
- Exposer les deux fonctions dans le return du hook et les câbler dans `PersonDetailPanel.tsx` (boutons "Supprimer" sur chaque relation et union, avec confirmation).

---

### 2. Internationaliser tous les labels codés en dur

**A. `getGenerationLabel`** (`TreeVisualization.tsx`, ligne 728)
- Remplacer les labels français ("Vous", "Enfants", "Parents", etc.) par des clés i18n. Comme `getGenerationLabel` est une fonction pure hors composant, passer le `t` en paramètre ou déplacer la logique dans un hook.

**B. Ghost labels** (`TreeVisualization.tsx`, lignes 615-619)
- Remplacer `+${ghostCount} ancêtres` / `+${ghostCount} descendants` par des clés i18n `familyTree:ghost.ancestors` / `familyTree:ghost.descendants`.

**C. Toasts dans `useFamilyTree.tsx`**
- Remplacer les ~20 messages toast français codés en dur par des appels `t(...)` du namespace `familyTree`. Comme `useFamilyTree` n'est pas un composant React mais un hook, on peut y utiliser `useTranslation`.

**D. Fichiers de traduction**
- Ajouter les clés manquantes dans `familyTree.json` pour les 7 langues (fr, en, es, pt, it, ko, zh) :
  - `generation.self`, `generation.children`, `generation.parents`, `generation.grandchildren`, `generation.grandparents`, `generation.greatGrandchildren`, `generation.greatGrandparents`, `generation.plus`, `generation.minus`
  - `ghost.ancestors`, `ghost.descendants`
  - `toast.personAdded`, `toast.personUpdated`, `toast.personDeleted`, `toast.relationAdded`, `toast.unionAdded`, `toast.unionUpdated`, `toast.unionDeleted`, `toast.relationDeleted`, `toast.treeCreated`, `toast.treeDeleted`, `toast.merged`, etc.

---

### 3. Exploiter les champs DB inutilisés

**A. `PersonDetailPanel.tsx`** — onglet "Info" en mode édition
- Ajouter les champs : `burial_date` (input date), `burial_place` (input texte), `residences` (liste dynamique : lieu + période from/to, bouton ajouter/supprimer).
- En mode lecture, afficher ces informations si renseignées.

**B. `useFamilyTree.tsx` — `updatePerson`**
- Inclure `burial_date`, `burial_place`, `residences` dans l'objet d'update (actuellement omis).

**C. `AddPersonDialog.tsx`**
- Ajouter un volet "Plus d'informations" pliable avec `burial_date`, `burial_place`, `residences`.

**D. Traductions**
- Ajouter les clés `detail.fields.burialDate`, `detail.fields.burialPlace`, `detail.fields.residences`, `detail.fields.residencePlace`, `detail.fields.residenceFrom`, `detail.fields.residenceTo`, `detail.fields.addResidence` dans les 7 langues.

---

### Fichiers impactés

| Fichier | Modifications |
|---|---|
| `src/hooks/useFamilyTree.tsx` | `deleteUnion`, `deleteRelationship`, `getTreeStatistics` fix, `updatePerson` champs manquants, i18n toasts |
| `src/components/familyTree/TreeVisualization.tsx` | i18n `getGenerationLabel` + ghost labels |
| `src/components/familyTree/PersonDetailPanel.tsx` | UI burial/residences, boutons delete union/relation |
| `src/components/familyTree/AddPersonDialog.tsx` | Champs burial/residences |
| `public/locales/*/familyTree.json` (×7) | Nouvelles clés traduction |

### Estimation

~8 fichiers modifiés, ~300 lignes ajoutées/modifiées. Pas de migration DB nécessaire (les colonnes existent déjà).

