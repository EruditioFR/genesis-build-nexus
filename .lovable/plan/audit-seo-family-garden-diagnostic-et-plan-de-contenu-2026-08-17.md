# Audit SEO Family Garden — diagnostic et plan de contenu

## 1. Où en est le site aujourd'hui (données Semrush, base France)

- Le domaine ne ressort que sur **2 mots-clés** : « gardens family » (position 1, 1 000 rech./mois) et « garden family » (position 4, 880 rech./mois).
- Trafic organique estimé : ~260 visites/mois, quasi uniquement sur des requêtes de marque anglophones sans intention d'achat.
- Aucune requête métier (journal de famille, souvenirs, arbre généalogique) ne remonte : le site n'existe pas encore aux yeux de Google sur son marché.

Cause principale : une seule page réellement indexable et riche (l'accueil), aucun contenu éditorial de fond, et un nom de domaine qui capte du trafic hors sujet.

## 2. Sur quels termes peut-on être trouvé (potentiel réel)

| Mot-clé | Volume/mois | Difficulté | Verdict |
|---|---|---|---|
| capsule temporelle | 2 900 | 21 — facile | Cible prioritaire, gros volume et accessible |
| arbre généalogique en ligne | 880 | 44 — possible | Cible moyen terme, adossée à l'option arbre |
| logiciel généalogie | 170 | 35 | Comparatif possible |
| biographie familiale | 110 | 13 | Très accessible |
| raconter sa vie | 90 | 3 | Très accessible |
| souvenirs de famille | 50 | 0 | Facile, à intégrer partout |
| journal de famille en ligne | 20 | 0 | Terme cœur de marque, à verrouiller |
| album photo famille en ligne | 20 | 0 | Facile |

Le marché généalogie pur (Geneanet 673 k, MyHeritage 110 k) est hors d'atteinte frontalement : on s'y positionne par des angles longue traîne, pas sur « arbre généalogique ».

## 3. Mots-clés à ajouter dans le site

Vocabulaire à intégrer dans les titres, sous-titres et textes des pages existantes (accueil, à propos, premium, démo) :
capsule temporelle numérique, journal de famille privé, souvenirs de famille en ligne, transmettre son histoire familiale, biographie familiale, raconter sa vie à ses enfants, album photo familial sécurisé, mémoire familiale, héritage numérique, arbre généalogique avec photos et souvenirs.

## 4. FAQ : étoffer ou créer ?

La page FAQ existe déjà avec 18 questions en prose sur 7 catégories, avec balisage FAQPage dans le HTML initial — la base est bonne. Il ne faut pas la refaire, mais l'orienter recherche :

- Ajouter 6 à 8 questions calquées sur des requêtes réelles (« Qu'est-ce qu'une capsule temporelle numérique ? », « Comment raconter sa vie à ses enfants ? », « Comment conserver ses souvenirs de famille en ligne ? », « Quelle différence avec un site de généalogie ? », « Comment créer un arbre généalogique avec photos ? »).
- Synchroniser le balisage FAQPage de `index.html` avec ces nouvelles questions.

## 5. Ce que je propose de faire

1. **Optimiser les pages existantes** — titres, méta-descriptions et intertitres de l'accueil, /about, /premium, /demo et /faq réécrits autour du vocabulaire ci-dessus. Aucun changement de design.
2. **Enrichir la FAQ** de 6 à 8 questions orientées recherche + mise à jour du balisage structuré.
3. **Créer 4 pages/articles de fond** (800–1 200 mots, en prose, chacune ciblant un mot-clé validé) :
   - Capsule temporelle numérique : comment en créer une (cible principale)
   - Comment conserver et transmettre ses souvenirs de famille
   - Raconter sa vie à ses enfants : méthode en 7 étapes
   - Arbre généalogique en ligne : relier photos, récits et personnes
4. **Maillage interne et sitemap** — liens depuis l'accueil et la FAQ vers ces pages, ajout dans `public/sitemap.xml`, la fonction sitemap dynamique, `llms.txt` et le bloc `<noscript>`.
5. **Lancer une analyse SEO technique** de la plateforme pour vérifier balises, canoniques et indexation après ces changements.

## Détails techniques

- Contenu rédigé en français, ton « vous », lexique patrimonial existant (souvenirs, chronologie, journal de famille privé).
- Les nouveaux articles passent par le système de blog Supabase déjà en place (auteur « Family Garden »), pas de nouvelles routes React sauf si vous préférez des pages dédiées.
- Métadonnées gérées via le composant `SEOHead` existant (canonique dynamique, hreflang, JSON-LD) — aucune modification de son fonctionnement.
- Balisage `Article` ajouté sur les nouveaux contenus, `FAQPage` mis à jour dans `index.html`.
- Aucune modification des tarifs, de l'authentification ou des fonctions backend.

Source des données de recherche : Semrush, base France.
