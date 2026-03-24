

## Optimisation des performances de l'arbre genealogique

### Diagnostic

L'arbre contient ~8400 personnes et ~7200 relations. Voici les goulots d'etranglement identifies :

1. **Layout recalcule a chaque clic** : `buildFlowElements` est dans un `useMemo` qui depend de `selectedPersonId`, `highlightedPersonId`, et `activeBranchIds`. Chaque selection de personne relance le layout complet sur 8400 noeuds, alors que seules les proprietes visuelles changent (pas les positions).

2. **`expandedNodeIds = new Set()`** dans les props par defaut cree un nouvel objet a chaque render, invalidant le `useMemo`.

3. **`activeBranchIds`** recalcule avec des `.filter()` lineaires sur toutes les relations a chaque changement de selection.

4. **Framer Motion** sur chaque noeud (`motion.div` avec `initial`/`animate`) ajoute un cout significatif pour 200+ noeuds animes simultanement.

5. **Serialisation des positions** dans le `useEffect` (`positionData.map(...).join(',')`) a chaque render.

### Plan d'optimisation

#### 1. Separer layout et etat visuel (impact majeur)

**Fichier** : `src/components/familyTree/TreeVisualization.tsx`

Scinder le `useMemo` en deux etapes :
- **useMemo 1 (layout)** : depend uniquement de `persons`, `relationships`, `unions`, `rootPersonId`, `viewMode`, `maxVisibleGenerations`, `expandedNodeIds` → produit les positions et la liste des noeuds visibles/ghost
- **useMemo 2 (nodes visuels)** : depend du layout + `selectedPersonId`, `highlightedPersonId`, `activeBranchIds` → met a jour uniquement les proprietes `data` des noeuds sans recalculer les positions

Cela evite de relancer le BFS + layout pour 8400 personnes a chaque clic.

#### 2. Stabiliser la reference `expandedNodeIds` (impact moyen)

**Fichier** : `src/components/familyTree/TreeVisualization.tsx`

Remplacer `expandedNodeIds = new Set()` par une constante stable :
```typescript
const EMPTY_SET = new Set<string>();
// Dans les props par defaut :
expandedNodeIds = EMPTY_SET,
```

#### 3. Remplacer Framer Motion par des transitions CSS (impact majeur)

**Fichier** : `src/components/familyTree/nodes/PersonFlowNode.tsx`

Remplacer `motion.div` par un `div` classique avec `transition` CSS et `style={{ opacity, transform }}`. Cela elimine le surcout de Framer Motion sur 200+ noeuds. L'animation d'apparition sera geree via un `setTimeout` + changement de classe CSS.

#### 4. Optimiser `activeBranchIds` avec des Maps indexees (impact moyen)

**Fichier** : `src/pages/FamilyTreePage.tsx`

Pre-construire des index `Map<string, string[]>` pour `parentOf` et `childOf` a partir de `relationships` (via un `useMemo` separe), au lieu de faire des `.filter()` lineaires a chaque calcul de branche.

#### 5. Debounce du report de positions (impact mineur)

**Fichier** : `src/components/familyTree/TreeVisualization.tsx`

Supprimer la serialisation string des positions. Utiliser un `useRef` pour comparer par longueur + premier/dernier element, ou simplement reporter les positions uniquement quand le layout change (pas quand la selection change).

### Resultats attendus

- **Clic sur un noeud** : de ~500-1000ms a <50ms (plus de recalcul de layout)
- **Changement de mode de vue** : inchange (le layout doit etre recalcule)
- **Rendu initial** : ~30% plus rapide (pas de Framer Motion overhead)

