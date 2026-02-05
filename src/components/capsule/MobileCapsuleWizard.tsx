import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Type, 
  Image, 
  Video, 
  Music, 
  Layers,
  Tag,
  Calendar,
  Send,
  Save,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fr, enUS, es, ko, zhCN, type Locale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import TagInput from '@/components/capsule/TagInput';
import UnifiedMediaSection, { type MediaFile, type UploadResult } from '@/components/capsule/UnifiedMediaSection';
import CategorySelector from '@/components/capsule/CategorySelector';
import MemoryDateSelector, { 
  type MemoryDateValue, 
  formatMemoryDate 
} from '@/components/capsule/MemoryDateSelector';
import { determineContentType } from '@/lib/capsuleTypeUtils';

import type { Database } from '@/integrations/supabase/types';
import type { Category, SubCategory } from '@/hooks/useCategories';

type CapsuleType = Database['public']['Enums']['capsule_type'];

interface MobileCapsuleWizardProps {
  userId: string;
  // Form values
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  // Categories
  categories: Category[];
  subCategories: SubCategory[];
  primaryCategory: string | null;
  onPrimaryCategoryChange: (id: string | null) => void;
  selectedSubCategories: string[];
  onSubCategoriesChange: (ids: string[]) => void;
  onCreateCustomCategory: (name: string, desc: string, icon: string, color: string) => Promise<Category>;
  // Media
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  // Tags
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  // Memory date
  memoryDate: MemoryDateValue | null;
  onMemoryDateChange: (date: MemoryDateValue | null) => void;
  // Actions
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
  // Upload function ref
  onUploadAllRef?: (uploadFn: () => Promise<UploadResult>) => void;
}

// New simplified steps: info, content, details, review
const STEP_KEYS = ['info', 'content', 'details', 'review'] as const;
const STEP_ICONS = [Type, FileText, Tag, Check];

