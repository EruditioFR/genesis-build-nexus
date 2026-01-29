

# Plan : Section "Cas d'usage" sur la Landing Page

## Objectif
Ajouter une nouvelle section visuellement attractive montrant des exemples concrets d'utilisation de FamilyGarden : mariage, anniversaire, voyages, etudes, playlist. Cette section reutilisera les images deja presentes dans le slider du hero.

---

## Positionnement
La section sera placee entre **HeroSection** et **FeaturesSection**, car elle presente des cas concrets avant de detailler les fonctionnalites techniques.

---

## Design propose

### Structure visuelle
- Fond ecru (#f5f0e8) pour continuer le style doux et senior-friendly
- Grille de 5 cartes interactives avec les images existantes
- Chaque carte affiche :
  - L'image en arriere-plan avec overlay gradie
  - Un titre accrocheur (ex: "Votre Mariage")
  - Une courte description (1-2 phrases)
  - Une icone thematique

### Mise en page responsive
- Desktop : 5 cartes en ligne ou grille 3+2
- Tablette : grille 2+2+1
- Mobile : carrousel horizontal ou empilement vertical

---

## Cas d'usage prevus

| Cas | Image existante | Titre FR | Description |
|-----|-----------------|----------|-------------|
| Mariage | mariage.jpeg | Votre Mariage | Preservez chaque instant de ce jour unique : la ceremonie, les discours, les rires et les larmes de joie. |
| Anniversaire | anniversaire.jpeg | Vos Anniversaires | Des bougies soufflees aux cadeaux surprises, gardez la memoire des celebrations familiales. |
| Voyages | voyages.jpeg | Vos Voyages | Revivez vos aventures familiales : paysages, decouvertes et moments de complicite. |
| Etudes | etudes.jpeg | Vos Etudes | Diplomes, remises de prix, rentrees scolaires : documentez le parcours de chaque membre. |
| Playlist | playlist.jpeg | Vos Playlists | Associez musiques et souvenirs : les chansons qui ont marque votre histoire familiale. |

---

## Fichiers a creer/modifier

### 1. Nouveau composant
**`src/components/landing/UseCasesSection.tsx`**
- Import des images depuis `src/assets/hero-slides/`
- Animation Framer Motion au scroll
- Traductions via react-i18next

### 2. Fichiers de traduction (5 langues)
Ajouter une cle `useCases` dans :
- `public/locales/fr/landing.json`
- `public/locales/en/landing.json`
- `public/locales/es/landing.json`
- `public/locales/zh/landing.json`
- `public/locales/ko/landing.json`

Structure de traduction :
```json
"useCases": {
  "badge": "Cas d'usage",
  "title": "Pour tous vos",
  "titleHighlight": "moments de vie",
  "subtitle": "Decouvrez comment FamilyGarden vous accompagne...",
  "items": {
    "wedding": { "title": "Votre Mariage", "description": "..." },
    "birthday": { "title": "Vos Anniversaires", "description": "..." },
    "travels": { "title": "Vos Voyages", "description": "..." },
    "studies": { "title": "Vos Etudes", "description": "..." },
    "playlist": { "title": "Vos Playlists", "description": "..." }
  }
}
```

### 3. Integration dans la page
**`src/pages/Index.tsx`**
- Import lazy du nouveau composant
- Placement entre HeroSection et FeaturesSection

---

## Details techniques

### Animations
- Fade-in + slide-up au scroll (viewport: once)
- Effet hover : leger zoom sur l'image + ombre portee
- Transition douce sur les cartes (duration: 0.3s)

### Accessibilite
- Alt text sur chaque image
- Contraste suffisant texte/fond
- Focus visible sur les cartes cliquables

### Performance
- Lazy loading du composant (comme les autres sections)
- Images deja optimisees (JPEG)

---

## Estimation
- 1 nouveau fichier composant (~150 lignes)
- 5 fichiers de traduction a mettre a jour
- 1 modification legere dans Index.tsx

