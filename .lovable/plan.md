

## Plan: Navigation intuitive entre branches et reperage dans l'arbre

### Probleme
L'utilisateur se perd dans un arbre de 105+ personnes. Pas de fil d'Ariane, pas de moyen rapide de sauter d'une branche a l'autre, et les labels de generation sont statiques et peu utiles.

### Solutions proposees

#### 1. Fil d'Ariane (Breadcrumb) — position de la personne selectionnee
Un bandeau horizontal en haut de la zone de visualisation montrant le chemin genealogique depuis la racine jusqu'a la personne selectionnee :

```text
Jean Dupont > Marie Dupont > Pierre Martin > [Vous etes ici]
```

Chaque element est cliquable pour centrer + selectionner cette personne. Affiché uniquement quand une personne est selectionnee.

**Fichier** : `src/components/familyTree/TreeBreadcrumb.tsx` (nouveau)
- Calcule le chemin ascendant depuis la personne selectionnee vers la racine via `relationships`
- Affiche les ancetres en ordre, chacun cliquable
- Badge "Vous" sur le root person

#### 2. Navigation rapide par branches dans le panneau de detail
Ameliorer le panneau lateral (`PersonDetailPanel`) pour que les liens familiaux (parents, conjoints, enfants) soient tous des boutons qui centrent et selectionnent la personne cible. Deja partiellement en place via `onPersonClick` — s'assurer que ca fonctionne pour TOUS les liens du panneau.

#### 3. Indicateur visuel "Vous etes ici" sur la carte
Ajouter un marqueur visuel distinct (pin/etoile) sur la carte de la personne racine de l'arbre pour que l'utilisateur sache toujours ou est le point de reference.

**Fichier** : `src/components/familyTree/TreeVisualization.tsx`
- Ajouter une prop `rootPersonId` au `TreePersonCard` et afficher un petit badge "Racine" ou icone Home

#### 4. Bouton "Retour a la racine"
Un bouton flottant toujours visible qui recentre sur la personne racine en un clic.

**Fichier** : `src/pages/FamilyTreePage.tsx`
- Ajouter un bouton flottant en bas a gauche avec icone Home
- Clic → `centerOnPerson(tree.root_person_id)` + selection

#### 5. Highlight de la branche active
Quand une personne est selectionnee, mettre en surbrillance la branche (ancetres + descendants directs) pour qu'elle ressorte visuellement du reste de l'arbre.

**Fichier** : `src/components/familyTree/TreeVisualization.tsx`
- Calculer les IDs de la branche active (ancetres + descendants de la personne selectionnee)
- Appliquer une opacite reduite aux cartes et connexions hors branche
- Les cartes de la branche restent a pleine opacite

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/familyTree/TreeBreadcrumb.tsx` | **Nouveau** — fil d'Ariane genealogique cliquable |
| `src/components/familyTree/TreeVisualization.tsx` | Badge racine sur la carte root, highlight de la branche active (opacite reduite hors branche) |
| `src/pages/FamilyTreePage.tsx` | Integration du breadcrumb, bouton "retour racine" flottant, passage des props de branche active |
| `public/locales/*/familyTree.json` | Cles i18n : `breadcrumb.root`, `navigation.backToRoot` |

