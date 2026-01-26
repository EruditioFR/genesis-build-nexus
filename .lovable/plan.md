

# Plan de correction : Upload audio systématiquement en échec

## Diagnostic

L'erreur survient lors de la publication d'un souvenir audio :
- L'utilisateur enregistre un message vocal
- Au clic sur "Publier", l'upload du fichier échoue avec une erreur réseau

### Causes identifiées

1. **Types MIME manquants dans CapsuleCreate.tsx**  
   Le composant `CapsuleCreate.tsx` passe une liste restrictive de types acceptés pour les souvenirs audio :
   ```typescript
   ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm']
   ```
   Il manque `audio/ogg` qui peut être généré par certains navigateurs.

2. **Changements non déployés**  
   Les correctifs précédents (ajout de `audio/webm`, `audio/ogg` dans `MediaUpload.tsx`, header `Content-Type`) ne sont probablement pas encore actifs sur le site publié.

3. **Erreur `storage_used_mb` en cascade**  
   L'erreur de type integer sur le Dashboard pouvait interrompre le flux utilisateur après sauvegarde.

---

## Plan de correction

### Étape 1 : Ajouter `audio/ogg` dans CapsuleCreate.tsx

Modifier la liste des types acceptés pour les souvenirs audio (ligne 516) :

```text
Avant : ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm']
Après : ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg']
```

### Étape 2 : Ajouter `audio/ogg` dans MobileCapsuleWizard.tsx

Même correction pour la version mobile (ligne 238) :

```text
Avant : ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm']
Après : ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg']
```

### Étape 3 : Ajouter un log d'erreur HTTP détaillé dans MediaUpload.tsx

Améliorer le diagnostic en cas d'échec d'upload en loggant le code HTTP et la réponse :

```typescript
// Dans le gestionnaire d'erreur XHR
xhr.addEventListener('load', () => {
  if (xhr.status >= 200 && xhr.status < 300) {
    resolve(fileName);
  } else {
    console.error('[MediaUpload] Upload failed:', {
      status: xhr.status,
      statusText: xhr.statusText,
      response: xhr.responseText
    });
    // ...
  }
});
```

### Étape 4 : Publier les changements

Une fois les corrections appliquées, publier le site pour que le site family-garden.lovable.app reflète les mises à jour.

---

## Résumé des fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `src/pages/CapsuleCreate.tsx` | Ajouter `audio/ogg` aux types acceptés |
| `src/components/capsule/MobileCapsuleWizard.tsx` | Ajouter `audio/ogg` aux types acceptés |
| `src/components/capsule/MediaUpload.tsx` | Ajouter log d'erreur HTTP détaillé |

---

## Détails techniques

Le composant `AudioRecorder` utilise `MediaRecorder` avec :
```typescript
mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
```

Ce MIME type est ensuite utilisé lors de l'upload. Si le navigateur génère un format non listé dans `acceptedTypes`, le fichier sera rejeté avant même l'upload.

