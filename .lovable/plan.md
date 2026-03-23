

## Plan: Refonte complete de la visualisation de l'arbre genealogique

### Diagnostic des problemes actuels

1. **Algorithme de layout naif** : recursion simple qui ne gere pas les cas complexes (mariages multiples, demi-freres, familles recomposees)
2. **Concept de "famille" absent** : les couples ne sont pas traites comme une unite atomique de positionnement
3. **Chevauchements** : le decalage des descendants est fragile et casse avec les arbres larges
4. **Composants deconnectes** : traites en afterthought, places arbitrairement a droite
5. **Vue ascendante** : generation de base hardcodee a 3
6. **Requetes sans filtre** : `family_parent_child` et `family_unions` chargees sans scope (deja identifie)

### Architecture cible

L'algorithme sera restructure en 3 passes distinctes, inspire de l'approche Walker/Buchheim adaptee a la genealogie :

```text
Passe 1: Construction du graphe
  - Indexer persons, relationships, unions
  - Construire des "FamilyUnit" (union + enfants)
  - Detecter le root et les composants deconnectes

Passe 2: Calcul des largeurs (bottom-up)
  - Chaque noeud-feuille = CARD_WIDTH
  - Chaque couple = 2 * CARD_WIDTH + SPOUSE_GAP
  - Chaque parent = max(largeur couple, somme largeurs enfants)

Passe 3: Positionnement (top-down)
  - Centrer les enfants sous le point d'union des parents
  - Resoudre les chevauchements entre sous-arbres voisins
  - Placer les composants deconnectes en dessous avec separation
```

### Corrections a appliquer

#### 1. `src/hooks/useFamilyTree.tsx` — Requetes filtrees

Remplacer les requetes `select('*')` sans filtre sur `family_parent_child` et `family_unions` par des requetes filtrees via les person IDs du tree :

```typescript
// Charger persons d'abord, puis filtrer relationships/unions
const personsResult = await supabase.from('family_persons').select('*').eq('tree_id', treeId);
const personIds = (personsResult.data || []).map(p => p.id);

// Requetes filtrees en parallele
const [relationshipsResult, unionsResult] = await Promise.all([
  supabase.from('family_parent_child').select('*')
    .or(`parent_id.in.(${personIds.join(',')}),child_id.in.(${personIds.join(',')})`),
  supabase.from('family_unions').select('*')
    .or(`person1_id.in.(${personIds.join(',')}),person2_id.in.(${personIds.join(',')})`),
]);
```

#### 2. `src/components/familyTree/TreeVisualization.tsx` — Refonte complete du layout

**Nouveau moteur de layout** avec les concepts suivants :

- **FamilyUnit** : structure `{ couple: [person1, person2?], children: FamilyPerson[], unionId?: string }`. C'est l'unite atomique de positionnement.
- **Graphe de familles** : index bidirectionnel `personId → FamilyUnit[]` pour naviguer efficacement
- **Algorithme en 3 passes** :
  1. `measureSubtree(personId)` : retourne la largeur necessaire (recursif, bottom-up)
  2. `positionSubtree(personId, x, y)` : place chaque personne (top-down), centre les enfants sous le point d'union
  3. `resolveOverlaps()` : detecte et corrige les chevauchements entre sous-arbres adjacents
- **Gestion des mariages multiples** : chaque union genere un groupe d'enfants distinct, positionne sous le point d'union correspondant
- **Composants deconnectes** : detectes par BFS sur le graphe complet, positionnes en dessous du sous-arbre principal avec un separateur visuel
- **Vue ascendante** : generation de base dynamique (calculee depuis le root, pas hardcodee)
- **Vue sablier** : combine ascendant + descendant depuis le root, generation 0 = root

**Structure du code refactorise** :

```typescript
// Types internes
interface FamilyUnit {
  id: string;          // union ID ou generated
  partners: string[];  // 1 ou 2 person IDs
  childIds: string[];  // enfants de cette union
}

interface LayoutNode {
  personId: string;
  x: number;
  y: number;
  width: number;       // largeur du sous-arbre
}

// Fonctions principales
function buildFamilyGraph(persons, relationships, unions): Map<string, FamilyUnit[]>
function measureSubtree(personId, graph, visited): number
function positionSubtree(personId, x, y, graph, visited, positions): void
function resolveOverlaps(positions: Map<string, LayoutNode>): void
function layoutDisconnected(components, mainBounds): void
```

**Ameliorations visuelles** :
- Lignes de connexion parent-enfant passant par un "T" horizontal quand il y a plusieurs enfants (standard genealogique)
- Point d'union (petit cercle ou coeur) centre entre les conjoints
- Les enfants se connectent au T horizontal, pas directement au point d'union

#### 3. Rendu SVG des connexions

Remplacer les paths courbes par le standard genealogique :
- Conjoints : ligne horizontale avec symbole d'union au centre
- Parent → enfants : ligne verticale depuis le point d'union jusqu'a une barre horizontale, puis lignes verticales vers chaque enfant (motif en "T" ou "peigne")

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/hooks/useFamilyTree.tsx` | Requetes `family_parent_child` et `family_unions` filtrees par person IDs |
| `src/components/familyTree/TreeVisualization.tsx` | Refonte complete : algorithme 3 passes, FamilyUnit, gestion mariages multiples, composants deconnectes, connexions en T |

