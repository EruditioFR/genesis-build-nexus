
# Restructuration de l'éditeur de souvenirs en 5 étapes

## Résumé des changements

L'éditeur passera de 4 étapes à **5 étapes** avec une nouvelle organisation :

| Étape | Nom actuel | Nouveau nom | Contenu |
|-------|------------|-------------|---------|
| 1 | Donnez un titre | **Donnez un titre** (inchangé) | Titre + description |
| 2 | Ajoutez du contenu | **Ajoutez du texte** | Uniquement le champ texte |
| 3 | *(nouveau)* | **Ajoutez des médias** | Menu visuel avec icônes (Photos, Vidéos, Audio) |
| 4 | Organisez | **Organisez** (inchangé) | Catégorie, date, mots-clés |
| 5 | Vérifiez et publiez | **Vérifiez et publiez** (inchangé) | Récapitulatif |

---

## Nouvelle étape 3 : Menu des médias

### Interface utilisateur

Un menu visuel avec 3 cartes cliquables :

```text
+--------------------------------------------------+
|  Ajoutez des médias                              |
|  Enrichissez votre souvenir avec des fichiers    |
+--------------------------------------------------+
|                                                  |
|  +-----------+  +-----------+  +-----------+     |
|  |   📷      |  |   🎬      |  |   🎙️      |     |
|  |  Photos   |  |  Vidéos   |  |   Audio   |     |
|  | (libre)   |  | (Premium) |  | (Premium) |     |
|  +-----------+  +-----------+  +-----------+     |
|                                                  |
|  [Cartes grisées avec cadenas si non abonné]     |
|                                                  |
+--------------------------------------------------+
```

### Comportement des cartes

1. **Photos** (toujours accessible)
   - Au clic → Ouvre la zone de dépôt de photos
   - Affiche un compteur si des photos sont déjà ajoutées

2. **Vidéos** (Premium requis)
   - Si abonné → Ouvre le sélecteur vidéo (upload ou YouTube)
   - Si non abonné → Carte grisée avec badge "Premium" et lien "Passer Premium"

3. **Audio** (Premium requis)
   - Si abonné → Ouvre l'enregistreur audio
   - Si non abonné → Carte grisée avec badge "Premium" et lien "Passer Premium"

### États visuels

- **Carte accessible** : fond blanc, hover animé, icône colorée
- **Carte verrouillée** : fond grisé, icône cadenas, badge "Premium", lien de mise à niveau
- **Carte avec contenu** : badge vert avec compteur ("3 photos", "1 vidéo")

---

## Sections médias épurées

Quand l'utilisateur clique sur une carte média, une section s'ouvre avec **uniquement le composant pertinent** :

### Section Photos (au clic sur la carte Photos)
```text
+------------------------------------------+
|  ← Retour au menu                        |
+------------------------------------------+
|                                          |
|  [Zone de dépôt de fichiers images]      |
|  Glissez-déposez ou cliquez              |
|                                          |
|  [Liste des photos ajoutées]             |
|                                          |
+------------------------------------------+
```

### Section Vidéos (au clic sur la carte Vidéos)
```text
+------------------------------------------+
|  ← Retour au menu                        |
+------------------------------------------+
|                                          |
|  [Toggle: Charger une vidéo | YouTube]   |
|                                          |
|  Si "Charger" :                          |
|     [Zone de dépôt vidéo uniquement]     |
|                                          |
|  Si "YouTube" :                          |
|     [Champ de saisie URL YouTube]        |
|                                          |
+------------------------------------------+
```

### Section Audio (au clic sur la carte Audio)
```text
+------------------------------------------+
|  ← Retour au menu                        |
+------------------------------------------+
|                                          |
|  [Composant AudioRecorder]               |
|     - Bouton d'enregistrement            |
|     - Visualisation de forme d'onde      |
|     - Contrôles de lecture               |
|                                          |
|  [Liste des enregistrements ajoutés]     |
|                                          |
+------------------------------------------+
```

