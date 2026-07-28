## Nouvelle grille tarifaire

| Plan | Prix | Contenu |
|---|---|---|
| **Essai gratuit** | 14 jours | Accès complet Essentiel (sans arbre) |
| **Essentiel** | 2,99 €/mois ou 29,90 €/an | Tout (texte/photo/vidéo/audio/mixte), 20 Go, partage illimité, legs, podcast, sans pub |
| **Arbre généalogique** (option) | +5 €/mois ou +50 €/an | S'ajoute à Essentiel |
| **Anciens (grandfathered)** | Inchangé | Premium 4,99€ et Héritage 9,99€ conservés tels quels pour les abonnés existants |

L'arbre est vendu comme **line item additionnel sur le même abonnement Stripe** (une seule facture, gestion via Customer Portal).

---

## 1 · Stripe — nouveaux produits & prix

À créer via l'outil Stripe :
- `prod_essential` → `price_essential_monthly` (299 EUR, month) + `price_essential_yearly` (2990 EUR, year)
- `prod_family_tree_addon` → `price_tree_monthly` (500 EUR, month) + `price_tree_yearly` (5000 EUR, year)

Anciens prix (`price_1TJui8…`, `price_1TJuim…`, etc.) : **conservés actifs** pour les abonnés grandfathered. Aucun `create-checkout` ne les proposera plus aux nouveaux clients.

---

## 2 · Base de données

