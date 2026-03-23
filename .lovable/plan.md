

## Plan : Gestion des arbres genealogiques dans le backoffice

### Objectif

Ajouter une page **Admin Family Trees** dans le backoffice permettant de visualiser, rechercher et gerer les arbres genealogiques de tous les utilisateurs.

### Fonctionnalites

- **Liste des arbres** : tableau avec nom de l'arbre, proprietaire (display_name), nombre de personnes, nombre d'unions, date de creation
- **Recherche** par nom d'arbre ou nom d'utilisateur
- **Actions par arbre** :
  - Voir le detail (nombre de personnes, unions, relations)
  - Supprimer un arbre (avec confirmation) — supprime en cascade personnes, unions, relations
  - Exporter les stats d'un arbre
- **Stats globales en haut** : nombre total d'arbres, total de personnes, arbre le plus volumineux

### Acces aux donnees

Les tables `family_trees`, `family_persons`, `family_unions`, `family_parent_child` ont des RLS restreintes au proprietaire. Il faut ajouter des **policies SELECT pour les admins** sur ces 4 tables, en utilisant la fonction `is_admin_or_moderator` existante. Ajouter egalement une policy DELETE admin sur `family_trees` pour permettre la suppression.

### Implementation

#### 1. Migration SQL — Policies admin sur les tables family

```sql
-- SELECT admin sur family_trees, family_persons, family_unions, family_parent_child
CREATE POLICY "Admins can view all trees" ON family_trees FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all persons" ON family_persons FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all unions" ON family_unions FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can view all relations" ON family_parent_child FOR SELECT TO authenticated
  USING (is_admin_or_moderator(auth.uid()));

-- DELETE admin sur family_trees (cascade supprimera le reste)
CREATE POLICY "Admins can delete trees" ON family_trees FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

#### 2. Nouvelle page `src/pages/admin/AdminFamilyTrees.tsx`

- Charge tous les arbres avec un count de personnes via une requete jointe
- Joint les profiles pour afficher le nom du proprietaire
- Tableau avec colonnes : Proprietaire, Nom arbre, Personnes, Unions, Cree le, Actions
- Dialogue de confirmation pour la suppression
- Barre de recherche

#### 3. Ajouter la route et le lien navigation

| Fichier | Modification |
|---|---|
| Migration SQL | 6 policies admin (SELECT x4 + DELETE x1) |
| `src/pages/admin/AdminFamilyTrees.tsx` | Nouvelle page |
| `src/pages/admin/AdminLayout.tsx` | Ajouter l'entree nav "Arbres" avec icone `TreePine` |
| `src/App.tsx` | Ajouter route `/admin/family-trees` + lazy import |

