import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Type, 
  Image, 
  Video, 
  Music, 
  Layers,
  Tag,
  Calendar,
  Send,
  Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fr, enUS, es, ko, zhCN, type Locale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  categories: Category[];
  subCategories: SubCategory[];
  primaryCategory: string | null;
  onPrimaryCategoryChange: (id: string | null) => void;
  selectedSubCategories: string[];
  onSubCategoriesChange: (ids: string[]) => void;
  onCreateCustomCategory: (name: string, desc: string, icon: string, color: string) => Promise<Category>;
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  memoryDate: MemoryDateValue | null;
  onMemoryDateChange: (date: MemoryDateValue | null) => void;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
  onUploadAllRef?: (uploadFn: () => Promise<UploadResult>) => void;
}

const STEP_COUNT = 4;

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
    const localeMap: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };
    return localeMap[i18n.language] || fr;
  }, [i18n.language]);

  const progress = ((currentStep + 1) / STEP_COUNT) * 100;
  const calculatedCapsuleType = determineContentType(content, mediaFiles);

  const canGoNext = () => {
    if (currentStep === 0) return title.trim().length > 0;
    return true;
  };

  const goNext = () => {
    if (currentStep < STEP_COUNT - 1) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else onBack();
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

  // Inline continue button rendered after each step's content (except review)
  const renderContinueButton = () => (
    <Button
      size="lg"
      className={cn(
        "w-full h-14 text-lg gap-2 mt-6",
        canGoNext()
          ? "bg-secondary hover:bg-secondary/90 text-white shadow-md"
          : "bg-muted text-muted-foreground"
      )}
      onClick={goNext}
      disabled={!canGoNext()}
    >
      {t('wizard.continue')}
      <ArrowRight className="w-5 h-5" />
    </Button>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {t('wizard.infoTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('wizard.infoHelper')}
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">
                {t('wizard.titleLabel')}
              </Label>
              <Input
                placeholder={t('wizard.titlePlaceholder')}
                className="h-14 text-lg px-4 border-2 focus:border-secondary"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                {t('seniorEditor.titleHelp', 'Un titre court et mémorable')}
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">
                {t('wizard.descriptionLabel')}
              </Label>
              <Textarea
                placeholder={t('wizard.descriptionPlaceholder')}
                className="min-h-[120px] text-base px-4 py-3 border-2 focus:border-secondary"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
              />
            </div>

            {renderContinueButton()}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {t('wizard.contentTitle', 'Contenus')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('wizard.contentHelper')}
              </p>
            </div>

            {mediaError && (
              <p className="text-sm text-destructive text-center p-3 rounded-lg bg-destructive/10 border border-destructive/30">
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

            {renderContinueButton()}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {t('wizard.detailsTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('wizard.detailsHelper')}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card">
              <Label className="text-base font-semibold mb-3 block">
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

            <div className="p-3 rounded-xl border border-border bg-card">
              <Label className="text-base font-semibold mb-2 block">
                <Calendar className="w-4 h-4 inline-block mr-1.5" />
                {t('wizard.memoryDateLabel')}
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('wizard.memoryDateHelp')}
              </p>
              <MemoryDateSelector value={memoryDate} onChange={onMemoryDateChange} />
            </div>

            <div className="p-3 rounded-xl border border-border bg-card">
              <Label className="text-base font-semibold mb-3 block">
                <Tag className="w-4 h-4 inline-block mr-1.5" />
                {t('wizard.tagsLabel')}
              </Label>
              <TagInput tags={tags} onChange={onTagsChange} />
            </div>

            {renderContinueButton()}
          </div>
        );

      case 3: {
        const TypeIcon = getTypeIcon(calculatedCapsuleType);
        const selectedCategory = categories.find(c => c.id === primaryCategory);

        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground text-center">
                {t('wizard.reviewTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {t('wizard.reviewHelper')}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">{t('wizard.summaryTitle')}</p>
                <p className="text-lg font-semibold text-foreground">{title || t('wizard.noTitle')}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TypeIcon className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('wizard.summaryType')}</p>
                  <p className="text-sm font-medium">{getTypeLabel(calculatedCapsuleType)}</p>
                </div>
              </div>

              {selectedCategory && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                  >
                    <span className="text-base">{selectedCategory.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('wizard.summaryCategory')}</p>
                    <p className="text-sm font-medium">{selectedCategory.name_fr}</p>
                  </div>
                </div>
              )}

              {mediaFiles.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Image className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('wizard.summaryFiles')}</p>
                    <p className="text-sm font-medium">{t('wizard.fileCount', { count: mediaFiles.length })}</p>
                  </div>
                </div>
              )}

              {memoryDate && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('wizard.summaryDate')}</p>
                    <p className="text-sm font-medium">{formatMemoryDate(memoryDate, t, getLocale)}</p>
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t('wizard.summaryTags')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                size="mobileLg"
                className="w-full gap-3 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                onClick={onPublish}
                disabled={isSaving}
              >
                <Send className="w-5 h-5" />
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
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Compact header: back + dots + counter + thin progress */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm px-4 py-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors text-foreground"
            aria-label={currentStep === 0 ? t('wizard.cancel') : t('wizard.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all",
                  i === currentStep
                    ? "w-3 h-3 bg-secondary shadow-sm"
                    : i < currentStep
                      ? "w-2 h-2 bg-green-500"
                      : "w-2 h-2 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <span className="text-sm font-semibold text-muted-foreground">
            {currentStep + 1}/{STEP_COUNT}
          </span>
        </div>

        {/* Thin progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MobileCapsuleWizard;
