

## Plan : Admin Override pour abonnements manuels

### Probleme

Quand un admin upgrade manuellement un utilisateur (ex: Legacy offert), la fonction `check-subscription` ecrase ce choix toutes les 60 secondes si l'utilisateur a un abonnement Stripe actif d'un niveau different.

### Solution

Ajouter un champ `admin_override` (boolean) dans `profiles`. Quand il est `true`, la fonction `check-subscription` ne modifie pas le `subscription_level` du profil et retourne directement le niveau stocke en base.

---

### 1. Migration : ajouter `admin_override` a `profiles`

```sql
ALTER TABLE public.profiles 
  ADD COLUMN admin_override boolean NOT NULL DEFAULT false;
```

### 2. Modifier `check-subscription` edge function

Apres l'authentification de l'utilisateur, avant de requeter Stripe :

- Lire le profil (`subscription_level`, `admin_override`)
- Si `admin_override = true` : retourner immediatement `{ subscribed: true, tier: profile.subscription_level, subscription_end: null }` sans appeler Stripe
- Si `admin_override = false` : continuer le flux Stripe normal (comportement actuel)

Cela garantit qu'un override admin n'est jamais ecrase.

### 3. Adapter `AdminSubscriptions.tsx`

- Afficher un badge "Offert" (ou icone cadeau) a cote du niveau pour les utilisateurs ayant `admin_override = true`
- Quand un admin change le niveau d'abonnement via le select :
  - Activer automatiquement `admin_override = true` (le changement admin doit persister)
  - Mettre a jour `subscription_level` + `storage_limit_mb` + `admin_override` en une seule requete
- Ajouter un bouton/toggle pour desactiver l'override (remettre `admin_override = false`), ce qui permet a Stripe de reprendre le controle

### 4. Adapter `useSubscription` hook

- Mapper `tier: 'legacy'` quand le profil retourne `subscription_level = 'legacy'` (deja fait dans le fallback actuel)
- Aucun changement majeur cote hook, le edge function gere tout

---

### Fichiers modifies

| Fichier | Modification |
|---|---|
| Migration SQL | Ajouter colonne `admin_override` |
| `supabase/functions/check-subscription/index.ts` | Short-circuit si `admin_override = true` |
| `src/pages/admin/AdminSubscriptions.tsx` | Badge "Offert", toggle override, update groupé |