---

## Détails techniques

### Fichiers modifiés

1. **`src/components/capsule/SeniorFriendlyEditor.tsx`**
   - Ajouter une 5e étape dans le tableau `STEPS`
   - Modifier l'étape 2 pour ne garder que le champ texte
   - Créer le nouveau composant `MediaMenuStep` pour l'étape 3
   - Créer les sous-composants `PhotoEditor`, `VideoEditor`, `AudioEditor`
   - Utiliser `useFeatureAccess` pour griser les options Premium
   - État local `activeMediaSection` pour gérer la section ouverte

2. **`public/locales/*/capsules.json`** (FR, EN, ES, KO, ZH)
   - Nouvelles clés de traduction :
     - `seniorEditor.step2Label` → "Ajoutez du texte"
     - `seniorEditor.step3Label` → "Ajoutez des médias"
     - `seniorEditor.step4Label` → "Organisez"
     - `seniorEditor.step5Label` → "Vérifiez et publiez"
     - `seniorEditor.textStepTitle` → "Écrivez votre texte"
     - `seniorEditor.textStepDesc` → description de l'étape texte
     - `seniorEditor.mediaStepTitle` → "Ajoutez des médias"
     - `seniorEditor.mediaStepDesc` → description de l'étape médias
     - `seniorEditor.mediaMenu.photos/videos/audio` → titres et descriptions
     - `seniorEditor.mediaMenu.locked` → message pour fonctionnalités verrouillées
     - `seniorEditor.mediaMenu.backToMenu` → "Retour au menu"

### Structure du code

```tsx
// Nouveau tableau STEPS avec 5 étapes
const STEPS = [
  { id: 'title', icon: FileText, ... },
  { id: 'text', icon: PenLine, ... },     // Nouveau
  { id: 'media', icon: Image, ... },      // Nouveau
  { id: 'details', icon: FolderOpen, ... },
  { id: 'finish', icon: Check, ... },
];

// État pour gérer la section média active
const [activeMediaSection, setActiveMediaSection] = useState<
  'menu' | 'photos' | 'videos' | 'audio'
>('menu');

// Composant MediaMenu avec cartes cliquables
const MediaMenu = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <MediaCard 
      icon={Image} 
      title="Photos" 
      count={photoFiles.length}
      locked={false}
      onClick={() => setActiveMediaSection('photos')}
    />
    <MediaCard 
      icon={Video} 
      title="Vidéos" 
      count={videoFiles.length + (youtubeUrl ? 1 : 0)}
      locked={!canUseVideo}
      upgradePath="premium"
      onClick={() => setActiveMediaSection('videos')}
    />
    <MediaCard 
      icon={Mic} 
      title="Audio" 
      count={audioFiles.length}
      locked={!canUseAudio}
      upgradePath="premium"
      onClick={() => setActiveMediaSection('audio')}
    />
  </div>
);
```

### Filtrage des fichiers par type

Dans `UnifiedMediaSection`, on utilisera un nouveau prop `filterType` pour n'afficher que les fichiers du type concerné :

```tsx
// Pour la section Photos uniquement
<UnifiedMediaSection
  userId={userId}
  files={mediaFiles.filter(f => f.type === 'image')}
  onFilesChange={(newFiles) => {
    // Garder les autres types, remplacer les images
    const otherFiles = mediaFiles.filter(f => f.type !== 'image');
    onMediaFilesChange([...otherFiles, ...newFiles]);
  }}
  acceptedTypes={['image/*']}
  showTextSection={false}
/>
```

---

## Accessibilité et UX seniors

- **Grandes cartes** (min-h-32) avec icônes de 48px
- **Labels clairs** en police large (text-xl)
- **Feedback visuel** : badge vert avec compteur quand du contenu est ajouté
- **Bouton retour** bien visible en haut de chaque section média
- **Transitions douces** avec Framer Motion entre le menu et les sections
