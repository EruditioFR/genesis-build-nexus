

## Plan: Separation des branches par lignee (regles de l'art genealogique)

### Probleme
Le moteur de layout actuel melange les branches de belles-familles. Quand Jean-Baptiste Bejot epouse Jessica Guerrero, les ancetres Guerrero se retrouvent entremeles avec les ancetres Bejot au lieu d'etre dans une colonne separee. En genealogie professionnelle, chaque lignee forme un sous-arbre distinct, relies par des lignes de mariage horizontales.

### Principe genealogique standard

```text
  [Gd-pere Bejot]──[Gd-mere Bejot]     [Gd-pere Guerrero]──[Gd-mere Guerrero]
         │                                        │
  [Daniel Bejot]──[Jocelyne Dubuis]     [Juan Ramon]──[Marie-Noelle]
         │                                        │
         └──── [Jean-Baptiste]════════[Jessica] ──┘
                       │
                  [Enfants...]
```

Chaque lignee = 1 sous-arbre vertical independant. Les mariages inter-branches = lignes horizontales reliant les deux colonnes.

### Solution technique

**Fichier modifie** : `src/components/familyTree/TreeVisualization.tsx`

#### 1. Identifier les lignees par naissance (pas par mariage)
- Chaque personne appartient a la lignee de ses **parents biologiques**
- Un conjoint est "emprunte" a sa lignee d'origine et place a cote de son partenaire, mais ses ancetres restent dans leur propre sous-arbre
- Modifier le BFS pour ne PAS traverser les liens de parente d'un conjoint (ne pas remonter aux parents du conjoint)

#### 2. Layout par sous-arbre de lignee
- Chaque "root ancestor" (ancetre sans parents) et ses descendants forment un sous-arbre independant
- `placeSubtree` ne remonte JAMAIS aux parents d'un conjoint
- Les conjoints sont places a cote de leur partenaire dans le sous-arbre du partenaire

#### 3. Ordonnancement intelligent des sous-arbres
- Placer les sous-arbres de gauche a droite en priorisant la proximite des branches mariees
- La branche principale (celle du root person) est au centre
- Les branches de belles-familles sont adjacentes aux branches avec lesquelles elles sont liees par mariage

#### 4. Lignes de mariage inter-branches
- Les mariages entre membres de branches differentes generent des lignes horizontales longues
- Les enfants sont connectes au point median entre les deux parents (meme si les parents sont dans des sous-arbres differents)

### Modifications concretes

| Aspect | Avant | Apres |
|---|---|---|
| BFS generation | Traverse parents du conjoint → melange | Stop au conjoint, ne remonte pas ses parents |
| Root ancestors | Tous melanges dans le meme espace | Chaque lignee = colonne separee |
| Placement conjoint | Tire dans le sous-arbre du partenaire avec toute sa famille | Conjoint place a cote, mais ses ancetres dans leur propre colonne |
| Connexions enfants | Point d'union = centre du couple local | Point d'union = milieu entre les 2 parents (potentiellement inter-branches) |

### Detail de l'algorithme

1. **Decomposer en lignees** : BFS depuis chaque personne, suivre uniquement liens parent→enfant (pas conjoint→parent-du-conjoint). Chaque composante = 1 lignee.
2. **Ordonner les lignees** : Graphe des mariages inter-lignees → placement adjacent des lignees liees.
3. **Layout intra-lignee** : Top-down classique (ancetres en haut, descendants en bas). Conjoints places a cote.
4. **Post-traitement** : Lignes de mariage horizontales entre lignees + lignes parent-enfant vers le point median.

