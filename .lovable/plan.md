

## Diagnostic : Import GEDCOM volumineux

### Problemes identifies

L'import GEDCOM actuel effectue **une requete Supabase par personne et par relation**, de maniere sequentielle :

1. **Personnes** : boucle `for...of` avec un `INSERT ... .single()` par individu (ligne 447-486)
2. **Unions** : un `INSERT` par famille (ligne 512-525)
3. **Relations parent-enfant** : un `INSERT` par lien (lignes 540-563)

Pour un fichier de 500 personnes et 200 familles, cela represente facilement **1000+ requetes HTTP sequentielles**. Chacune prend ~50-200ms, soit un import de **2 a 5 minutes** qui peut timeout ou bloquer l'UI.

Autres problemes :
- La fausse barre de progression (`setProgress(prev + 10)` toutes les 200ms) ne reflete pas l'avancement reel
- Limite de 10 Mo sur le fichier (suffisant, mais un gros GEDCOM peut depasser)
- Le parsing synchrone (`parseGedcom`) bloque le thread principal sur les gros fichiers

---

## Plan : Import par lots (batch) avec progression reelle

### 1. Modifier `importFromGedcom` dans `useFamilyTree.tsx`

Remplacer les inserts un par un par des **inserts par lots de 50** :

```text
Avant : 500 personnes = 500 requetes (sequentielles)
Apres : 500 personnes = 10 requetes (lots de 50)
```

- Utiliser `.insert([...batch])` de Supabase qui accepte un tableau
- Traiter les personnes par lots de 50
- Traiter les unions par lots de 50
- Traiter les relations parent-enfant par lots de 50
- Apres chaque lot, appeler un callback de progression pour mettre a jour l'UI

### 2. Ajouter un callback de progression reel

Modifier la signature de `importFromGedcom` pour accepter un `onProgress?: (percent: number) => void` :

- Phase 1 (0-60%) : creation des personnes, progression proportionnelle au nombre de lots traites
- Phase 2 (60-90%) : creation des unions et relations
- Phase 3 (90-100%) : finalisation

### 3. Adapter `GedcomImportDialog.tsx`

- Passer le callback de progression a `onImport`
- Supprimer le faux `setInterval` de progression
- Afficher le pourcentage reel et le nombre de personnes traitees

### 4. Parser asynchrone pour les gros fichiers

Ajouter un `setTimeout` / chunking dans `parseGedcom` pour ne pas bloquer l'UI sur les fichiers > 5000 lignes (optionnel, priorite basse).

---

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/hooks/useFamilyTree.tsx` | `importFromGedcom` : inserts par lots de 50 + callback progression |
| `src/components/familyTree/GedcomImportDialog.tsx` | Progression reelle, suppression du faux interval |
| `src/pages/FamilyTreePage.tsx` | Adapter l'appel `onImport` pour passer la progression |

### Impact attendu

- Import de 500 personnes : ~10 requetes au lieu de 500 → **~5-10 secondes au lieu de 2-5 minutes**
- Barre de progression fiable
- Pas de timeout ni blocage UI

