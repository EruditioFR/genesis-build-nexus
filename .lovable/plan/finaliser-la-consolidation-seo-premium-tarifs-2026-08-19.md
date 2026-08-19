# Finaliser la consolidation SEO : /premium → /tarifs

## Ce que dit la vérification en direct

J'ai interrogé les pages réellement servies par https://familygarden.fr avant d'écrire ce plan :

| Page | Title servi | Canonical servi |
|---|---|---|
| `/` | Family Garden — Journal de famille privé, 2,99 €/mois | `https://familygarden.fr/` |
| `/faq` | FAQ : journal de famille privé et arbre généalogique | `https://familygarden.fr/faq` |
| `/blog` | Blog Family Garden : conserver et transmettre ses souvenirs | `https://familygarden.fr/blog` |
| `/tarifs` | Tarif Family Garden : 2,99 €/mois — 14 jours d'essai | `https://familygarden.fr/tarifs` |
| `/premium` | Tarifs Family Garden : 2,99 €/mois… | `https://familygarden.fr/premium` |

Autrement dit : `/faq` et `/blog` **ont déjà** leur title, meta description et canonical propres en ligne — le rapport d'audit décrit un état antérieur (outil ou cache de crawl datant d'avant la mise en ligne du pré-rendu). Les liens de navigation du site vitrine pointent déjà vers `/tarifs` (pied de page et hub de liens internes) ; aucun lien de navigation ne pointe vers `/premium`.

Le seul point réellement ouvert est confirmé : **`/premium` existe toujours et duplique `/tarifs`** (contenu tarifaire équivalent, deux URLs indexables, `/premium` encore présent dans le sitemap et dans `llms.txt`).

## Ce que je propose de faire

1. **Consolider `/premium` sur `/tarifs`**
   - La route `/premium` redirige côté application vers `/tarifs` (redirection permanente logique, sans page fantôme).
   - Le fichier pré-rendu de `/premium` devient une page de redirection : canonical pointant vers `https://familygarden.fr/tarifs`, redirection immédiate pour les visiteurs, et lien de secours visible pour les robots sans JavaScript.
2. **Nettoyer les signaux qui déclarent encore `/premium` comme page à part**
   - Retirer `/premium` du `sitemap.xml`.
   - Corriger `llms.txt` / `llms-full.txt` pour ne citer que `/tarifs`.
   - Retirer l'entrée `/premium` de la table de métadonnées de routes (elle ne doit plus produire une page « unique »).
3. **Vérifier les liens internes restants vers `/premium`** dans l'espace connecté (tableau de bord, stockage, création de souvenir, profil) et les repointer vers `/tarifs`, pour que plus aucun lien du site ne mène à l'ancienne URL.
4. **Contrôle final** après publication : chaque route publique renvoie bien son propre title/description/canonical, et `/premium` renvoie vers `/tarifs`.

## Précision technique

L'hébergement Lovable ne permet pas d'émettre un vrai 301 HTTP depuis le code du projet : la consolidation se fait par redirection côté client + `rel=canonical` vers `/tarifs` dans le HTML pré-rendu, ce que Google traite comme une redirection permanente une fois la page recrawlée. Fichiers concernés : `src/App.tsx`, `src/lib/routeSeoMeta.mjs`, `scripts/prerender.mjs`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`, plus les composants du tableau de bord qui lient encore `/premium`.

La page `src/pages/Premium.tsx` n'est plus atteignable après ce changement ; je la supprime pour éviter deux pages tarifaires à maintenir, sauf indication contraire.
