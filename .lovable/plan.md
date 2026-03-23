

## Plan : Audit et correction des fuites de donnees inter-utilisateurs

### Problemes identifies

**1. BUG CRITIQUE — `useFamilyTree.tsx` (lignes 135-136)**
Les requetes `family_parent_child.select('*')` et `family_unions.select('*')` sont executees **sans aucun filtre**. Toutes les relations et unions de tous les utilisateurs sont chargees, puis filtrees cote client. Meme si les politiques RLS limitent les resultats, cette approche est:
- Inefficace (charge inutile)
- Fragile (si un admin utilise le meme hook, il voit tout)
- Risquee (le filtrage client ne doit jamais etre la seule barriere)

**2. Requetes sans filtre dans `Statistics.tsx` (lignes 75-79)**
`capsule_medias`, `comments`, `capsule_shares`, `capsule_categories` sont chargees sans filtre `user_id`, puis filtrees cote client par capsule IDs. Les politiques RLS protegent les donnees, mais les requetes devraient etre scopees aux capsules de l'utilisateur via `.in('capsule_id', capsuleIds)` pour eviter de charger des donnees inutiles.

**3. Autres pages verifiees — OK**
- `CapsuleDetail.tsx` : charge par ID, protege par RLS `user_can_view_capsule` (correct pour les capsules partagees)
- `CapsuleEdit.tsx` : filtre `.eq('user_id', user.id)` present
- `CapsulesList.tsx` : filtre `.eq('user_id', user.id)` present
- `CategoryDetailPage.tsx` : filtre `.eq('user_id', user.id)` present
- `Dashboard.tsx` : filtre `.eq('user_id', user.id)` present
- `Timeline.tsx` : filtre `.eq('user_id', user.id)` present
- `PersonCapsuleLink.tsx` : corrige precedemment, filtre present
- Pages admin : pas de filtre user_id, ce qui est normal (acces admin)

### Corrections a appliquer

#### 1. `src/hooks/useFamilyTree.tsx` — Filtrer relationships et unions par tree

Remplacer les lignes 135-136 :
```typescript
// AVANT (dangereux)
supabase.from('family_parent_child').select('*'),
supabase.from('family_unions').select('*')

// APRES (scope au tree via les person IDs du tree)
```
Approche : d'abord charger les persons du tree, puis utiliser leurs IDs pour filtrer relationships et unions. Reorganiser en 2 etapes :
1. Charger tree + persons
2. Avec les person IDs, charger relationships (`.in('parent_id', personIds)`) et unions (`.in('person1_id', personIds)`)

#### 2. `src/pages/Statistics.tsx` — Ajouter des filtres `.in('capsule_id', ...)`

Charger d'abord les capsules de l'utilisateur, puis utiliser les IDs pour filtrer les requetes dependantes :
```typescript
// Etape 1 : capsules de l'utilisateur
const capsulesRes = await supabase.from('capsules').select('*').eq('user_id', user.id);
const capsuleIds = capsulesRes.data?.map(c => c.id) || [];

// Etape 2 : requetes filtrees
supabase.from('capsule_medias').select('id, capsule_id').in('capsule_id', capsuleIds),
supabase.from('comments').select('id, capsule_id').in('capsule_id', capsuleIds),
supabase.from('capsule_shares').select('id, capsule_id').in('capsule_id', capsuleIds),
supabase.from('capsule_categories').select('...').in('capsule_id', capsuleIds),
```

### Fichiers modifies

| Fichier | Correction |
|---|---|
| `src/hooks/useFamilyTree.tsx` | Filtrer `family_parent_child` et `family_unions` par person IDs du tree |
| `src/pages/Statistics.tsx` | Ajouter `.in('capsule_id', capsuleIds)` sur 4 requetes |

