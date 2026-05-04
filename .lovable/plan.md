## Diagnostic

J'ai testé le parcours complet sur le site en production (`https://familygarden.fr`) en viewport mobile (390×844) :

1. Ouverture du menu hamburger
2. Clic sur "Commencer gratuitement" / "S'inscrire"
3. **Résultat** : la page `/signup` s'affiche correctement, formulaire visible (prénom, nom, email, mot de passe, confirmation), aucune redirection vers l'accueil.

Vérifications dans le code :
- `src/components/landing/Header.tsx` : le bouton mobile pointe bien vers `<Link to="/signup">`.
- `src/App.tsx` : route `/signup` correctement déclarée avant le catch-all `*`.
- `src/pages/Signup.tsx` : aucune redirection automatique, pas de `useEffect` qui renvoie ailleurs.
- Aucun service worker enregistré dans le projet.

**Conclusion** : le code est correct. Le bug que vous voyez vient du **cache navigateur de votre téléphone** qui sert encore l'ancienne version JavaScript (celle d'avant la suppression des champs pays/email). L'ancien bundle contenait probablement une logique qui redirigeait après suppression de ces champs.

## Solution proposée

Pour aider tous les utilisateurs (pas seulement vous) à recevoir la nouvelle version sans avoir à vider manuellement leur cache, je vais :

### 1. Ajouter des en-têtes anti-cache pour `index.html`

Modifier `index.html` pour inclure des balises meta empêchant la mise en cache du HTML d'entrée (les bundles JS gardent leur cache long via le hash Vite, mais le HTML doit toujours être frais pour pointer vers les nouveaux hash).

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 2. Ajouter une détection de version + reload automatique

Créer un petit utilitaire qui :
- Stocke un identifiant de build (timestamp Vite) dans `localStorage`.
- Au démarrage de l'app, compare avec la version courante.
- Si différent → vide les caches navigateur (`caches.delete()`) et fait un reload propre une seule fois.

### 3. Pour vous, immédiatement

En attendant le déploiement du correctif, sur votre téléphone :
- **iOS Safari** : Réglages → Safari → Effacer historique et données du site
- **Chrome Android** : ⋮ → Paramètres → Confidentialité → Effacer données navigation → cocher "Images et fichiers en cache" → Effacer
- **Ou simplement** : ouvrir https://familygarden.fr/signup en navigation privée pour confirmer immédiatement que ça fonctionne

## Fichiers modifiés

- `index.html` — ajout des meta cache-control
- `src/main.tsx` — appel d'un nouveau hook de version
- `src/lib/buildVersion.ts` (nouveau) — détection + reset cache

## Note

Si après ce correctif vous voyez encore le bug **sur un autre appareil** (jamais visité auparavant), il faudra creuser plus loin. Mais le test live confirme que le code en ligne fonctionne.
