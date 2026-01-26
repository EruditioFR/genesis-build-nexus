
# Plan : Corriger l'affichage du stockage dans l'administration

## Problème identifié

Les statistiques de stockage affichent 0 MB pour tous les utilisateurs car les **politiques de sécurité (RLS)** sur la table `capsule_medias` ne permettent pas aux administrateurs de voir les médias des autres utilisateurs.

### Données réelles en base :
| Utilisateur | Stockage réel |
|------------|---------------|
| Jean-Baptiste Béjot (compte principal) | 74.06 MB |
| Jean-Baptiste Béjot (autre compte) | 42.09 MB |
| Emilie Béjot | 12.27 MB |

### Cause technique
- La table `capsules` a une politique RLS "Admins can view all capsules"
- **La table `capsule_medias` n'a PAS de politique équivalente pour les admins**
- Résultat : l'admin peut voir les capsules mais pas les fichiers médias associés

---

## Solution proposée

### Étape 1 : Ajouter une politique RLS pour les admins sur `capsule_medias`

Créer une nouvelle politique permettant aux admins/modérateurs de consulter tous les médias :

```sql
CREATE POLICY "Admins can view all medias"
ON capsule_medias
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));
```

### Étape 2 : Ajouter également la politique sur `family_person_media`

Pour que le stockage des arbres généalogiques soit aussi visible :

```sql
CREATE POLICY "Admins can view all family media"
ON family_person_media
FOR SELECT
TO authenticated
USING (is_admin_or_moderator(auth.uid()));
```

---

## Résultat attendu

Après cette modification :
- Le tableau des utilisateurs affichera le stockage réel (74 MB, 42 MB, 12 MB...)
- Les graphiques de répartition fonctionneront correctement
- La barre de progression du stockage sera précise

---

## Sections techniques

### Politique RLS actuelle de `capsule_medias`
```
SELECT: user_can_view_capsule(auth.uid(), capsule_id)
```
Cette fonction vérifie uniquement si l'utilisateur est propriétaire ou membre d'un cercle partagé, pas s'il est admin.

### Fonction `is_admin_or_moderator` existante
```sql
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = _user_id AND role IN ('admin', 'moderator')
)
```
Cette fonction est déjà utilisée ailleurs et sera réutilisée ici.
