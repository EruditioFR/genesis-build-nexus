import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Category } from '@/hooks/useCategories';

interface CategorySelectorProps {
  categories: Category[];
  primaryCategory: string | null;
  secondaryCategories: string[];
  onPrimaryChange: (categoryId: string) => void;
  onSecondaryChange: (categoryIds: string[]) => void;
  onCreateCustom?: (name: string, description: string, icon: string, color: string) => Promise<Category | null>;
  disabled?: boolean;
}

const CategorySelector = ({
  categories,
  primaryCategory,
  secondaryCategories,
  onPrimaryChange,
  onSecondaryChange,
  onCreateCustom,
  disabled = false,
}: CategorySelectorProps) => {
  const [showSecondary, setShowSecondary] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handlePrimarySelect = (categoryId: string) => {
    if (disabled) return;
    onPrimaryChange(categoryId);
    // Remove from secondary if was there
    if (secondaryCategories.includes(categoryId)) {
      onSecondaryChange(secondaryCategories.filter(id => id !== categoryId));
    }
  };

  const handleSecondaryToggle = (categoryId: string) => {
    if (disabled) return;
    if (categoryId === primaryCategory) return; // Can't be both primary and secondary
    
    if (secondaryCategories.includes(categoryId)) {
      onSecondaryChange(secondaryCategories.filter(id => id !== categoryId));
    } else if (secondaryCategories.length < 2) {
      onSecondaryChange([...secondaryCategories, categoryId]);
    } else {
      toast.info('Maximum 2 catégories secondaires');
    }
  };

  const handleCreateCategory = async () => {
    if (!onCreateCustom || !newCategoryName.trim()) return;
    
    setIsCreating(true);
    const result = await onCreateCustom(
      newCategoryName.trim(),
      newCategoryDescription.trim(),
      '📁',
      '#9E9E9E'
    );
    
    if (result) {
      toast.success('Catégorie créée avec succès');
      setCreateDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      onPrimaryChange(result.id);
    } else {
      toast.error('Erreur lors de la création');
    }
    setIsCreating(false);
  };

  const standardCategories = categories.filter(c => c.is_standard);
  const customCategories = categories.filter(c => !c.is_standard);

  return (
    <div className="space-y-6">
      {/* Primary Category Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">
          Catégorie principale *
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez la catégorie qui correspond le mieux à votre capsule
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {standardCategories.map((category) => {
            const isSelected = primaryCategory === category.id;
            
            return (
              <Tooltip key={category.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrimarySelect(category.id)}
                    disabled={disabled}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{
                      '--category-color': category.color,
                    } as React.CSSProperties}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                    
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mb-2"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">
                      {category.name_fr}
                    </h3>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{category.name_fr}</p>
                  <p className="text-sm text-muted-foreground">{category.description_short}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Mes catégories personnalisées</p>
            <div className="flex flex-wrap gap-2">
              {customCategories.map((category) => {
                const isSelected = primaryCategory === category.id;
                return (
                  <Badge
                    key={category.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1.5 gap-2 ${disabled ? 'opacity-50' : ''}`}
                    onClick={() => !disabled && handlePrimarySelect(category.id)}
                  >
                    <span>{category.icon}</span>
                    {category.name_fr}
                    {isSelected && <Check className="w-3 h-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Create custom category button */}
        {onCreateCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => setCreateDialogOpen(true)}
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
            Créer une catégorie personnalisée
          </Button>
        )}
      </div>

      {/* Secondary Categories (collapsible) */}
      {primaryCategory && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showSecondary ? 'rotate-180' : ''}`} />
            Ajouter des catégories secondaires (optionnel)
            {secondaryCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {secondaryCategories.length}/2
              </Badge>
            )}
          </button>

          <AnimatePresence>
            {showSecondary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ajoutez jusqu'à 2 catégories secondaires pour enrichir le classement
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter(c => c.id !== primaryCategory)
                      .map((category) => {
                        const isSelected = secondaryCategories.includes(category.id);
                        return (
                          <Badge
                            key={category.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer px-3 py-1.5 gap-2 transition-all ${disabled ? 'opacity-50' : ''}`}
                            onClick={() => handleSecondaryToggle(category.id)}
                          >
                            <span>{category.icon}</span>
                            {category.name_fr}
                            {isSelected && <Check className="w-3 h-3" />}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Selected categories summary */}
      {primaryCategory && (
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Catégories sélectionnées :</p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(c => c.id === primaryCategory || secondaryCategories.includes(c.id))
              .map((category) => (
                <Badge 
                  key={category.id} 
                  style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: category.color }}
                  className="gap-1.5"
                >
                  {category.icon} {category.name_fr}
                  {category.id === primaryCategory && (
                    <span className="text-xs opacity-70">(principale)</span>
                  )}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une catégorie personnalisée</DialogTitle>
            <DialogDescription>
              Créez votre propre catégorie pour organiser vos capsules à votre façon.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom de la catégorie *</Label>
              <Input
                id="category-name"
                placeholder="Ex: Mes inventions"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Décrivez brièvement cette catégorie..."
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              disabled={!newCategoryName.trim() || isCreating}
            >
              {isCreating ? 'Création...' : 'Créer la catégorie'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelector;
