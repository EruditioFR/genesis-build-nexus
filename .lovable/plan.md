

# Supprimer le bouton "Voir la demo" du Hero

## Modification

**Fichier** : `src/components/landing/HeroSection.tsx`

Retirer le second bouton CTA (le `motion.div` contenant le bouton "ghost" avec l'icone Play qui pointe vers `#how-it-works`). Cela correspond au bloc suivant (environ lignes 155-178) :

```text
<motion.div whileHover={...} className="w-full sm:w-auto">
  <Button asChild variant="ghost" size="xl" ...>
    <a href="#how-it-works">
      <motion.span ...><Play ... /></motion.span>
      {t('hero.cta.secondary')}
    </a>
  </Button>
</motion.div>
```

Le bouton principal "Creer mon journal" reste inchange. L'import `Play` de lucide-react pourra aussi etre retire s'il n'est plus utilise ailleurs dans le fichier.

