# Correction SEO : domaine canonique sans www

## Objectif

Migrer toutes les références internes du site de `https://www.familygarden.fr` vers `https://familygarden.fr` pour éliminer les signaux contradictoires d'indexation, et garantir que les pages privées sont en `noindex`.

## Note importante sur les redirections 301

Les redirections HTTP 301 `www → non-www` se configurent au niveau **DNS / hébergeur**, pas dans le code React (SPA). Lovable Hosting sert actuellement les deux domaines (`familygarden.fr` et `www.familygarden.fr`) sans redirection automatique entre eux. Pour obtenir une vraie 301, il faudra :
- soit définir `familygarden.fr` comme **domaine primaire** dans Project Settings → Domains (Lovable redirige alors automatiquement les autres vers le primaire),
- soit (si déjà fait mais inactif) vérifier que `www.familygarden.fr` est bien marqué comme alias et non comme domaine principal.

**Action utilisateur requise après le déploiement** : vérifier dans Project Settings → Domains que `familygarden.fr` est marqué « Primary ». Je documenterai ceci dans la réponse finale. Côté code, je m'occupe de tout le reste.

## Changements code

### 1. Constante canonique unifiée
- `src/components/seo/SEOHead.tsx` : `SITE_URL = 'https://familygarden.fr'` (retirer le `www.`)
- `src/components/seo/JsonLdSchema.tsx` : remplacer toutes les URLs `www.familygarden.fr` → `familygarden.fr`
- `src/lib/seoSchemas.ts` : idem

### 2. index.html
Remplacer dans toutes les balises (`og:url`, `og:image`, `canonical`, `twitter:image`, JSON-LD `@id`, `url`, `logo`, liens du `<noscript>`) :
- `https://www.familygarden.fr` → `https://familygarden.fr`

### 3. Sitemap
- `public/sitemap.xml` : URLs sans `www`
- `supabase/functions/sitemap/index.ts` : `SITE_URL = "https://familygarden.fr"`

### 4. Robots.txt
- `public/robots.txt` : remplacer la ligne `Sitemap:` et les commentaires `llms.txt` par les versions sans `www` (conserver toute la logique de Disallow existante qui est correcte)

### 5. Pages publiques — noindex à ajouter
Les pages suivantes utilisent `SEOHead` mais sans `noIndex={true}` ; elles doivent être passées en noindex :
- `src/pages/Login.tsx` → ajouter `noIndex`
- `src/pages/ForgotPassword.tsx` → ajouter `<NoIndex />` ou `SEOHead` avec `noIndex`
- `src/pages/Signup.tsx` → **garder indexable** (page d'inscription publique, conforme à la demande)
- Pages déjà OK (NoIndex présent) : Dashboard, Profile, ResetPassword

Pages privées qui n'ont pas encore `<NoIndex />` à vérifier et compléter si manquantes : Statistics, CapsulesList, CapsuleDetail, CapsuleCreate, CapsuleEdit, Timeline, CirclesPage, FamilyTreePage, CategoriesPage, SharedWithMePage, InspirationsPage, BetaFeedback, GuardianDashboard, EmailConfirmation, et toutes les pages `/admin/*`.

### 6. Edge Functions e-mails
Les fonctions `accept-invitation`, `create-guest-checkout`, `send-confirmation-email`, `send-guardian-email`, `send-invitation-email`, `send-welcome-email` contiennent des liens `https://www.familygarden.fr/...` dans les templates HTML d'e-mails. Je les remplacerai par `https://familygarden.fr/...` pour cohérence (les utilisateurs cliquent depuis leurs e-mails).

### 7. Fichiers LLM
- `public/llms.txt` et `public/llms-full.txt` : remplacer toutes les URLs absolues `www.familygarden.fr` → `familygarden.fr`

### 8. About page
- `src/pages/About.tsx` : remplacer l'occurrence trouvée (probablement un lien externe ou JSON-LD).

## Hors scope (sera mentionné à l'utilisateur)

- Configuration du domaine primaire dans Lovable Project Settings (action manuelle utilisateur)
- Pas de modification de design, de routes ou de textes visibles
- Pas de modification des fichiers auto-générés (`supabase/client.ts`, `types.ts`, `.env`)

## Validation post-déploiement

Après application + configuration du domaine primaire :
- `curl -I https://www.familygarden.fr/` doit retourner 301 → `https://familygarden.fr/`
- Toutes les balises `<link rel="canonical">` doivent pointer vers `https://familygarden.fr/...`
- `https://familygarden.fr/sitemap.xml` doit lister uniquement des URLs sans `www`
