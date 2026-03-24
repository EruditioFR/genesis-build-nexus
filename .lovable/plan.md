

## Chargement progressif : ghost nodes + expansion dynamique

### Principe

Au lieu de rendre tous les nœuds d'un coup, limiter l'affichage a 3 generations depuis le root. Les nœuds a la frontiere (generation 4) deviennent des "ghost nodes" cliquables. Un clic sur un ghost node l'expanse de +2 generations avec animation.

### Fichiers modifies

#### 1. `src/components/familyTree/nodes/PersonFlowNode.tsx`

- Lire `data.isGhost` dans `PersonNodeData`
- Si `isGhost === true` :
  - Opacite globale 0.35, bordure en `border-dashed`, pas de hover effect
  - Afficher un badge `+` (icone `ChevronDown` ou `Plus`) en bas du noeud pour indiquer l'expansion possible
  - Le clic remonte normalement via React Flow `onNodeClick`

#### 2. `src/components/familyTree/TreeVisualization.tsx`

**Types** :
- Ajouter `isGhost: boolean` a `PersonNodeData`
- Ajouter `maxVisibleGenerations` et `expandedNodeIds` aux props de `TreeVisualizationProps`
- Ajouter callback `onExpandGhost: (personId: string) => void`

**Layout (`layoutUnified`)** :
- Apres le BFS ascendant/descendant existant qui produit `activeIds`, ajouter une passe de filtrage par profondeur :
  - Calculer `distance` de chaque noeud par rapport au root (en nombre de generations)
  - Aussi calculer la distance par rapport a chaque noeud dans `expandedNodeIds`
  - Un noeud est **visible** si `min(distances) <= maxVisibleGenerations`
  - Un noeud est **ghost** si `min(distances) == maxVisibleGenerations + 1`
  - Un noeud est **exclu** si `min(distances) > maxVisibleGenerations + 1`
- Passer `isGhost` dans les donnees du noeud React Flow

**Gestion du clic** :
- Dans `onNodeClick`, si `node.data.isGhost` → appeler `onExpandGhost(node.data.person.id)` au lieu de `onPersonClick`
- Puis `fitView` anime (duration 600ms) centre sur le noeud clique

#### 3. `src/pages/FamilyTreePage.tsx`

**Nouveaux states** :
- `expandedNodeIds: Set<string>` (initialement vide)
- `maxVisibleGenerations = 3` (constante)

**Handler `handleExpandGhost`** :
1. Ajouter le `personId` dans `expandedNodeIds`
2. Le state change declenche un re-render de `TreeVisualization` qui recalcule le layout avec les nœuds nouvellement visibles

**Props passes a `TreeVisualization`** :
- `maxVisibleGenerations={3}`
- `expandedNodeIds={expandedNodeIds}`
- `onExpandGhost={handleExpandGhost}`

**Desactivation pour petits arbres** : si `persons.length < LARGE_TREE_THRESHOLD` et `viewMode === 'hourglass'`, passer `maxVisibleGenerations={Infinity}` (pas de ghost nodes).

#### 4. Animation d'apparition

Les nœuds qui passent de ghost/exclu a visible beneficient deja de `motion.div initial={{ opacity: 0, scale: 0.9 }}` dans `PersonFlowNode`. Pour un effet stagger, ajouter un `transition.delay` base sur la distance au noeud expanse : `delay = (distance - 1) * 0.08s`. Passer `data.appearDelay` dans `PersonNodeData`.

### Comportement attendu

1. Chargement → root + 3 generations, generation 4 = ghost nodes (semi-transparents, border dashed, badge "+")
2. Clic ghost → ce noeud devient normal + 2 generations supplementaires apparaissent en cascade (stagger 80ms/gen)
3. `fitView` anime centre sur le noeud expanse
4. Les nouvelles frontieres sont des ghost nodes cliquables
5. Petits arbres (< 500) en mode sablier : pas de ghost nodes, tout est affiche

