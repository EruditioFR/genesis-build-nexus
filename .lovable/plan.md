

## Plan: Remplacer la vidéo du slide "Vie personnelle" par une scène de mariage

### Contexte
Le slide 5 ("Vie personnelle" — "Quel moment a changé le cours de votre vie ?") utilise actuellement la vidéo `vie-video.mp4`. Elle sera remplacée par une vidéo de mariage générée par IA.

### Etapes

1. **Générer une vidéo de mariage** via l'outil de génération vidéo IA :
   - Scène : couple européen lors d'une cérémonie de mariage, ambiance lumineuse et romantique (extérieur ou intérieur élégant), confettis ou pétales
   - Durée : 5 secondes, 1080p, format paysage
   - Style réaliste, cohérent avec les autres vidéos du slider

2. **Remplacer l'asset** `src/assets/inspirations/vie-video.mp4.asset.json` avec la nouvelle URL

Aucune modification de code nécessaire — le composant `HeroSectionV2` référence déjà ce fichier.

