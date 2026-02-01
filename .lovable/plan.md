
# Plan : Suppression de la selection de type et mode multi-contenu

## Objectif
Transformer le flux de creation de souvenir pour supprimer l'etape de selection du type. L'utilisateur pourra ajouter librement du texte, des photos, des videos et de l'audio dans un meme souvenir, selon les limites de son forfait.

---

## Changements conceptuels

### Avant
1. L'utilisateur choisit un type (texte, photo, video, audio, mixte)
2. Le type limite les medias acceptes
3. L'etape media est sautee pour les souvenirs "texte"

### Apres
1. L'utilisateur commence directement par le contenu (titre, description, texte)
2. Une section "Contenus" unifiee permet d'ajouter tous les types de medias disponibles selon le forfait
3. Le type de la capsule est determine automatiquement au moment de la sauvegarde selon les contenus ajoutes

---

## Regles de determination du type automatique

| Contenus ajoutes | Type sauvegarde |
|------------------|-----------------|
| Texte uniquement | `text` |
| Photos uniquement | `photo` |
| Videos uniquement | `video` |
| Audio uniquement | `audio` |
| Mix de plusieurs types | `mixed` |

---

## Fichiers a modifier

### 1. `src/components/capsule/MediaUpload.tsx`
**Modifications :**
- Ajouter des sections distinctes pour chaque type de media (photos, videos, audio)
- Afficher les restrictions de forfait avec des cadenas sur les sections non disponibles
- Permettre l'ajout de texte enrichi directement dans ce composant ou le laisser separe
- Toujours afficher les zones de depot pour tous les types disponibles

### 2. `src/pages/CapsuleCreate.tsx`
**Modifications :**
- Supprimer le state `capsuleType` gere par l'utilisateur
- Supprimer le composant `CapsuleTypeSelector` de l'interface
- Supprimer la condition `capsuleType !== 'text'` pour afficher les medias
- Ajouter une logique `determineContentType()` qui calcule le type automatiquement avant sauvegarde
- Mettre a jour la logique de sauvegarde pour utiliser le type determine

### 3. `src/components/capsule/MobileCapsuleWizard.tsx`
**Modifications :**
- Supprimer l'etape "type" du wizard (passer de 5 a 4 etapes)
- Fusionner les etapes "info" et "media" en une seule etape "contenu"
- Adapter la navigation (plus besoin de sauter l'etape media)
- Supprimer les props `capsuleType` et `onCapsuleTypeChange`

### 4. `src/pages/CapsuleEdit.tsx`
**Modifications :**
- Memes changements que `CapsuleCreate.tsx`
- Supprimer la selection de type
- Calculer le type au moment de la sauvegarde

### 5. Nouveau composant : `src/components/capsule/UnifiedMediaSection.tsx`
**Creation :**
Un nouveau composant qui remplace `MediaUpload` avec :
- Zone de texte enrichi
- Section Photos (disponible Free et plus)
- Section Videos (Premium+ avec cadenas pour Free)
- Section Audio (Premium+ avec cadenas pour Free)
- Enregistreur audio integre (Premium+)
- Messages d'upgrade pour les fonctionnalites bloquees

### 6. Fichiers de traduction
**Modifications :**
- Supprimer les cles liees a la selection de type
- Ajouter des cles pour les sections de contenu unifie
- Ajouter des messages d'upgrade pour les types restreints

---

## Interface utilisateur proposee

```text
+------------------------------------------+
| CREER UN SOUVENIR                        |
+------------------------------------------+
| Categorie    [Voyages v]                 |
+------------------------------------------+
| Titre *      [Mon voyage en Italie     ] |
| Description  [3 semaines inoubliables  ] |
+------------------------------------------+
| CONTENUS                                 |
|                                          |
| [+] Texte                                |
|     [Zone de texte enrichi...]           |
|                                          |
| [+] Photos                               |
|     [Glissez vos photos ici ou cliquez]  |
|     [photo1.jpg] [photo2.jpg]            |
|                                          |
| [+] Videos          [PREMIUM]            |
|     [Debloquer les videos - Voir forfaits]|
|                                          |
| [+] Audio           [PREMIUM]            |
|     [Debloquer l'audio - Voir forfaits]  |
+------------------------------------------+
| Date du souvenir   [15 juin 2023]        |
| Tags               [#voyage #italie]     |
+------------------------------------------+
| [Brouillon]  [Publier]                   |
+------------------------------------------+
```

---

## Logique de determination du type

```typescript
const determineContentType = (
  content: string,
  mediaFiles: MediaFile[]
): CapsuleType => {
  const hasText = content.trim().length > 0;
  const hasPhotos = mediaFiles.some(f => f.type === 'image');
  const hasVideos = mediaFiles.some(f => f.type === 'video');
  const hasAudio = mediaFiles.some(f => f.type === 'audio');
  
  const mediaTypeCount = [hasPhotos, hasVideos, hasAudio].filter(Boolean).length;
  
  // Multiple media types = mixed
  if (mediaTypeCount > 1) return 'mixed';
  
  // Single media type
  if (hasVideos) return 'video';
  if (hasAudio) return 'audio';
  if (hasPhotos) return 'photo';
  
  // Text only
  return 'text';
};
```

---

## Gestion des restrictions de forfait

Le hook `useFeatureAccess` sera utilise pour :
- Afficher/masquer les sections selon le forfait
- Afficher des cadenas et boutons d'upgrade
- Valider a la sauvegarde que l'utilisateur a le droit d'ajouter ce type de contenu

Exemple de validation :
```typescript
// Avant sauvegarde
if (hasVideos && !canCreateCapsuleType('video')) {
  toast.error("Les videos necessitent le forfait Premium");
  return;
}
```

---

## Impact sur la base de donnees

**Aucune migration necessaire.**
- Le champ `capsule_type` reste inchange
- Le type est simplement determine automatiquement plutot que choisi manuellement
- Les souvenirs existants conservent leur type

---

## Etapes d'implementation

1. Creer le composant `UnifiedMediaSection.tsx`
2. Modifier `CapsuleCreate.tsx` pour utiliser le nouveau composant
3. Modifier `MobileCapsuleWizard.tsx` pour le flux mobile
4. Modifier `CapsuleEdit.tsx` pour l'edition
5. Supprimer `CapsuleTypeSelector.tsx` (ou le conserver pour usage futur)
6. Mettre a jour les traductions
7. Tester tous les parcours utilisateur

---

## Avantages de cette approche

- Experience utilisateur simplifiee (moins d'etapes)
- Plus de flexibilite dans la creation de souvenirs
- Coherence avec les attentes modernes (comme Instagram, Stories)
- Le systeme de forfait reste intact et bien visible
- Retro-compatible avec les souvenirs existants
