

# Reorganiser le dashboard : souvenirs en priorite, interface allegee

## Probleme actuel

L'ordre actuel du dashboard est :
1. Message de bienvenue
2. Checklist d'onboarding (conditionnel)
3. **QuickActions** -- 4 grosses cartes colorees en grille 2x2 sur mobile (~250px)
4. **StatsCards** -- barre de statistiques
5. **GuidedMemoryPrompts** -- gros bloc avec 5 categories (~400px+)
6. **RecentCapsules** -- liste des souvenirs (trop bas dans la page)
7. StorageProgress + FamilyTreeCard/PremiumPromo

Les souvenirs sont enfouis sous ~700px de cartes et suggestions. "Mes partages" (Cercles) occupe une carte QuickActions alors qu'il est deja dans le menu Profil du bottom nav.

## Modifications prevues

### 1. Retirer "Mes partages" des QuickActions

Supprimer la carte "Cercles" de `QuickActions.tsx`. Elle est deja accessible via le bottom nav (onglet Profil > Mes cercles). Les 3 actions restantes : Nouveau souvenir, Chronologie, Arbre genealogique.

### 2. Simplifier les QuickActions (moins voyantes)

Remplacer les grosses cartes colorees 2x2 sur mobile par une **ligne horizontale scrollable** de boutons compacts (icone + label, sans description, sans decorations). Hauteur reduite de ~250px a ~60px.

### 3. Remonter les souvenirs recents

Nouvel ordre dans `Dashboard.tsx` :
1. Message de bienvenue
2. Onboarding (conditionnel)
3. **QuickActions** (ligne compacte)
4. **StatsCards** (barre de stats)
5. **RecentCapsules** (remonte ici, directement visible)
6. **GuidedMemoryPrompts** (descend ici)
7. StorageProgress + FamilyTreeCard/PremiumPromo

### 4. Rendre les suggestions plus discretes

Dans `Dashboard.tsx`, retirer le wrapper `p-6 rounded-2xl bg-card border` autour de `GuidedMemoryPrompts` et dans le composant lui-meme :
- Reduire le header (icone 14x14 vers 10x10, titre plus petit)
- Masquer la barre de progression globale par defaut sur mobile
- Reduire les cartes de categories (icones 14x14 vers 10x10, padding reduit)

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/dashboard/QuickActions.tsx` | Retirer "Cercles", transformer le mobile en ligne horizontale compacte |
| `src/pages/Dashboard.tsx` | Reordonner : RecentCapsules avant GuidedMemoryPrompts, alleger le wrapper des suggestions |
| `src/components/dashboard/GuidedMemoryPrompts.tsx` | Header et categories plus compacts |

## Resultat attendu

Sur mobile, l'utilisateur verra ses souvenirs recents des le premier scroll, sans avoir a traverser de grosses cartes colorees. Les suggestions restent accessibles mais ne dominent plus la page.