const MobileCapsuleWizard = ({
  userId,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  content,
  onContentChange,
  categories,
  subCategories,
  primaryCategory,
  onPrimaryCategoryChange,
  selectedSubCategories,
  onSubCategoriesChange,
  onCreateCustomCategory,
  mediaFiles,
  onMediaFilesChange,
  tags,
  onTagsChange,
  memoryDate,
  onMemoryDateChange,
  isSaving,
  onSaveDraft,
  onPublish,
  onBack,
  onUploadAllRef,
}: MobileCapsuleWizardProps) => {
  const { t, i18n } = useTranslation('capsules');
  const [currentStep, setCurrentStep] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  const getLocale = useMemo((): Locale => {
    const localeMap: Record<string, Locale> = {
      fr,
      en: enUS,
      es,
      ko,
      zh: zhCN,
    };
    return localeMap[i18n.language] || fr;
  }, [i18n.language]);

  // Build steps with translated labels
  const STEPS = STEP_KEYS.map((key, index) => ({
    id: key,
    label: t(`wizard.steps.${key}`, key),
    icon: STEP_ICONS[index],
  }));

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Calculate capsule type from content
  const calculatedCapsuleType = determineContentType(content, mediaFiles);

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Info
        return title.trim().length > 0;
      case 1: // Content (media + text)
        return true; // Allow empty content
      case 2: // Details
        return true;
      case 3: // Review
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const getTypeIcon = (type: CapsuleType) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'mixed': return Layers;
      default: return Type;
    }
  };

  const getTypeLabel = (type: CapsuleType) => t(`types.${type}`);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic info
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-5 shadow-gold">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">
                {t('wizard.infoTitle')}
              </h2>
              <p className="text-lg text-muted-foreground px-4">
                {t('wizard.infoSubtitle')}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-xl font-semibold mb-4 block">
                  {t('wizard.titleLabel')}
                </Label>
                <Input
                  placeholder={t('wizard.titlePlaceholder')}
                  className="h-16 text-xl px-5 border-2 focus:border-secondary"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground mt-2 px-1">
                  {t('seniorEditor.titleHelp', 'Un titre court et mémorable')}
                </p>
              </div>

              <div>
                <Label className="text-xl font-semibold mb-4 block">
                  {t('wizard.descriptionLabel')}
                </Label>
                <Textarea
                  placeholder={t('wizard.descriptionPlaceholder')}
                  className="min-h-[140px] text-lg px-5 py-4 border-2 focus:border-secondary"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Content (unified media + text)
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.contentTitle', 'Contenus')}
              </h2>
              <p className="text-muted-foreground">
                {t('wizard.contentSubtitle', 'Ajoutez du texte, des photos, vidéos ou audio')}
              </p>
            </div>

            {mediaError && (
              <p className="text-sm text-destructive text-center mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                {t('wizard.mediaError')}
              </p>
            )}

            <UnifiedMediaSection
              userId={userId}
              content={content}
              onContentChange={onContentChange}
              showTextSection={true}
              files={mediaFiles}
              onFilesChange={(files) => {
                onMediaFilesChange(files);
                if (mediaError) setMediaError(false);
              }}
              maxFiles={20}
              onUploadAll={onUploadAllRef}
              hasError={mediaError}
            />
          </div>
        );

      case 2: // Details (category, tags, date)
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.detailsTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('wizard.detailsSubtitle')}
              </p>
            </div>

            {/* Category */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <Label className="text-lg font-semibold mb-4 block">
                {t('wizard.categoryLabel')}
              </Label>
              <CategorySelector
                categories={categories}
                primaryCategory={primaryCategory}
                onPrimaryChange={onPrimaryCategoryChange}
                onCreateCustom={onCreateCustomCategory}
                subCategories={subCategories}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryChange={onSubCategoriesChange}
              />
            </div>

            {/* Memory date */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <Label className="text-lg font-semibold mb-3 block">
                <Calendar className="w-5 h-5 inline-block mr-2" />
                {t('wizard.memoryDateLabel')}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {t('wizard.memoryDateHelp')}
              </p>
              <MemoryDateSelector
                value={memoryDate}
                onChange={onMemoryDateChange}
              />
            </div>

            {/* Tags */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <Label className="text-lg font-semibold mb-4 block">
                <Tag className="w-5 h-5 inline-block mr-2" />
                {t('wizard.tagsLabel')}
              </Label>
              <TagInput tags={tags} onChange={onTagsChange} />
            </div>
          </div>
        );

      case 3: // Review
        const TypeIcon = getTypeIcon(calculatedCapsuleType);
        const selectedCategory = categories.find(c => c.id === primaryCategory);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.reviewTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('wizard.reviewSubtitle')}
              </p>
            </div>

            {/* Summary card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              {/* Title */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('wizard.summaryTitle')}</p>
                <p className="text-lg font-semibold text-foreground">{title || t('wizard.noTitle')}</p>
              </div>

              {/* Type (auto-determined) */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('wizard.summaryType')}</p>
                  <p className="font-medium">{getTypeLabel(calculatedCapsuleType)}</p>
                </div>
              </div>

              {/* Category */}
              {selectedCategory && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                  >
                    <span className="text-lg">{selectedCategory.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('wizard.summaryCategory')}</p>
                    <p className="font-medium">{selectedCategory.name_fr}</p>
                  </div>
                </div>
              )}

              {/* Media count */}
              {mediaFiles.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Image className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('wizard.summaryFiles')}</p>
                    <p className="font-medium">{t('wizard.fileCount', { count: mediaFiles.length })}</p>
                  </div>
                </div>
              )}

              {/* Memory date */}
              {memoryDate && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('wizard.summaryDate')}</p>
                    <p className="font-medium">{formatMemoryDate(memoryDate, t, getLocale)}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('wizard.summaryTags')}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 rounded-full bg-muted text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <Button
                size="mobileLg"
                className="w-full gap-3 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                onClick={onPublish}
                disabled={isSaving}
              >
                <Send className="w-6 h-6" />
                {t('wizard.publish')}
              </Button>
              <Button
                variant="mobileSecondary"
                size="mobile"
                className="w-full gap-3"
                onClick={onSaveDraft}
                disabled={isSaving}
              >
                <Save className="w-5 h-5" />
                {t('wizard.saveDraft')}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header - Larger and more readable */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-border shadow-sm px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-foreground font-semibold text-lg p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>
              {currentStep === 0 ? t('wizard.cancel') : t('wizard.back')}
            </span>
          </button>
          <span className="text-lg font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {t('wizard.stepOf', { current: currentStep + 1, total: STEPS.length })}
          </span>
        </div>
        
        {/* Progress bar - Thicker */}
        <Progress value={progress} className="h-3 rounded-full" />
        
        {/* Step indicators - Larger */}
        <div className="flex justify-between mt-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isActive && "text-secondary",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  isActive && "bg-secondary text-white shadow-md scale-110",
                  isCompleted && "bg-green-100 text-green-600",
                  !isActive && !isCompleted && "bg-muted"
                )}>
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs font-semibold">{step.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Content - More padding */}
      <main className="flex-1 px-5 py-8 pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation - MUCH LARGER touch target */}
      {currentStep < STEPS.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-2 border-border p-5 safe-area-inset-bottom">
          <Button
            size="lg"
            className={cn(
              "w-full h-16 text-xl gap-3",
              canGoNext() 
                ? "bg-secondary hover:bg-secondary/90 text-white shadow-lg" 
                : "bg-muted text-muted-foreground"
            )}
            onClick={goNext}
            disabled={!canGoNext()}
          >
            {t('wizard.continue')}
            <ArrowRight className="w-7 h-7" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCapsuleWizard;
