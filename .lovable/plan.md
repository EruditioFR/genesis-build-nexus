
# Correction des éditeurs Photo et Vidéo

## Problème identifié

Le composant `UnifiedMediaSection` affiche **toujours les 4 sections** (Texte, Photos, Vidéos, Audio) via des `Collapsible`. Même si `PhotoEditorSection` et `VideoEditorSection` filtrent les fichiers par type avant de les passer au composant, `UnifiedMediaSection` réaffiche toutes les sections internes.

## Solution

Ajouter une nouvelle prop `acceptedMediaTypes` au composant `UnifiedMediaSection` pour contrôler quelles sections sont visibles :

| Éditeur | Prop `acceptedMediaTypes` | Sections affichées |
|---------|--------------------------|-------------------|
| Photos | `['image']` | Zone de dépôt photos uniquement |
| Vidéos | `['video']` | Zone de dépôt vidéos uniquement |
| Audio | *(non concerné, utilise `AudioRecorder` directement)* | - |

## Fichiers à modifier

### 1. `src/components/capsule/UnifiedMediaSection.tsx`

**Ajout d'une nouvelle prop :**
```tsx
interface UnifiedMediaSectionProps {
  // ... props existantes
  acceptedMediaTypes?: ('image' | 'video' | 'audio')[];
}
```

**Modification du rendu :**
- Si `acceptedMediaTypes` est défini, n'afficher que les sections correspondantes
- Par défaut (prop absente), afficher toutes les sections comme actuellement

### 2. `src/components/capsule/SeniorFriendlyEditor.tsx`

**PhotoEditorSection :**
- Passer `acceptedMediaTypes={['image']}` à `UnifiedMediaSection`
- Résultat : seule la zone de dépôt photos s'affiche

**VideoEditorSection :**
- Passer `acceptedMediaTypes={['video']}` à `UnifiedMediaSection`
- Résultat : seule la zone de dépôt vidéos s'affiche (sans les Collapsibles)

## Détails techniques

### Modification de UnifiedMediaSection.tsx

```tsx
// Interface mise à jour
interface UnifiedMediaSectionProps {
  // ... autres props
  acceptedMediaTypes?: ('image' | 'video' | 'audio')[];
}

// Dans le composant
const UnifiedMediaSection = ({
  // ... autres props
  acceptedMediaTypes,
}: UnifiedMediaSectionProps) => {
  
  // Helpers pour savoir quoi afficher
  const showPhotos = !acceptedMediaTypes || acceptedMediaTypes.includes('image');
  const showVideos = !acceptedMediaTypes || acceptedMediaTypes.includes('video');
  const showAudio = !acceptedMediaTypes || acceptedMediaTypes.includes('audio');
  
  // Mode simplifié : une seule section sans Collapsible
  const isSingleMode = acceptedMediaTypes?.length === 1;

  return (
    <div className="...">
      {/* Photos - Affichage simple si mode unique */}
      {showPhotos && (
        isSingleMode ? (
          <>
            {renderDropZone(imageAcceptedTypes, false, null, '')}
            {renderFileList(photoFiles, '')}
          </>
        ) : (
          <Collapsible>...</Collapsible>
        )
      )}
      
      {/* Vidéos */}
      {showVideos && (
        isSingleMode ? (
          <>
            {renderDropZone(videoAcceptedTypes, !canUseVideo, videoUpgradePath, '...')}
            {canUseVideo && renderFileList(videoFiles, '')}
          </>
        ) : (
          <Collapsible>...</Collapsible>
        )
      )}
      
      {/* Audio */}
      {showAudio && (
        // ... logique existante
      )}
    </div>
  );
};
```

### Modification de SeniorFriendlyEditor.tsx

**PhotoEditorSection :**
```tsx
<UnifiedMediaSection
  userId={userId}
  content=""
  onContentChange={() => {}}
  showTextSection={false}
  files={imageFiles}
  onFilesChange={handleImageFilesChange}
  maxFiles={20}
  onUploadAll={onUploadAllRef}
  hasError={hasMediaError}
  acceptedMediaTypes={['image']}  // ← Nouveau
/>
```

**VideoEditorSection :**
```tsx
<UnifiedMediaSection
  userId={userId}
  content=""
  onContentChange={() => {}}
  showTextSection={false}
  files={videoFiles}
  onFilesChange={handleVideoFilesChange}
  maxFiles={5}
  onUploadAll={onUploadAllRef}
  hasError={hasMediaError}
  acceptedMediaTypes={['video']}  // ← Nouveau
/>
```

## Résultat attendu

| Éditeur | Avant | Après |
|---------|-------|-------|
| Photos | 4 sections affichées | Zone de dépôt photos uniquement |
| Vidéos | 4 sections affichées | Toggle YouTube/Upload + zone vidéo |
| Audio | ✓ OK | ✓ Inchangé |
