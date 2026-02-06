import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Send,
  HelpCircle,
  ChevronRight,
  Image,
  Video,
  Music,
  FileText,
  Calendar,
  Tag,
  FolderOpen,
  Check,
  Info,
  Youtube
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import TagInput from './TagInput';
import UnifiedMediaSection, { type MediaFile, type UploadResult } from './UnifiedMediaSection';
import CategorySelector from './CategorySelector';
import MemoryDateSelector, { type MemoryDateValue } from './MemoryDateSelector';
import YouTubeEmbed from './YouTubeEmbed';

import logo from '@/assets/logo.png';

import type { Category, SubCategory } from '@/hooks/useCategories';

interface SeniorFriendlyEditorProps {
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
  onCreateCustomCategory: (name: string, desc: string, icon: string, color: string) => Promise<Category | null>;
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  memoryDate: MemoryDateValue | null;
  onMemoryDateChange: (date: MemoryDateValue | null) => void;
  youtubeUrl: string | null;
  onYoutubeUrlChange: (url: string | null) => void;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
  onUploadAllRef?: (uploadFn: () => Promise<UploadResult>) => void;
  hasMediaError?: boolean;
  onMediaErrorReset?: () => void;
  promptFromUrl?: string | null;
}

// Step configuration with distinct colors per step
const STEPS = [
  { 
    id: 'title', 
    icon: FileText, 
    colorClass: 'bg-primary text-primary-foreground',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30'
  },
  { 
    id: 'content', 
    icon: Image, 
    colorClass: 'bg-accent text-accent-foreground',
    bgClass: 'bg-accent/10',
    borderClass: 'border-accent/30'
  },
  { 
    id: 'details', 
    icon: FolderOpen, 
    colorClass: 'bg-secondary text-secondary-foreground',
    bgClass: 'bg-secondary/10',
    borderClass: 'border-secondary/30'
  },
  { 
    id: 'finish', 
    icon: Check, 
    colorClass: 'bg-primary text-primary-foreground',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30'
  },
] as const;

// Animation variants - use type-safe easing
const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: { 
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: [0.4, 0, 0.6, 1] as const }
  }
};

