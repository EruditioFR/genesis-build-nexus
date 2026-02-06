
# Refonte complète de l'éditeur de souvenir

## Problemes identifies

### Problemes UX
1. **Etapes horizontales peu lisibles** : Les indicateurs d'etapes sont en ligne horizontale avec de petites icones, difficiles a suivre pour les personnes agees
2. **Absence de branding** : Aucun rappel du logo ou du nom "FamilyGarden", l'utilisateur peut se sentir perdu
3. **Sections accordeon complexes** : Les accordeons a l'interieur des etapes ajoutent de la confusion
4. **Boutons de navigation peu visibles** : Le bouton "Continuer" en bas est standard, pas assez mis en valeur

### Problemes UI
1. **Design terne** : Fond gris/blanc uniforme, manque de couleur et de chaleur
2. **Icones generiques** : Les icones d'etapes sont toutes dans des carres identiques sans distinction visuelle
3. **Pas d'animation engageante** : Les transitions sont minimales et peu encourageantes
4. **Manque de retour visuel** : Peu de feedback quand une section est completee

### Bug potentiel
- La propagation d'evenements dans les accordeons peut encore causer des problemes de focus

## Solution proposee

### 1. Nouvelle structure de navigation verticale

```text
+------------------------------------------+
|  [Logo] FamilyGarden                     |
|  "Nouveau souvenir"                      |
+------------------------------------------+
|                                          |
|  Etapes (verticales, a gauche)           |
|  =====================================   |
|                                          |
|   [1] Titre        ← Etape active        |
|       ✓ Complete                         |
|       |                                  |
|   [2] Ajouter des medias                 |
|       |                                  |
|   [3] Organiser                          |
|       |                                  |
|   [4] Terminer                           |
|                                          |
+------------------------------------------+
|                                          |
|    Zone de contenu principal             |
|    (formulaire de l'etape active)        |
|                                          |
+------------------------------------------+
|  [Retour]          [Continuer →]         |
+------------------------------------------+
```

### 2. Refonte du header avec branding

- **Logo + "FamilyGarden"** toujours visible en haut
- **Titre contextuel** : "Nouveau souvenir" avec l'etape actuelle
- **Barre de progression** coloree et animee (degrade or/terracotta)
- **Couleur d'arriere-plan chaleureuse** : gradient-warm du design system

### 3. Indicateurs d'etapes verticaux (sidebar ou en haut sur mobile)

- **Numeros cerclés** avec couleur de fond dynamique
- **Labels explicites** pour chaque etape
- **Badge de completion** (checkmark vert quand valide)
- **Ligne de connexion** entre les etapes pour visualiser la progression
- **Animation de pulse** sur l'etape active

### 4. Palette de couleurs et animations

- **Etape 1 (Titre)** : Bleu nuit `--primary` avec animation fade-in
- **Etape 2 (Medias)** : Terracotta `--accent` avec animation slide-up
- **Etape 3 (Details)** : Or chaud `--secondary` avec animation slide-up
- **Etape 4 (Terminer)** : Vert validation avec confetti subtil

### 5. Simplification du contenu des etapes

- **Suppression des accordeons** dans les etapes de contenu
- **Affichage direct** des champs de formulaire avec espacement genereux
- **Cartes distinctes** pour chaque type de contenu (texte / photos / YouTube)
- **Transitions fluides** entre les sections

### 6. Boutons d'action ameliores

- **Bouton principal** : Grand, colore avec gradient, icone animee
- **Bouton secondaire** : Style outline clair
- **Bouton de retour** : Texte simple avec fleche
- **Feedback au survol** : Effet de scale et shadow

## Fichiers a modifier

### `src/components/capsule/SeniorFriendlyEditor.tsx`
Refonte complete du composant avec :
- Header avec logo et branding
- Navigation verticale des etapes
- Suppression des accordeons internes
- Nouvelles couleurs par etape
- Animations Framer Motion ameliorees
- Correction des bugs de focus

### Nouveaux tokens de traduction
Ajout dans `public/locales/*/capsules.json` :
- `seniorEditor.createMemory` : "Nouveau souvenir"
- `seniorEditor.step1Label` : "Donnez un titre"
- `seniorEditor.step2Label` : "Ajoutez du contenu"
- `seniorEditor.step3Label` : "Organisez"
- `seniorEditor.step4Label` : "Verifiez et publiez"

## Details techniques

### Structure du nouveau composant

```tsx
// Header avec branding
<header className="...">
  <div className="flex items-center gap-3">
    <img src={logo} alt="FamilyGarden" className="w-10 h-10" />
    <span className="font-display font-semibold">
      Family<span className="text-secondary">Garden</span>
    </span>
  </div>
  <h1>{t('seniorEditor.createMemory')}</h1>
</header>

// Navigation verticale des etapes
<nav className="flex flex-col gap-4">
  {STEPS.map((step, i) => (
    <StepIndicator 
      number={i + 1}
      label={step.label}
      isActive={currentStep === i}
      isCompleted={i < currentStep}
      color={step.color}
    />
  ))}
</nav>

// Contenu de l'etape (sans accordeons)
<main className="flex-1">
  <AnimatePresence mode="wait">
    <motion.div key={currentStep}>
      {renderStepContent()}
    </motion.div>
  </AnimatePresence>
</main>
```

### Configuration des etapes avec couleurs

```tsx
const STEPS = [
  { 
    id: 'title', 
    icon: FileText, 
    labelKey: 'seniorEditor.step1Label',
    color: 'primary',      // Bleu nuit
    bgClass: 'bg-primary/10'
  },
  { 
    id: 'media', 
    icon: Image, 
    labelKey: 'seniorEditor.step2Label',
    color: 'accent',       // Terracotta
    bgClass: 'bg-accent/10'
  },
  { 
    id: 'organize', 
    icon: FolderOpen, 
    labelKey: 'seniorEditor.step3Label',
    color: 'secondary',    // Or chaud
    bgClass: 'bg-secondary/10'
  },
  { 
    id: 'finish', 
    icon: Check, 
    labelKey: 'seniorEditor.step4Label',
    color: 'green-600',
    bgClass: 'bg-green-100'
  },
];
```

### Animations Framer Motion

```tsx
// Animation d'entree pour chaque etape
const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -10 }
};

// Pulse sur l'etape active
const pulseVariants = {
  initial: { scale: 1 },
  pulse: { 
    scale: [1, 1.05, 1],
    transition: { duration: 1.5, repeat: Infinity }
  }
};
```

### Correction du bug de focus

```tsx
// Isoler completement les evenements dans les zones de saisie
<div 
  className="space-y-6"
  onKeyDown={(e) => {
    // Empecher la propagation des touches speciales
    if (['Enter', ' ', 'Tab'].includes(e.key)) {
      e.stopPropagation();
    }
  }}
>
  <Textarea 
    value={content}
    onChange={(e) => onContentChange(e.target.value)}
    onFocus={() => setIsTyping(true)}
    onBlur={() => setIsTyping(false)}
  />
</div>
```

## Resume des ameliorations

| Aspect | Avant | Apres |
|--------|-------|-------|
| Navigation | Horizontale, petites icones | Verticale, numeros et labels clairs |
| Branding | Absent | Logo + "FamilyGarden" toujours visible |
| Couleurs | Grises uniformes | Palette chaude (or, terracotta, bleu nuit) |
| Animations | Basiques | Transitions fluides, feedback visuel |
| Structure | Accordeons imbriques | Contenu direct, cartes distinctes |
| Boutons | Standards | Grands, colores, avec icones animees |
| Accessibilite | Basique | Optimisee seniors (grandes cibles, contraste) |
