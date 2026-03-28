

# Correction : Arbre vide après import GEDCOM

## Problème identifié

Après l'import GEDCOM, les personnes apparaissent dans la liste mais l'arbre reste vide. Deux causes principales :

1. **Pas de `root_person_id` défini après l'import** — L'import crée les personnes et relations mais ne désigne jamais de personne racine sur l'arbre. Sans racine, la visualisation en mode "ascendant" (mode par défaut pour les grands arbres) ne sait pas d'où partir.

2. **`loadTree` ne gère pas les grands arbres** — Après import, `loadTree` recharge toutes les données mais ne bascule pas vers le chargement par branche (`fetchBranch`) pour les arbres volumineux, contrairement au code d'initialisation. Cela peut causer des problèmes de rendu.

## Plan de correction

### 1. Définir automatiquement une personne racine après l'import GEDCOM

Dans `src/hooks/useFamilyTree.tsx`, à la fin de `importFromGedcom` (après les 3 phases d'insertion), ajouter la logique :
- Récupérer l'ID DB de la première personne importée (`gedcomToDbId` du premier individu)
- Mettre à jour `family_trees.root_person_id` avec cet ID si le champ est actuellement `null`

### 2. Améliorer `loadTree` pour les grands arbres

Dans `src/pages/FamilyTreePage.tsx`, modifier `loadTree` pour reproduire la logique d'initialisation :
- Récupérer le count total des personnes
- Si l'arbre a un `root_person_id` ET plus de 500 personnes → utiliser `fetchBranch` au lieu de `fetchTree`
- Mettre à jour `totalPersonsCount`

### 3. Rafraîchir l'état `tree` après import

Dans `handleGedcomImport`, s'assurer que l'objet `tree` en state est mis à jour avec le nouveau `root_person_id` après le rechargement via `loadTree`.

## Fichiers modifiés

- `src/hooks/useFamilyTree.tsx` — Ajout de la mise à jour `root_person_id` en fin d'import
- `src/pages/FamilyTreePage.tsx` — Refonte de `loadTree` pour gérer les grands arbres comme à l'initialisation

