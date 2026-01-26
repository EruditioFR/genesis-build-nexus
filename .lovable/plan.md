
# Plan : Afficher les souvenirs partagés pour les membres de cercles

## Contexte du problème

Actuellement, lorsqu'un utilisateur accepte une invitation à rejoindre un cercle, il peut voir son appartenance au cercle mais **ne peut pas voir les souvenirs (capsules) partagés avec ce cercle**.

**Cause technique :**
- Les politiques de sécurité de la base de données sont correctes et autorisent l'accès aux capsules partagées
- Cependant, le code frontend ne récupère que les capsules personnelles de l'utilisateur (via `user_id = user.id`)
- La page Partages (Circles) ne montre que les cercles dont l'utilisateur est propriétaire, pas ceux où il est membre invité

## Solution proposée

### 1. Créer une section "Souvenirs partagés avec moi" sur la page Partages

Ajouter une nouvelle section dans `CirclesPage.tsx` pour les membres invités :

- Récupérer les cercles où l'utilisateur est membre (pas propriétaire)
- Pour chaque cercle, afficher les capsules partagées
- Afficher le nom du propriétaire du cercle et les informations de partage

### 2. Modifier la requête des cercles pour inclure ceux où l'utilisateur est membre

Actuellement :
```text
circles.eq('owner_id', user.id)  // Seulement les cercles créés
```

Ajouter :
```text
Récupérer aussi les cercles via circle_members.user_id
```

### 3. Créer un composant `SharedCapsulesSection`

Un nouveau composant qui :
- Liste les cercles dont l'utilisateur est membre invité
- Affiche les capsules partagées dans chaque cercle
- Permet de naviguer vers le détail d'une capsule partagée (en lecture seule)

### 4. Adapter la page de détail d'une capsule pour le mode lecture

Quand l'utilisateur consulte une capsule partagée (pas la sienne) :
- Masquer les boutons d'édition et de suppression
- Afficher une mention "Partagé par [nom du propriétaire]"
- Permettre la lecture et les commentaires si autorisés

## Fichiers à modifier/créer

| Fichier | Action |
|---------|--------|
| `src/components/circles/SharedCapsulesSection.tsx` | Créer - Composant pour afficher les capsules partagées |
| `src/pages/CirclesPage.tsx` | Modifier - Ajouter section pour cercles où l'utilisateur est membre |
| `src/pages/CapsuleDetail.tsx` | Modifier - Adapter l'affichage pour les capsules partagées (lecture seule) |
| `public/locales/*/dashboard.json` | Modifier - Ajouter les traductions nécessaires |

## Détails techniques

### Requête pour récupérer les cercles où l'utilisateur est membre invité

```sql
SELECT c.*, p.display_name as owner_name
FROM circles c
JOIN circle_members cm ON cm.circle_id = c.id
JOIN profiles p ON p.user_id = c.owner_id
WHERE cm.user_id = [current_user_id]
  AND cm.accepted_at IS NOT NULL
  AND c.owner_id != [current_user_id]
```

### Requête pour récupérer les capsules partagées avec un cercle

```sql
SELECT cap.*, p.display_name as owner_name
FROM capsules cap
JOIN capsule_shares cs ON cs.capsule_id = cap.id
JOIN profiles p ON p.user_id = cap.user_id
WHERE cs.circle_id = [circle_id]
```

### Structure de l'interface utilisateur

```text
Page Partages (CirclesPage)
├── Section "Mes cercles" (existant)
│   └── Liste des cercles créés par l'utilisateur
│
└── Section "Partagés avec moi" (nouveau)
    └── Pour chaque cercle où l'utilisateur est invité:
        ├── Nom du cercle + propriétaire
        └── Grille des capsules partagées
            └── Clic → CapsuleDetail en lecture seule
```

## Résultat attendu

Après cette implémentation, un utilisateur invité dans un cercle pourra :
1. Voir les cercles auxquels il appartient (section "Partagés avec moi")
2. Voir toutes les capsules partagées dans ces cercles
3. Consulter le détail de chaque capsule en mode lecture
4. Voir qui a partagé le souvenir avec lui
