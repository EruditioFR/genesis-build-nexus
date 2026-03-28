

# Formulaire de satisfaction Beta Testeurs

## Objectif
Créer un formulaire multi-pages accessible aux utilisateurs connectés (forfait Héritage), pour recueillir les retours des beta testeurs sur toutes les fonctionnalités du site.

## Structure du formulaire (5 pages)

### Page 1 — Accueil & Remerciements
- Message de remerciement personnalisé (avec le prénom de l'utilisateur)
- Explication du but du formulaire
- Bouton "Commencer"

### Page 2 — Évaluation des fonctionnalités (notation 1-5 étoiles)
Questions basées sur les fonctionnalités existantes :
- Création de souvenirs (texte, photo)
- Navigation et ergonomie générale
- Timeline / chronologie
- Cercles de partage
- Arbre généalogique
- Catégories et sous-catégories
- Recherche globale
- Mode story
- Profil utilisateur
- Notifications
- Inspirations / suggestions de souvenirs

### Page 3 — Qualité de l'expérience utilisateur (notation 1-5)
- Facilité de prise en main
- Design et esthétique
- Rapidité de chargement
- Clarté des textes et instructions
- Expérience mobile
- Processus d'inscription
- Gestion des médias (upload photos/vidéos)

### Page 4 — Retours libres (zones de texte)
- Avis général sur le site (textarea)
- Problèmes rencontrés pendant le test (textarea)
- Fonctionnalités souhaitées / suggestions d'amélioration (textarea)
- Recommanderiez-vous Family Garden ? (oui/non + pourquoi)

### Page 5 — Confirmation
- Message de remerciement
- Résumé du nombre de réponses données
- Bouton retour au dashboard

## Architecture technique

1. **Migration DB** : Créer une table `beta_feedback` avec colonnes pour toutes les réponses (JSON pour les ratings, texte pour les champs libres), liée à `user_id`, avec RLS (seul l'utilisateur peut insérer/voir ses propres réponses, admins peuvent tout voir).

2. **Nouvelle page** : `src/pages/BetaFeedback.tsx` — formulaire multi-étapes avec state local, progress bar, navigation avant/arrière.

3. **Composants** :
   - `StarRating` — composant réutilisable de notation par étoiles
   - Utilisation des composants UI existants (Button, Textarea, Card, Progress)

4. **Route** : `/beta-feedback` ajoutée dans `App.tsx`

5. **Accès** : Lien depuis le dashboard (visible uniquement pour les utilisateurs Héritage), protégé par authentification.

6. **i18n** : Formulaire en français uniquement (ciblé beta testeurs FR).

7. **Admin** : Les admins pourront consulter les réponses via la vue admin existante ou une requête directe.

