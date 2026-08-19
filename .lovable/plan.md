# Maillage interne : liens contextuels dans les textes + FAQ enrichie

## 1. État actuel constaté

Pages publiques existantes : `/`, `/about`, `/faq`, `/tarifs` (+ `/pricing`), `/premium`, `/blog`, `/blog/:slug`, `/categories`, `/categories/:slug`, `/inspirations`, `/demo`, pages légales.

Ce qui fonctionne déjà :
- Accueil : bloc éditorial SEO (4 liens articles) + hub de liens internes (6 liens) + footer.
- Article de blog : « À lire aussi » (articles de la même langue) + CTA inscription.
- Tarifs : 3 liens sortants (démo, FAQ, premium).

Ce qui manque :
- **Aucun lien dans le corps des textes.** Les liens sont tous regroupés en blocs de navigation en bas de page ; Google valorise beaucoup plus les liens contextuels insérés dans une phrase.
- **La FAQ (18 questions, page la plus riche du site) ne renvoie vers aucune autre page** : ses réponses sont des chaînes de texte brut, non cliquables. C'est le principal gisement perdu.
- **`/about`, `/categories`, `/inspirations`, `/demo` sont des culs-de-sac** : ils ne reçoivent presque aucun lien et n'en émettent pas vers le blog ou les tarifs.
- Les articles de blog ne pointent que vers d'autres articles, jamais vers `/tarifs`, `/faq` ou `/demo`.

## 2. Ce que je propose de faire

### a. Rendre les réponses de la FAQ cliquables
Passer les réponses de texte brut à un format permettant des liens, et insérer 15 à 20 liens contextuels dans les phrases existantes : « capsule temporelle numérique » → article dédié, « 2,99 € par mois » → `/tarifs`, « arbre généalogique » → article arbre, « essai gratuit » → `/demo`, « cercles de partage » → accueil/premium, etc. Le texte visible reste identique, seuls certains groupes de mots deviennent des liens.

### b. Liens contextuels dans les textes des pages existantes
- **Accueil** (bloc éditorial) : 3 à 4 liens insérés dans les paragraphes (capsule temporelle, tarif, FAQ).
- **/about** : liens dans le récit vers `/faq`, `/tarifs`, `/blog` et l'article « transmettre ses souvenirs ».
- **/tarifs** : liens dans les textes de comparaison vers l'article capsule temporelle et vers `/about`.
- **/premium** : liens vers `/tarifs` et l'article arbre généalogique.
- **/categories** et **/inspirations** : un paragraphe d'introduction avec liens vers le blog, la FAQ et l'accueil.

### c. Sortie des articles de blog
Sous le bloc « À lire aussi », ajouter une ligne de liens utiles (Tarifs, FAQ, Démo) traduite dans les 7 langues, pour que le blog irrigue les pages de conversion.

### d. Nouvelles questions FAQ (6 ajouts)
Questions calquées sur des recherches réelles et servant d'ancrages de maillage :
1. Combien coûte Family Garden et que comprend l'essai de 14 jours ? → `/tarifs`
2. Puis-je essayer sans créer de compte ? → `/demo`
3. Comment créer un arbre généalogique avec photos et souvenirs ? → article arbre
4. Par quels thèmes commencer mon journal de famille ? → `/categories`, `/inspirations`
5. Family Garden fonctionne-t-il dans d'autres langues ? → blog multilingue
6. Où trouver des conseils pour écrire mes souvenirs ? → `/blog`

Le balisage `FAQPage` est déjà généré à partir de la liste des questions : il se mettra à jour automatiquement (texte sans balises pour les données structurées).

## Détails techniques

- `src/pages/FAQ.tsx` : le type `answer` passe de `string` à `string | ReactNode`. `createFaqSchema` continue de recevoir une version texte pure (champ `answerText` ou extraction) pour rester conforme au JSON-LD.
- Les URLs d'articles passent par `getArticleSlug()` de `src/lib/blogArticles.ts` pour rester correctes selon la langue.
- Nouveau petit composant de lien inline (style `text-primary underline underline-offset-4`) réutilisé sur toutes les pages, aucun changement de design par ailleurs.
- Textes multilingues ajoutés dans `public/locales/*/landing.json` (bloc liens utiles blog) ; la FAQ reste en français comme aujourd'hui.
- Aucun changement de tarif, d'authentification, de base de données ni de fonction backend.
