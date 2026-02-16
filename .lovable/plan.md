

# Simplifier le parcours de creation mobile

## Probleme actuel

Le wizard mobile (`MobileCapsuleWizard.tsx`) utilise actuellement :
- **Header ~130px** : bouton retour, compteur d'etapes, barre de progression epaisse (h-3), puis 4 indicateurs d'etapes avec icones 48x48 et labels texte
- **Footer fixe ~80px** : bouton "Continuer" pleine largeur, hauteur 64px
- **Sur un ecran de ~700px avec clavier (~300px)**, il reste environ **190px** pour le contenu -- quasi inutilisable

## Solution proposee : header compact + bouton inline

### 1. Header ultra-compact (une seule ligne, ~48px)

Remplacer le header actuel (bouton retour + compteur + barre de progression + 4 icones avec labels) par une seule ligne :

```
[<- Retour]   ● ● ○ ○   [2/4]
              ━━━━━━━━━
```

- Bouton retour a gauche (icone seule, sans texte)
- 4 petits dots (8px) au centre : remplis = fait, vide = a venir, actif = accent
- Compteur "2/4" a droite
- Fine barre de progression en dessous (h-1.5 au lieu de h-3)
- Suppression des icones 48x48 et des labels texte des etapes

### 2. Supprimer le footer fixe

Le bouton "Continuer" ne sera plus fixe en bas de l'ecran. Il sera place **directement apres le contenu de l'etape**, dans le flux normal de la page.

- Quand le clavier est ouvert, l'utilisateur scrolle naturellement vers le bouton
- Quand le clavier est ferme, le bouton est visible sous les champs
- Le bouton reste grand (h-14) pour les seniors

### 3. Reduire les titres d'etapes

- Supprimer les blocs "titre + sous-titre + icone decorative" en haut de chaque etape (case 0 : le bloc de 100px avec l'icone Sparkles 80x80)
- Les remplacer par un simple titre en une ligne

### 4. Padding reduit

- Passer le padding du contenu de `px-5 py-8 pb-36` a `px-4 py-4 pb-8`
- Reduire les `space-y-8` a `space-y-4` dans les formulaires

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/capsule/MobileCapsuleWizard.tsx` | Refonte du header (dots), bouton inline, titres compacts, padding reduit |

## Gains d'espace estimes

| Element | Avant | Apres |
|---------|-------|-------|
| Header | ~130px | ~48px |
| Footer fixe | ~80px | 0px |
| Titre decoratif etape 1 | ~100px | ~30px |
| **Total economise** | | **~230px** |

Avec le clavier ouvert (~300px sur iPhone), l'espace disponible pour le contenu passe de **~190px a ~420px** -- suffisant pour voir le champ actif et le bouton "Continuer".

