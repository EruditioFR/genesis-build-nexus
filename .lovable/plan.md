

## Optimiser l'usage data de Lovable Cloud

L'indicateur "Used when your app sends or receives data" mesure le volume de données échangées entre votre app et le backend (requêtes base de données, uploads/downloads de fichiers storage, appels edge functions).

### Leviers d'optimisation identifiés dans votre projet

1. **Compression des images (deja en place)** — Vous avez deja la compression automatique sous 3 Mo, ce qui reduit le volume d'upload.

2. **Cache des signed URLs** — Le fichier `src/lib/signedUrlCache.ts` existe deja. Verifier qu'il est bien utilise partout (MediaGallery, CapsuleDetail, Timeline) pour eviter de regenerer des URLs signees a chaque rendu.

3. **Pagination des requetes** — Verifier que les listes de capsules, medias et notifications utilisent bien une pagination (limit/offset ou cursor) plutot que de tout charger d'un coup. Le default Supabase est 1000 lignes.

4. **Optimiser les SELECT** — Ne selectionner que les colonnes necessaires (`.select('id, title, thumbnail_url')`) au lieu de `.select('*')` dans les listes/dashboards.

5. **Lazy loading des medias** — S'assurer que les images/videos dans les galeries et timelines ne sont chargees (signed URL + download) que quand elles sont visibles a l'ecran (intersection observer).

6. **Reduire les re-fetches** — Utiliser le cache React Query (deja en place via TanStack Query probablement) avec des `staleTime` adequats pour eviter de re-fetcher les memes donnees.

7. **Thumbnails pour les videos** — Utiliser `src/lib/videoThumbnail.ts` pour afficher des miniatures legeres plutot que de pre-charger les videos.

### Ce que je peux implementer

- Auditer les requetes `.select('*')` et les remplacer par des selects cibles
- Ajouter de la pagination la ou elle manque
- Verifier/etendre l'utilisation du cache de signed URLs
- Ajouter du lazy loading sur les medias de la timeline/galerie

Voulez-vous que je procede a cet audit et ces optimisations ?

