
# Simplifier le parcours de creation mobile

## Probleme actuel

Le wizard mobile utilise ~130px de header (bouton retour + compteur + barre h-3 + 4 icones 48x48 avec labels) et ~80px de footer fixe. Avec le clavier ouvert (~300px), il ne reste que ~190px pour le contenu.

## Modifications sur `MobileCapsuleWizard.tsx`

### 1. Header compact (une seule ligne ~48px)

Remplacer le header actuel par :
- Bouton retour (icone seule) a gauche
- 4 dots (8px) au centre : rempli = fait, vide = a venir, actif = couleur accent
- Compteur "2/4" a droite
- Fine barre de progression h-1.5 en dessous
- Suppression des icones 48x48 et labels texte

### 2. Supprimer le footer fixe

Le bloc `fixed bottom-0` avec le bouton "Continuer" sera supprime. Le bouton sera place directement apres le contenu de chaque etape (inline dans le flux). Il reste grand (h-14) pour l'accessibilite seniors.

### 3. Titres d'etapes compacts

- Etape 0 : supprimer le bloc decoratif (icone Sparkles 80x80 + titre + sous-titre). Garder juste un titre en une ligne.
- Etapes 1, 2 : supprimer les blocs titre/sous-titre centres, garder un simple titre.
- Etape 3 (review) : reduire le bloc decoratif.

### 4. Padding reduit

- Contenu : de `px-5 py-8 pb-36` a `px-4 py-4 pb-8`
- Espacements internes : de `space-y-8` a `space-y-4`

## Gains estimes

| Element | Avant | Apres |
|---------|-------|-------|
| Header | ~130px | ~48px |
| Footer fixe | ~80px | 0px |
| Titre decoratif | ~100px | ~24px |
| **Total economise** | | **~240px** |

Espace disponible avec clavier : ~190px vers ~430px.

## Fichier modifie

`src/components/capsule/MobileCapsuleWizard.tsx`
