

# Plan de modification du Hero

## Résumé des modifications

Mise à jour du texte du Hero sur la landing page pour un messaging plus clair et orienté utilisateur, dans les 5 langues supportées (FR, EN, ES, KO, ZH).

## Changements par clé de traduction

| Clé | Avant (FR) | Après (FR) |
|-----|-----------|------------|
| `hero.badge` | Préservez vos souvenirs pour l'éternité | Créez votre journal de famille, simplement |
| `hero.title.prefix` | Vos souvenirs méritent | Les moments en famille méritent |
| `hero.title.highlight` | d'être préservés | d'être revécus |
| `hero.subtitle.line1` | Une famille est un jardin qui se cultive... | Photos, vidéos, textes, audios… rassemblez vos souvenirs au même endroit, avec du contexte et de l'émotion. |
| `hero.subtitle.line2` | Enracinez vos souvenirs... | Partagez en privé avec les grands-parents et les proches, sans les perdre dans 10 applis. |
| `hero.trust.encryption` | Chiffrement AES-256 | Données sécurisées |
| `hero.trust.gdpr` | Serveurs européens RGPD | Hébergement UE (RGPD) |
| `hero.trust.legacy` | Héritage familial | Cercles privés |

## Fichiers à modifier

1. **public/locales/fr/landing.json** - Version française principale
2. **public/locales/en/landing.json** - Version anglaise
3. **public/locales/es/landing.json** - Version espagnole
4. **public/locales/ko/landing.json** - Version coréenne
5. **public/locales/zh/landing.json** - Version chinoise

## Traductions proposées

### Anglais (EN)
- badge: "Create your family journal, simply"
- prefix: "Family moments deserve"
- highlight: "to be relived"
- line1: "Photos, videos, texts, audio… gather your memories in one place, with context and emotion."
- line2: "Share privately with grandparents and loved ones, without losing them across 10 apps."
- encryption: "Secure data"
- gdpr: "EU Hosting (GDPR)"
- legacy: "Private circles"

### Espagnol (ES)
- badge: "Crea tu diario familiar, simplemente"
- prefix: "Los momentos en familia merecen"
- highlight: "ser revividos"
- line1: "Fotos, vídeos, textos, audios… reúne tus recuerdos en un solo lugar, con contexto y emoción."
- line2: "Comparte en privado con los abuelos y seres queridos, sin perderlos en 10 aplicaciones."
- encryption: "Datos seguros"
- gdpr: "Alojamiento UE (RGPD)"
- legacy: "Círculos privados"

### Coréen (KO)
- badge: "가족 일기를 간단하게 만드세요"
- prefix: "가족의 순간은"
- highlight: "다시 경험할 가치가 있습니다"
- line1: "사진, 동영상, 텍스트, 오디오… 맥락과 감정을 담아 한 곳에 추억을 모으세요."
- line2: "조부모와 가족에게 비공개로 공유하세요. 10개의 앱에 흩어지지 않게."
- encryption: "안전한 데이터"
- gdpr: "EU 호스팅 (GDPR)"
- legacy: "비공개 서클"

### Chinois (ZH)
- badge: "轻松创建您的家庭日记"
- prefix: "家庭时刻值得"
- highlight: "被重温"
- line1: "照片、视频、文字、音频…将您的回忆汇集在一处，带着背景和情感。"
- line2: "私密分享给祖父母和亲人，不再散落在10个应用中。"
- encryption: "数据安全"
- gdpr: "欧盟托管 (GDPR)"
- legacy: "私密圈子"

---

## Détails techniques

Aucune modification de code n'est nécessaire dans le composant `HeroSection.tsx` car les clés de traduction restent identiques. Seul le contenu des fichiers JSON sera modifié.

