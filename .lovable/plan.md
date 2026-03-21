

## Plan : Promotion Premium 4,99€/mois pendant 3 mois

### Contexte actuel
- Prix Premium mensuel : 9,99€ (price_id: `price_1SrzsNRc375UxOm0w9dJmRFf`)
- Un coupon Stripe existe deja ("Mamie", 50% forever) — non lie a cette promo
- La promo demandee : 4,99€/mois pendant 3 mois = **5,00€ de reduction pendant 3 mois**

### Etapes

#### 1. Creer un coupon Stripe
- Nom : "Lancement Premium -50%"
- amount_off : 500 (5,00€ en centimes)
- currency : EUR
- duration : repeating
- duration_in_months : 3

#### 2. Modifier `create-checkout` (edge function)
- Pour le tier `premium` en mode `monthly`, appliquer automatiquement le coupon de lancement via `discounts: [{ coupon: "<ID_DU_COUPON>" }]`
- Le coupon Stripe gerera nativement la reduction sur les 3 premiers mois, puis le prix normal reprendra
- Ne pas afficher `allow_promotion_codes` quand le coupon auto est applique (deja le cas dans le code actuel)

#### 3. Modifier l'affichage du pricing (PricingSection + Premium page)

Sur la carte Premium mensuel :
- Afficher le prix barre : ~~9,99€~~ **4,99€**/mois
- Ajouter un badge promo : "Offre de lancement : -50% pendant 3 mois"
- Apres 3 mois, retour automatique a 9,99€ (gere par Stripe)

#### 4. Traduire les textes promo dans les 5 langues
Ajouter dans `landing.json` et `dashboard.json` les cles :
- `pricing.plans.premium.promo` : "Offre de lancement"
- `pricing.plans.premium.promoDetail` : "-50% pendant 3 mois"
- `pricing.plans.premium.originalPrice` : "9,99"

### Fichiers modifies

| Fichier | Modification |
|---|---|
| Stripe (coupon) | Creation via outil Stripe |
| `supabase/functions/create-checkout/index.ts` | Auto-appliquer le coupon pour premium monthly |
| `src/components/landing/PricingSection.tsx` | Prix barre + badge promo |
| `src/pages/Premium.tsx` | Prix barre + badge promo |
| `public/locales/*/landing.json` (x5) | Traductions promo |

