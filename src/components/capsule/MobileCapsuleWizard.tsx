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
  Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fr, enUS, es, ko, zhCN, type Locale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import CapsuleTypeSelector from '@/components/capsule/CapsuleTypeSelector';
import TagInput from '@/components/capsule/TagInput';
import MediaUpload, { type MediaFile } from '@/components/capsule/MediaUpload';
import CategorySelector from '@/components/capsule/CategorySelector';
import MemoryDateSelector, { 
  type MemoryDateValue, 
  formatMemoryDate 
} from '@/components/capsule/MemoryDateSelector';

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
  // Type
  capsuleType: CapsuleType;
  onCapsuleTypeChange: (type: CapsuleType) => void;
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
  onUploadAllRef?: (uploadFn: () => Promise<import('./MediaUpload').UploadResult>) => void;
}

const STEP_KEYS = ['type', 'info', 'media', 'details', 'review'] as const;
const STEP_ICONS = [Sparkles, Type, Image, Tag, Check];

const MobileCapsuleWizard = ({
  userId,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  content,
  onContentChange,
  capsuleType,
  onCapsuleTypeChange,
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
    label: t(`wizard.steps.${key}`),
    icon: STEP_ICONS[index],
  }));

  // For text capsules, we skip the media step, so we have 4 steps instead of 5
  const effectiveSteps = capsuleType === 'text' ? STEPS.filter(s => s.id !== 'media') : STEPS;
  
  // Calculate current step number for display (accounting for skipped steps)
  const getDisplayStepNumber = () => {
    if (capsuleType === 'text') {
      // For text: step 0=1, step 1=2, step 3=3, step 4=4
      if (currentStep <= 1) return currentStep + 1;
      if (currentStep === 3) return 3;
      if (currentStep === 4) return 4;
    }
    return currentStep + 1;
  };

  const progress = (getDisplayStepNumber() / effectiveSteps.length) * 100;

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Type
        return true;
      case 1: // Info
        return title.trim().length > 0;
      case 2: // Media
        if (capsuleType === 'text') return true;
        return mediaFiles.length > 0; // Remove check for uploaded status - upload happens on publish
      case 3: // Details
        return true;
      case 4: // Review
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    // Skip media step for text capsules
    if (currentStep === 1 && capsuleType === 'text') {
      setCurrentStep(3); // Go directly to details
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    // Skip media step for text capsules when going back
    if (currentStep === 3 && capsuleType === 'text') {
      setCurrentStep(1); // Go back to info
    } else if (currentStep > 0) {
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
      case 0: // Type selection
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.typeTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('wizard.typeSubtitle')}
              </p>
            </div>
            
            <CapsuleTypeSelector 
              value={capsuleType} 
              onChange={onCapsuleTypeChange} 
            />
          </div>
        );

      case 1: // Basic info
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.infoTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('wizard.infoSubtitle')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  {t('wizard.titleLabel')}
                </Label>
                <Input
                  placeholder={t('wizard.titlePlaceholder')}
                  className="h-14 text-lg px-4"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  {t('wizard.descriptionLabel')}
                </Label>
                <Textarea
                  placeholder={t('wizard.descriptionPlaceholder')}
                  className="min-h-[120px] text-base px-4 py-3"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                />
              </div>

              {capsuleType === 'text' && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    {t('wizard.contentLabel')}
                  </Label>
                  <Textarea
                    placeholder={t('wizard.contentPlaceholder')}
                    className="min-h-[200px] text-base px-4 py-3"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Media upload
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('wizard.mediaTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t(`wizard.mediaSubtitle.${capsuleType}`)}
              </p>
            </div>

            {mediaError && (
              <p className="text-sm text-destructive text-center mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                {t('wizard.mediaError')}
              </p>
            )}

            <MediaUpload
              userId={userId}
              files={mediaFiles}
              onFilesChange={(files) => {
                onMediaFilesChange(files);
                if (mediaError) setMediaError(false);
              }}
              maxFiles={capsuleType === 'mixed' ? 20 : 10}
              showAudioRecorder={capsuleType === 'audio' || capsuleType === 'mixed'}
              acceptedTypes={
                capsuleType === 'photo' 
                  ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
                  : capsuleType === 'video'
                    ? ['video/mp4', 'video/webm', 'video/quicktime']
                    : capsuleType === 'audio'
                      ? ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg']
                      : undefined
              }
              onUploadAll={onUploadAllRef}
            />
          </div>
        );

      case 3: // Details (category, tags, date)
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

      case 4: // Review
        const TypeIcon = getTypeIcon(capsuleType);
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

              {/* Type */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('wizard.summaryType')}</p>
                  <p className="font-medium">{getTypeLabel(capsuleType)}</p>
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-white/80 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">
              {currentStep === 0 ? t('wizard.cancel') : t('wizard.back')}
            </span>
          </button>
          <span className="text-white font-semibold text-base">
            {t('wizard.stepOf', { current: getDisplayStepNumber(), total: effectiveSteps.length })}
          </span>
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            // Skip media step indicator for text capsules
            if (step.id === 'media' && capsuleType === 'text') {
              return null;
            }
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-1",
                  isActive && "text-secondary",
                  isCompleted && "text-secondary/60",
                  !isActive && !isCompleted && "text-white/40"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isActive && "bg-secondary text-primary-foreground",
                  isCompleted && "bg-secondary/30",
                  !isActive && !isCompleted && "bg-white/10"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 pb-32">
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

      {/* Bottom navigation - hidden on review step */}
      {currentStep < STEPS.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-inset-bottom">
          <Button
            size="mobileLg"
            className="w-full gap-3 bg-gradient-gold text-primary-foreground shadow-gold"
            onClick={goNext}
            disabled={!canGoNext()}
          >
            {t('wizard.continue')}
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCapsuleWizard;