Migration :
- Ajouter la valeur `'essential'` à l'enum `subscription_level` (garder `free`, `premium`, `legacy`)
- Ajouter `profiles.has_family_tree_addon boolean NOT NULL DEFAULT false`
- Ajouter `profiles.trial_ends_at timestamptz NULL` (essai 14 jours pour les nouveaux comptes)
- Mettre à jour `handle_new_user()` : initialiser `trial_ends_at = now() + interval '14 days'`, `subscription_level = 'essential'` (accès complet pendant l'essai), `has_family_tree_addon = false`
- Backfill : les utilisateurs existants restent `free/premium/legacy` inchangés ; `trial_ends_at = NULL` pour eux (pas d'essai rétroactif)

---

## 3 · Edge functions Stripe

**`create-checkout`** — refonte :
- Nouveaux tiers acceptés : `essential` (+ ancien `premium`/`heritage` refusés pour nouveaux checkouts)
- Nouveau paramètre `withFamilyTree: boolean` → ajoute la 2ᵉ line item
- `subscription_data.trial_period_days: 14` si l'utilisateur n'a jamais eu d'abonnement
- Retirer les coupons de lancement Premium/Héritage (obsolètes)
- Gérer upgrade/downgrade : ajout/retrait de l'add-on arbre via `stripe.subscriptions.update()` avec `items` (add ou set `deleted: true`)

**`check-subscription`** — refonte du mapping :
- Ajouter `prod_essential` → `essential`, `prod_family_tree_addon` → détecté séparément
- Détection add-on : itérer `subscription.items.data`, si l'un référence `prod_family_tree_addon` → `has_family_tree_addon = true`
- Écriture profil : `subscription_level` + `has_family_tree_addon` + `storage_limit_mb` (20480 pour essential/premium/heritage grandfathered, 500 pour free)
- Prise en compte de l'essai : si `trial_ends_at > now()` et pas d'abonnement Stripe actif → renvoyer `subscribed: true, tier: 'essential', trialing: true`
- Réponse JSON : ajouter `has_family_tree_addon`, `trial_ends_at`

**`create-guest-checkout`** — même refonte, même paramètre `withFamilyTree`.

**`stripe-webhook`** — synchroniser `has_family_tree_addon` lors de `customer.subscription.updated/deleted`.

---

## 4 · Hooks et droits

**`useSubscription`** :
- Ajouter dans le state : `hasFamilyTreeAddon: boolean`, `trialing: boolean`, `trialEndsAt: string | null`
- Cache localStorage : ajouter ces champs
- Nouvelle méthode `toggleFamilyTreeAddon(add: boolean, billing)` → appelle `create-checkout` (ou une nouvelle fonction `update-subscription-items`)

**`useFeatureAccess`** — nouvelle logique :
- Ajouter `ESSENTIAL_LIMITS` (20 Go, tous formats, timeline, legs, podcast, pas de pub, `canAccessFamilyTree: false`)
- Renommer la logique : `canAccessFamilyTree` devient une **valeur dérivée** :
  - `true` si `tier === 'heritage'` (grandfathered) **ou** `hasFamilyTreeAddon === true`
  - `false` sinon
- Ajouter `isEssential`, `isTrialing` aux helpers exportés
- `getUpgradePathForFeature('canAccessFamilyTree')` → renvoyer `'family_tree_addon'` avec message : « L'arbre généalogique est disponible en option à 5 €/mois. »

---

## 5 · Pages et composants UI

**`Premium.tsx`** — refonte complète :
- 1 seule carte principale « Essentiel — 2,99 €/mois » (ou 29,90 €/an avec toggle)
- 1 carte « Option Arbre généalogique — +5 €/mois »
- Bandeau grandfathered si `tier === 'premium' || tier === 'legacy'` : « Vous conservez votre tarif historique »
- Toggle mensuel/annuel
- CTA essai 14 jours si `!subscribed && !trialing`

**`PricingSection.tsx` + `PricingSectionV3.tsx`** (landing) :
- Retirer les 2 cartes Premium/Héritage
- 1 seule carte hero « Essentiel 2,99 € », badge « 14 jours offerts »
- Sous la carte : encart discret « + Option Arbre généalogique 5 €/mois »
- Retirer badges promo lancement

**`PremiumPromoCard.tsx`, `FamilyTreeCard.tsx`, `DashboardHeader.tsx`, `TourWelcomeDialog.tsx`** :
- Mettre à jour les libellés « Héritage » → « Option Arbre généalogique »
- Bouton d'activation directe de l'add-on

**`FamilyTreePage.tsx`** :
- Écran de gating : si `!canAccessFamilyTree` → CTA « Activer l'option Arbre — 5 €/mois »
- Grandfathered heritage : accès libre (inchangé)

**`FAQ.tsx`, `Checkout.tsx`, `CheckoutSuccess.tsx`, `admin/AdminSubscriptions.tsx`, `admin/AdminUsers.tsx`, `admin/AdminCloudUsage.tsx`, `BetaFeedback.tsx`, `Statistics.tsx`** :
- Mise à jour affichage tiers (support `essential` + colonne add-on arbre en admin)

**`legal/TermsOfSale.tsx`** :
- Réécriture section prix : Essentiel 2,99€, option arbre 5€, essai 14 jours, mention grandfathering

---

## 6 · Contenus & SEO

- `public/llms.txt` + `public/llms-full.txt` : réécrire section « Offres et tarifs »
- `index.html` JSON-LD `SoftwareApplication` : `offers.price` → `"2.99"`
- Locales i18n (`fr/pricing.*`, `en`, `es`, `it`, `pt`, `ko`, `zh`) : nouvelles clés `pricing.plans.essential.*` et `pricing.plans.familyTreeAddon.*`, dépréciation `premium.*`/`heritage.*` (garder pour rétrocompatibilité affichage grandfathered)

---

## 7 · Vérification (double contrôle demandé)

Après implémentation, checklist automatisée :

**Contrôle 1 — cohérence code**
```
rg "4,99|9,99|4\.99|9\.99" src/ supabase/ public/ index.html
rg "'premium'|'heritage'|'legacy'" src/hooks/ src/pages/Premium.tsx supabase/functions/
```
→ ne doit plus renvoyer que des références au traitement grandfathered.

**Contrôle 2 — Stripe**
- `stripe_api_read` sur les 4 nouveaux prix → vérifier montant, devise, intervalle
- Test `create-checkout` avec `{tier: 'essential', billing: 'monthly', withFamilyTree: false}` puis `true` → vérifier line items retournés
- Test `check-subscription` sur compte de test → vérifier `has_family_tree_addon`

**Contrôle 3 — droits**
- Compte essai actif : accès Essentiel oui, arbre non
- Compte essai expiré sans abonnement : downgrade automatique (bandeau + accès lecture seule des souvenirs déjà créés)
- Compte grandfathered heritage : arbre accessible, aucun CTA d'add-on affiché
- Compte essential + add-on : arbre accessible

---

## Notes techniques

- **Downgrade essai → gratuit** : si l'essai expire sans paiement, `check-subscription` renvoie `subscribed: false, tier: 'free'`. Un nouveau plan « post-essai » n'est pas créé — l'utilisateur retombe sur `free` (250 Mo, lecture + création texte/photo). Les médias existants restent accessibles en lecture.
- **Ajout/retrait de l'add-on en cours d'abonnement** : au prorata via Stripe (`proration_behavior: 'create_prorations'`).
- **Coupons de lancement actuels** : supprimés du flux nouveau. Les codes promo Stripe restent utilisables via `promoCode`.
