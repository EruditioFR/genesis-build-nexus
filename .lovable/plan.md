

## Analyse des visites — Semaine du 10 au 17 avril 2026

### Les chiffres clés (très inquiétants)

| Indicateur | Valeur | Diagnostic |
|---|---|---|
| Visiteurs sur 7 jours | **1 386** | Très bon trafic |
| Pages vues | 1 707 | Faible (1,23 pages/visite) |
| Inscriptions sur 7 jours | **1 seule** | Taux de conversion : **0,07%** |
| Taux de rebond | **95%** (le 17/04) | Catastrophique |
| Durée moyenne de session | **2 secondes** (le 17/04) | Les gens partent immédiatement |
| Visites de `/signup` | 14 | Seulement 1% des visiteurs y arrivent |

### Diagnostic : 3 problèmes critiques cumulés

**1. Mismatch trafic / contenu (le plus grave)**
- 87% du trafic vient de **mobile** (1 216/1 386)
- 49% vient de **m.facebook.com** (publicités/posts FB) + 7% Instagram
- Mais session = 2 secondes en moyenne, rebond à 95%

→ Les gens cliquent sur votre pub Facebook, voient la landing, et **repartent en 2 secondes sans scroller**. Le message ne « matche » pas leur attente, ou se charge mal sur mobile.

**2. La hero mobile a un problème d'UX**
- Sur mobile (`h-[50vh]`), la section vidéo plein écran s'ouvre **avant** que le visiteur voie un message clair
- La punchline (`text-2xl`) est petite, le CTA est en dessous
- Les visiteurs Facebook arrivent sur une vidéo qui charge → confusion → retour
- Le slide change toutes les 5 secondes, distrait au lieu de convaincre

**3. Le funnel d'inscription est perdu**
- 1 153 visites sur `/` mais seulement **14 sur `/signup`** (1,2%)
- Le CTA principal est noyé dans un design « dark/cinématique » qui ne donne pas envie de cliquer rapidement
- Pas de preuve sociale immédiate, pas de prix visible « above the fold »

### Hypothèses sur la source du problème

```text
Facebook Ad → Click → Landing mobile
                         ↓
           ┌─────────────┴─────────────┐
        Vidéo lourde              Message flou
        (2-5s à charger)          ("Quelle tradition...")
           ↓                          ↓
        L'utilisateur          L'utilisateur ne 
        part avant le LCP      comprend pas le produit
                         ↓
                    REBOND 95%
```

### Plan d'action proposé (priorité décroissante)

**Phase 1 — Quick wins mobile (impact immédiat)**
1. **Réduire la hauteur du hero mobile** : passer de `h-[50vh]` à `h-[35vh]` pour que le CTA et le titre soient visibles ensemble sans scroll
2. **Grossir et clarifier la punchline** : `text-3xl sm:text-4xl` minimum, message plus direct (« Sauvegardez les souvenirs de votre famille, pour toujours »)
3. **Précharger uniquement la première vidéo** (lazy load des autres), afficher un poster image en attendant
4. **CTA plus voyant** : ajouter le prix juste en dessous (« Gratuit jusqu'à X souvenirs »)

**Phase 2 — Tracking de conversion (pour mesurer)**
1. Ajouter des events Google Analytics sur :
   - Click sur le CTA hero
   - Arrivée sur `/signup`
   - Submit du formulaire signup
2. Cela permettra de mesurer **où exactement** se situe la perte (entre / et /signup, ou pendant le formulaire)

**Phase 3 — Réduire la friction d'inscription**
1. Le formulaire signup demande : prénom, nom d'affichage, pays, email, confirmation email, mot de passe, confirmation mot de passe
2. **Trop de champs** pour mobile → supprimer "confirmation email" et "confirmation password" (remplacer par un toggle "afficher mot de passe")
3. Ajouter Google OAuth (1 clic au lieu de 7 champs)

**Phase 4 — Vérifier les pubs Facebook**
Cette analyse ne peut pas être faite côté code : il faut vérifier que le visuel Facebook promet bien ce que la landing montre. Un mismatch entre la pub et la page = rebond garanti.

### Ce que je vous propose en premier

Je recommande de commencer par la **Phase 1 + Phase 2** ensemble, car :
- Phase 1 = corrige immédiatement le problème mobile (87% du trafic)
- Phase 2 = nous donne les données pour valider/invalider que le pb vient de la landing vs du formulaire

**Question avant de commencer** : voulez-vous que j'implémente ces changements maintenant, ou préférez-vous d'abord :
- (a) Un audit visuel poussé de la version mobile (screenshots)
- (b) Ajouter Google OAuth en priorité (gros gain de conversion potentiel)
- (c) Toutes les phases 1+2+3 d'un coup