const SeniorFriendlyEditor = ({
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
  youtubeUrl,
  onYoutubeUrlChange,
  isSaving,
  onSaveDraft,
  onPublish,
  onBack,
  onUploadAllRef,
  hasMediaError = false,
  promptFromUrl,
}: SeniorFriendlyEditorProps) => {
  const { t } = useTranslation('capsules');
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canContinue = () => {
    switch (currentStep) {
      case 0: return title.trim().length > 0;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canContinue()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  // Info tooltip component
  const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          type="button" 
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-muted/80 ml-2"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {text}
      </TooltipContent>
    </Tooltip>
  );

  // Step indicator component for vertical navigation
  const StepIndicator = ({ 
    step, 
    index, 
    isActive, 
    isCompleted,
    isLast
  }: { 
    step: typeof STEPS[number]; 
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    isLast: boolean;
  }) => {
    const StepIcon = step.icon;
    const stepLabels = [
      t('seniorEditor.step1Label', 'Donnez un titre'),
      t('seniorEditor.step2Label', 'Ajoutez du contenu'),
      t('seniorEditor.step3Label', 'Organisez'),
      t('seniorEditor.step4Label', 'Vérifiez et publiez')
    ];

    return (
      <div className="flex items-start gap-3">
        {/* Vertical line connector */}
        <div className="flex flex-col items-center">
          <motion.button
            type="button"
            onClick={() => goToStep(index)}
            disabled={index > currentStep}
            variants={isActive ? pulseVariants : undefined}
            initial="initial"
            animate={isActive ? "pulse" : "initial"}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isActive && step.colorClass,
              isCompleted && "bg-primary text-primary-foreground",
              !isActive && !isCompleted && "bg-muted text-muted-foreground",
              index <= currentStep && "cursor-pointer hover:scale-105",
              index > currentStep && "cursor-not-allowed opacity-60"
            )}
          >
            {isCompleted ? (
              <Check className="w-6 h-6" />
            ) : (
              <span>{index + 1}</span>
            )}
          </motion.button>
          
          {/* Vertical line */}
          {!isLast && (
            <div className={cn(
              "w-0.5 h-8 mt-2 transition-colors",
              isCompleted ? "bg-primary/60" : "bg-border"
            )} />
          )}
        </div>

        {/* Step label */}
        <div className="pt-2.5">
          <p className={cn(
            "font-semibold text-base transition-colors",
            isActive && "text-foreground",
            isCompleted && "text-primary",
            !isActive && !isCompleted && "text-muted-foreground"
          )}>
            {stepLabels[index]}
          </p>
          {isActive && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-muted-foreground mt-0.5"
            >
              {t('seniorEditor.stepActive', 'Étape en cours')}
            </motion.p>
          )}
          {isCompleted && (
            <p className="text-sm text-primary mt-0.5">
              ✓ {t('seniorEditor.stepCompleted', 'Terminé')}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      // Step 1: Title and Description
      case 0:
        return (
          <div 
            className="space-y-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Prompt hint if present */}
            {promptFromUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-start gap-3"
              >
                <Info className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-medium text-foreground">
                    {t('seniorEditor.promptHint', 'Suggestion de thème :')}
                  </p>
                  <p className="text-base text-secondary italic mt-1">
                    "{promptFromUrl}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Title input - LARGE */}
            <div className="space-y-3">
              <label className="text-xl font-semibold text-foreground flex items-center">
                {t('seniorEditor.titleLabel', 'Titre du souvenir')}
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                placeholder={t('seniorEditor.titlePlaceholder', 'Ex: Vacances à la mer en 1975')}
                className="h-16 text-xl px-5 border-2 focus:border-primary"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                {t('seniorEditor.titleHelp', 'Un titre court et mémorable (maximum 100 caractères)')}
              </p>
            </div>

            {/* Description - optional */}
            <div className="space-y-3">
              <label className="text-xl font-semibold text-foreground flex items-center">
                {t('seniorEditor.descLabel', 'Description (optionnel)')}
                <InfoTip text={t('seniorEditor.descTip', 'Une courte description pour vous rappeler de quoi parle ce souvenir')} />
              </label>
              <Textarea
                placeholder={t('seniorEditor.descPlaceholder', 'Décrivez brièvement ce souvenir...')}
                className="min-h-[120px] text-lg px-5 py-4 border-2 focus:border-primary resize-none"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
              />
            </div>
          </div>
        );

      // Step 2: Content (Text, Media, YouTube)
      case 1:
        return (
          <div 
            className="space-y-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Text section */}
            <div className={cn(
              "bg-card border-2 rounded-2xl p-6 space-y-4",
              content.trim() ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('seniorEditor.textTitle', 'Écrire un texte')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('seniorEditor.textDesc', 'Lettre, histoire, anecdote...')}
                  </p>
                </div>
                {content.trim() && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                    <Check className="w-3 h-3 mr-1" /> {t('seniorEditor.added', 'Ajouté')}
                  </Badge>
                )}
              </div>
              <Textarea
                placeholder={t('seniorEditor.textPlaceholder', 'Écrivez votre texte ici...')}
                className="min-h-[180px] text-lg px-4 py-3 border-2 focus:border-primary resize-none"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
              />
            </div>

            {/* Media section */}
            <div className={cn(
              "bg-card border-2 rounded-2xl p-6 space-y-4",
              mediaFiles.length > 0 ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('seniorEditor.mediaTitle', 'Ajouter des médias')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('seniorEditor.mediaDesc', 'Photos, vidéos ou lien YouTube')}
                  </p>
                </div>
                {mediaFiles.length > 0 && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                    {mediaFiles.length} {t('seniorEditor.files', 'fichier(s)')}
                  </Badge>
                )}
              </div>
              
              <UnifiedMediaSection
                userId={userId}
                content=""
                onContentChange={() => {}}
                showTextSection={false}
                files={mediaFiles}
                onFilesChange={onMediaFilesChange}
                maxFiles={20}
                onUploadAll={onUploadAllRef}
                hasError={hasMediaError}
              />

              {/* YouTube section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Youtube className="w-5 h-5 text-destructive" />
                  <span className="font-medium">{t('seniorEditor.youtubeLabel', 'Vidéo YouTube')}</span>
                  {youtubeUrl && (
                    <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                      <Check className="w-3 h-3 mr-1" /> {t('seniorEditor.added', 'Ajouté')}
                    </Badge>
                  )}
                </div>
                <YouTubeEmbed
                  value={youtubeUrl}
                  onChange={onYoutubeUrlChange}
                />
              </div>
            </div>
          </div>
        );

      // Step 3: Details (Category, Date, Tags)
      case 2:
        return (
          <div 
            className="space-y-5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Category */}
            <div className={cn(
              "bg-card border-2 rounded-2xl p-6",
              primaryCategory ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('seniorEditor.categoryTitle', 'Catégorie')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('seniorEditor.categoryDesc', 'Dans quelle catégorie classer ce souvenir ?')}
                  </p>
                </div>
                {primaryCategory && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                    <Check className="w-3 h-3 mr-1" /> {t('seniorEditor.selected', 'Sélectionné')}
                  </Badge>
                )}
              </div>
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

            {/* Date */}
            <div className={cn(
              "bg-card border-2 rounded-2xl p-6",
              memoryDate ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('seniorEditor.dateTitle', 'Date du souvenir')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('seniorEditor.dateDesc', 'Quand ce souvenir a-t-il eu lieu ?')}
                  </p>
                </div>
                {memoryDate && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                    <Check className="w-3 h-3 mr-1" /> {t('seniorEditor.selected', 'Sélectionné')}
                  </Badge>
                )}
              </div>
              <MemoryDateSelector
                value={memoryDate}
                onChange={onMemoryDateChange}
              />
            </div>

            {/* Tags */}
            <div className={cn(
              "bg-card border-2 rounded-2xl p-6",
              tags.length > 0 ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('seniorEditor.tagsTitle', 'Mots-clés')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('seniorEditor.tagsDesc', 'Ajoutez des mots pour retrouver facilement ce souvenir')}
                  </p>
                </div>
                {tags.length > 0 && (
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/30">
                    {tags.length} {t('seniorEditor.keywords', 'mot(s)-clé(s)')}
                  </Badge>
                )}
              </div>
              <TagInput tags={tags} onChange={onTagsChange} />
            </div>
          </div>
        );

      // Step 4: Review and Publish
      case 3:
        const selectedCategory = categories.find(c => c.id === primaryCategory);
        const photoCount = mediaFiles.filter(f => f.type === 'image').length;
        const videoCount = mediaFiles.filter(f => f.type === 'video').length;
        const audioCount = mediaFiles.filter(f => f.type === 'audio').length;
        
        return (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="bg-card border-2 border-secondary/40 rounded-2xl p-6 space-y-5">
              {/* Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {t('seniorEditor.reviewTitle', 'Titre')}
                  </p>
                  <p className="text-xl font-semibold text-foreground">{title || '—'}</p>
                </div>
              </div>

              {/* Category */}
              {selectedCategory && (
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                  >
                    <span className="text-2xl">{selectedCategory.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {t('seniorEditor.reviewCategory', 'Catégorie')}
                    </p>
                    <p className="text-xl font-semibold text-foreground">{selectedCategory.name_fr}</p>
                  </div>
                </div>
              )}

              {/* Content summary */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {t('seniorEditor.reviewContent', 'Contenu')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.trim() && (
                      <Badge variant="outline" className="text-base">
                        <FileText className="w-4 h-4 mr-1" /> {t('seniorEditor.text', 'Texte')}
                      </Badge>
                    )}
                    {photoCount > 0 && (
                      <Badge variant="outline" className="text-base">
                        <Image className="w-4 h-4 mr-1" /> {photoCount} photo{photoCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {videoCount > 0 && (
                      <Badge variant="outline" className="text-base">
                        <Video className="w-4 h-4 mr-1" /> {videoCount} {t('seniorEditor.video', 'vidéo')}{videoCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {audioCount > 0 && (
                      <Badge variant="outline" className="text-base">
                        <Music className="w-4 h-4 mr-1" /> {audioCount} audio
                      </Badge>
                    )}
                    {youtubeUrl && (
                      <Badge variant="outline" className="text-base">
                        <Youtube className="w-4 h-4 mr-1" /> YouTube
                      </Badge>
                    )}
                    {!content.trim() && photoCount === 0 && videoCount === 0 && audioCount === 0 && !youtubeUrl && (
                      <span className="text-muted-foreground italic">{t('seniorEditor.noContent', 'Aucun contenu ajouté')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {t('seniorEditor.reviewTags', 'Mots-clés')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-base">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons - VERY LARGE */}
            <div className="space-y-4 pt-4">
              <Button
                size="lg"
                className="w-full h-16 text-xl gap-3 bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 text-secondary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                onClick={onPublish}
                disabled={isSaving}
              >
                <Send className="w-7 h-7" />
                {t('seniorEditor.publish', 'Publier mon souvenir')}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg gap-3 border-2"
                onClick={onSaveDraft}
                disabled={isSaving}
              >
                <Save className="w-6 h-6" />
                {t('seniorEditor.saveDraft', 'Enregistrer comme brouillon')}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header with branding */}
      <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Top row: Logo and back button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="FamilyGarden" className="w-10 h-10 rounded-xl" />
              <div className="hidden sm:block">
                <span className="font-display font-semibold text-lg text-foreground">
                  Family<span className="text-secondary">Garden</span>
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={currentStep === 0 ? onBack : prevStep}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentStep === 0 
                  ? t('seniorEditor.cancel', 'Annuler') 
                  : t('seniorEditor.back', 'Retour')
                }
              </span>
            </Button>
          </div>

          {/* Title and progress */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {t('seniorEditor.createMemory', 'Nouveau souvenir')}
            </h1>
            <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
              {t('seniorEditor.stepOf', 'Étape {{current}} sur {{total}}', { 
                current: currentStep + 1, 
                total: STEPS.length 
              })}
            </span>
          </div>

          {/* Progress bar with gradient */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* Main layout: Sidebar + Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Vertical step navigation - Desktop sidebar / Mobile horizontal */}
          <nav className="md:w-64 flex-shrink-0">
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={index > currentStep}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl min-w-[80px] transition-all",
                      isActive && step.bgClass + " border-2 " + step.borderClass,
                      isCompleted && "bg-primary/10 border-2 border-primary/30",
                      !isActive && !isCompleted && "bg-muted",
                      index <= currentStep && "cursor-pointer",
                      index > currentStep && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                      isActive && step.colorClass,
                      isCompleted && "bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "bg-background text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isActive && "text-foreground",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {t(`seniorEditor.step${step.id.charAt(0).toUpperCase() + step.id.slice(1)}`, step.id)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Desktop: Vertical sidebar */}
            <div className="hidden md:block sticky top-32 bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="space-y-2">
                {STEPS.map((step, index) => (
                  <StepIndicator
                    key={step.id}
                    step={step}
                    index={index}
                    isActive={index === currentStep}
                    isCompleted={index < currentStep}
                    isLast={index === STEPS.length - 1}
                  />
                ))}
              </div>
            </div>
          </nav>

          {/* Main content area */}
          <main className="flex-1 min-w-0">
            {/* Step header */}
            <motion.div
              key={`header-${currentStep}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md",
                  STEPS[currentStep].colorClass
                )}>
                  {(() => {
                    const StepIcon = STEPS[currentStep].icon;
                    return <StepIcon className="w-7 h-7" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {currentStep === 0 && t('seniorEditor.titleStepTitle', 'Donnez un titre à votre souvenir')}
                    {currentStep === 1 && t('seniorEditor.contentStepTitle', 'Ajoutez votre contenu')}
                    {currentStep === 2 && t('seniorEditor.detailsStepTitle', 'Organisez votre souvenir')}
                    {currentStep === 3 && t('seniorEditor.reviewStepTitle', 'Vérifiez avant de publier')}
                  </h2>
                  <p className="text-base text-muted-foreground mt-1">
                    {currentStep === 0 && t('seniorEditor.titleStepDesc', "C'est la première chose que vous verrez. Choisissez un titre qui vous parle.")}
                    {currentStep === 1 && t('seniorEditor.contentStepDesc', 'Texte, photos, vidéos, audio... Ajoutez ce que vous souhaitez !')}
                    {currentStep === 2 && t('seniorEditor.detailsStepDesc', 'Ces informations vous aideront à retrouver ce souvenir plus tard')}
                    {currentStep === 3 && t('seniorEditor.reviewStepDesc', 'Relisez les informations ci-dessous avant de sauvegarder')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step content with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Fixed bottom navigation - LARGE buttons */}
      {currentStep < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-sm border-t border-border p-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex gap-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-6 text-lg gap-2 border-2"
                onClick={prevStep}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{t('seniorEditor.back', 'Retour')}</span>
              </Button>
            )}
            
            <Button
              size="lg"
              className={cn(
                "flex-1 h-14 text-lg gap-3 transition-all",
                canContinue() 
                  ? "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg hover:scale-[1.01]" 
                  : "bg-muted text-muted-foreground"
              )}
              onClick={nextStep}
              disabled={!canContinue()}
            >
              {t('seniorEditor.continue', 'Continuer')}
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorFriendlyEditor;
