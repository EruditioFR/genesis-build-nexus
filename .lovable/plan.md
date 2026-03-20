

## Constat

La checklist d'onboarding s'affiche sur mobile ET desktop, mais uniquement si :
- Le parametre `?welcome=true` est present, OU
- `localStorage('onboarding_dismissed')` n'est pas defini ET `totalCapsules === 0`

Si vous l'avez deja fermee une fois (clic sur "Passer pour l'instant" ou X), elle est definitivement masquee via `localStorage`. C'est probablement ce qui s'est passe sur PC.

De plus, la checklist actuelle :
- Est entierement en francais en dur (pas traduite)
- N'explique pas le concept de Family Garden, elle liste juste 3 taches

---

## Plan : Ameliorer l'onboarding dashboard

### 1. Remplacer la checklist par une section d'accueil explicative

Quand `totalCapsules === 0`, afficher une **section d'accueil integree au dashboard** (pas une modale) avec :

- Un titre accrocheur : "Family Garden, c'est votre jardin de souvenirs"
- 3 cartes visuelles expliquant le fonctionnement :
  - **Creez** — Preservez photos, videos, textes, audio
  - **Organisez** — Retrouvez vos souvenirs dans une chronologie
  - **Partagez** — Invitez vos proches dans des cercles prives
- Un bouton CTA "Creer mon premier souvenir"
- Un lien discret "Masquer" pour fermer

Cette section remplace a la fois la checklist et les stats/capsules vides. Elle disparait naturellement des que l'utilisateur a cree un souvenir.

### 2. Traduire dans les 5 langues

Ajouter les cles dans `dashboard.json` (fr, en, es, ko, zh).

### 3. Corriger la persistance

Utiliser `totalCapsules === 0` comme condition principale (pas seulement localStorage), pour que la section reapparaisse si le compte est vide, meme sur un autre navigateur.

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/WelcomeSection.tsx` | Nouveau composant — 3 cartes explicatives + CTA |
| `src/pages/Dashboard.tsx` | Remplacer OnboardingChecklist par WelcomeSection quand 0 capsules |
| `public/locales/*/dashboard.json` (x5) | Ajouter les traductions welcome section |

L'OnboardingChecklist existante reste dans le code mais ne sera plus affichee (remplacement propre).

