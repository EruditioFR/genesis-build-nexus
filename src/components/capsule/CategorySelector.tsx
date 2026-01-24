import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { Category, SubCategory } from '@/hooks/useCategories';

interface CategorySelectorProps {
  categories: Category[];
  primaryCategory: string | null;
  onPrimaryChange: (categoryId: string) => void;
  onCreateCustom?: (name: string, description: string, icon: string, color: string) => Promise<Category | null>;
  disabled?: boolean;
  // Sub-category props
  subCategories?: SubCategory[];
  selectedSubCategories?: string[];
  onSubCategoryChange?: (subCategoryIds: string[]) => void;
}

const CategorySelector = ({
  categories,
  primaryCategory,
  onPrimaryChange,
  onCreateCustom,
  disabled = false,
  subCategories = [],
  selectedSubCategories = [],
  onSubCategoryChange,
}: CategorySelectorProps) => {
  const { t } = useTranslation('capsules');
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Helper to get localized category name
  const getCategoryName = (category: Category): string => {
    const translationKey = `categorySelector.standardCategories.${category.slug}`;
    const translated = t(translationKey);
    // If translation exists (not same as key), use it; otherwise fallback to name_fr
    return translated !== translationKey ? translated : category.name_fr;
  };

  // Get available sub-categories for the primary category
  const availableSubCategories = primaryCategory
    ? subCategories.filter(sub => sub.category_id === primaryCategory)
    : [];

  // Reset sub-categories when primary category changes
  useEffect(() => {
    if (onSubCategoryChange && selectedSubCategories.length > 0) {
      // Check if any selected sub-categories belong to the new primary category
      const validSubCategories = selectedSubCategories.filter(subId =>
        availableSubCategories.some(sub => sub.id === subId)
      );
      if (validSubCategories.length !== selectedSubCategories.length) {
        onSubCategoryChange(validSubCategories);
      }
    }
  }, [primaryCategory]);

  const handlePrimarySelect = (categoryId: string) => {
    if (disabled) return;
    onPrimaryChange(categoryId);
    // Reset sub-categories when primary changes
    if (onSubCategoryChange && selectedSubCategories.length > 0) {
      onSubCategoryChange([]);
    }
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    if (disabled || !onSubCategoryChange) return;
    
    if (selectedSubCategories.includes(subCategoryId)) {
      onSubCategoryChange(selectedSubCategories.filter(id => id !== subCategoryId));
    } else if (selectedSubCategories.length < 3) {
      onSubCategoryChange([...selectedSubCategories, subCategoryId]);
    } else {
      toast.info(t('categorySelector.maxSubCategories'));
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
      toast.success(t('categorySelector.dialog.success'));
      setCreateDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      onPrimaryChange(result.id);
    } else {
      toast.error(t('categorySelector.dialog.error'));
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
          {t('categorySelector.primaryLabel')}
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          {t('categorySelector.primaryDescription')}
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
                      {getCategoryName(category)}
                    </h3>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{getCategoryName(category)}</p>
                  <p className="text-sm text-muted-foreground">{category.description_short}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">{t('categorySelector.customCategories')}</p>
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
            {t('categorySelector.createCustom')}
          </Button>
        )}
      </div>

      {/* Sub-Categories (when available) */}
      {primaryCategory && availableSubCategories.length > 0 && onSubCategoryChange && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowSubCategories(!showSubCategories)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showSubCategories ? 'rotate-180' : ''}`} />
            {t('categorySelector.subCategoriesToggle')}
            {selectedSubCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedSubCategories.length}/3
              </Badge>
            )}
          </button>

          <AnimatePresence>
            {showSubCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('categorySelector.subCategoriesDescription')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableSubCategories.map((subCategory) => {
                      const isSelected = selectedSubCategories.includes(subCategory.id);
                      return (
                        <Badge
                          key={subCategory.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer px-3 py-1.5 gap-2 transition-all ${disabled ? 'opacity-50' : ''}`}
                          onClick={() => handleSubCategoryToggle(subCategory.id)}
                        >
                          {subCategory.name}
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
          <p className="text-xs text-muted-foreground mb-2">{t('categorySelector.selectedCategories')}</p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(c => c.id === primaryCategory)
              .map((category) => (
                <Badge 
                  key={category.id} 
                  style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: category.color }}
                  className="gap-1.5"
                >
                  {category.icon} {getCategoryName(category)}
                </Badge>
              ))}
            {/* Show selected sub-categories */}
            {selectedSubCategories.length > 0 && subCategories
              .filter(sub => selectedSubCategories.includes(sub.id))
              .map((subCategory) => (
                <Badge 
                  key={subCategory.id} 
                  variant="outline"
                  className="gap-1.5 text-xs"
                >
                  {subCategory.name}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('categorySelector.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('categorySelector.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">{t('categorySelector.dialog.nameLabel')}</Label>
              <Input
                id="category-name"
                placeholder={t('categorySelector.dialog.namePlaceholder')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">{t('categorySelector.dialog.descriptionLabel')}</Label>
              <Textarea
                id="category-description"
                placeholder={t('categorySelector.dialog.descriptionPlaceholder')}
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('categorySelector.dialog.cancel')}
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              disabled={!newCategoryName.trim() || isCreating}
            >
              {isCreating ? t('categorySelector.dialog.creating') : t('categorySelector.dialog.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelector;
