

# Retirer l'icone du type de media sur le souvenir mis en avant

## Contexte

Sur le dashboard, le souvenir mis en avant (FeaturedCard) affiche un badge de type (Photo, Video, Audio, etc.) en haut a gauche via le composant `TypeBadge`. Ce badge contient une icone + un texte.

## Modification

**Fichier** : `src/components/dashboard/RecentCapsules.tsx`

Dans le composant `FeaturedCard`, retirer la ligne qui affiche `<TypeBadge>` :

```text
// Supprimer cette partie dans FeaturedCard :
<div className="absolute top-4 left-4">
  <TypeBadge type={capsule.type} t={t} />
</div>
```

Cela concerne uniquement le souvenir mis en avant (le premier de la liste). Les cartes compactes en dessous conservent leur petite icone de type.

