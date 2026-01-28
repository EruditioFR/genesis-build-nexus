
# Plan : Remplacement du sous-titre Hero

## Objectif
Remplacer le texte actuel du sous-titre de la section Hero par le nouveau texte poétique sur le thème du jardin familial.

## Texte actuel (FR)
> "Créez votre capsule mémorielle numérique et transmettez votre héritage familial aux générations futures. Textes, photos, vidéos, audio — tous vos souvenirs préservés dans un coffre-fort digital sécurisé avec chiffrement AES-256."

## Nouveau texte (FR)
> "Une famille est un jardin qui se cultive chaque jour. Avec FamilyGarden, ne laissez plus vos plus beaux instants s'envoler au vent. Enracinez vos souvenirs — récits, rires enregistrés, vidéos complices — dans un espace protégé qui vous ressemble. Vous êtes le gardien de ce patrimoine : décidez de ce qui reste dans votre jardin secret et de ce que vous souhaitez faire fleurir chez vos proches."

---

## Modifications prévues

### 1. Traduction française
**Fichier** : `public/locales/fr/landing.json`
- Ligne 9 : remplacer `hero.subtitle` par le nouveau texte

### 2. Traduction anglaise
**Fichier** : `public/locales/en/landing.json`
- Ligne 9 : traduire et adapter le nouveau texte en anglais

### 3. Traduction espagnole
**Fichier** : `public/locales/es/landing.json`
- Traduire et adapter le nouveau texte en espagnol

### 4. Traduction chinoise
**Fichier** : `public/locales/zh/landing.json`
- Traduire et adapter le nouveau texte en chinois

### 5. Traduction coréenne
**Fichier** : `public/locales/ko/landing.json`
- Traduire et adapter le nouveau texte en coréen

---

## Traductions proposées

| Langue | Texte |
|--------|-------|
| **FR** | Une famille est un jardin qui se cultive chaque jour. Avec FamilyGarden, ne laissez plus vos plus beaux instants s'envoler au vent. Enracinez vos souvenirs — récits, rires enregistrés, vidéos complices — dans un espace protégé qui vous ressemble. Vous êtes le gardien de ce patrimoine : décidez de ce qui reste dans votre jardin secret et de ce que vous souhaitez faire fleurir chez vos proches. |
| **EN** | A family is a garden that grows every day. With FamilyGarden, don't let your most precious moments slip away. Root your memories — stories, recorded laughter, shared videos — in a protected space that reflects who you are. You are the guardian of this heritage: decide what stays in your secret garden and what you wish to share with your loved ones. |
| **ES** | Una familia es un jardín que se cultiva cada día. Con FamilyGarden, no dejes que tus mejores momentos se escapen con el viento. Arraiga tus recuerdos — relatos, risas grabadas, vídeos cómplices — en un espacio protegido que te representa. Eres el guardián de este patrimonio: decide lo que permanece en tu jardín secreto y lo que deseas compartir con tus seres queridos. |
| **ZH** | 家庭是一座需要日日耕耘的花园。有了FamilyGarden，别再让最美好的时刻随风而逝。将你的回忆——故事、录下的笑声、温馨的视频——根植于一个专属于你的安全空间。你是这份遗产的守护者：决定什么留在你的秘密花园，什么与亲人分享。 |
| **KO** | 가족은 매일 가꾸어야 하는 정원입니다. FamilyGarden과 함께, 가장 소중한 순간들이 바람에 흩날리지 않게 하세요. 당신의 추억 — 이야기, 녹음된 웃음소리, 함께한 영상 — 을 당신만의 보호된 공간에 뿌리내리세요. 당신은 이 유산의 수호자입니다: 비밀의 정원에 간직할 것과 사랑하는 이들과 나눌 것을 결정하세요. |

---

## Détails techniques

Le texte est affiché dans `src/components/landing/HeroSection.tsx` à la ligne 122 via :
```tsx
{t('hero.subtitle')}
```

Aucune modification du composant React n'est nécessaire — seuls les fichiers de traduction JSON seront mis à jour.
