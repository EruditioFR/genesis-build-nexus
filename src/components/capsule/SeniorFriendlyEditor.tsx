import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Send, HelpCircle, ChevronRight, ChevronDown, Image, Video, Music, FileText, Calendar, Tag, FolderOpen, Check, Info, Play, X, Plus, Mic, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import TagInput from './TagInput';
import UnifiedMediaSection, { type MediaFile, type UploadResult } from './UnifiedMediaSection';
import CategorySelector from './CategorySelector';
import MemoryDateSelector, { type MemoryDateValue } from './MemoryDateSelector';
import YouTubeEmbed from './YouTubeEmbed';
import type { Category, SubCategory } from '@/hooks/useCategories';
interface SeniorFriendlyEditorProps {
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
  onCreateCustomCategory: (name: string, desc: string, icon: string, color: string) => Promise<Category | null>;
  // Media
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  // Tags
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  // Memory date
  memoryDate: MemoryDateValue | null;
  onMemoryDateChange: (date: MemoryDateValue | null) => void;
  // YouTube
  youtubeUrl: string | null;
  onYoutubeUrlChange: (url: string | null) => void;
  // Actions
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
  // Upload function ref
  onUploadAllRef?: (uploadFn: () => Promise<UploadResult>) => void;
  // Error state
  hasMediaError?: boolean;
  onMediaErrorReset?: () => void;
  // Initial prompt
  promptFromUrl?: string | null;
}

// Step configuration with icons and descriptions
const STEPS = [{
  id: 'title',
  icon: FileText,
  color: 'text-blue-600',
  bgColor: 'bg-blue-100'
}, {
  id: 'content',
  icon: Image,
  color: 'text-green-600',
  bgColor: 'bg-green-100'
}, {
  id: 'details',
  icon: FolderOpen,
  color: 'text-purple-600',
  bgColor: 'bg-purple-100'
}, {
  id: 'finish',
  icon: Check,
  color: 'text-amber-600',
  bgColor: 'bg-amber-100'
}] as const;
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
  onMediaErrorReset,
  promptFromUrl
}: SeniorFriendlyEditorProps) => {
  const {
    t
  } = useTranslation('capsules');
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    text: true,
    photos: false,
    videos: false,
    audio: false,
    youtube: false,
    category: false,
    date: false,
    tags: false
  });

  // Auto-expand title section if we have a prompt
  useEffect(() => {
    if (promptFromUrl && title) {
      // If there's a prompt, show a hint that it's pre-filled
    }
  }, [promptFromUrl, title]);
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const progress = (currentStep + 1) / STEPS.length * 100;
  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return title.trim().length > 0;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
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

  // Section component with large, clear UI
  const Section = ({
    id,
    icon: Icon,
    title,
    description,
    children,
    badge,
    required = false
  }: {
    id: string;
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
    badge?: string;
    required?: boolean;
  }) => {
    const isExpanded = expandedSections[id];
    return <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm">
        <button type="button" onClick={() => toggleSection(id)} className={cn("w-full flex items-center gap-4 p-5 text-left transition-colors", "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset")} aria-expanded={isExpanded}>
          <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0", "bg-secondary/10")}>
            <Icon className="w-7 h-7 text-secondary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-foreground">
                {title}
              </h3>
              {required && <span className="text-destructive text-xl">*</span>}
              {badge && <Badge variant="secondary" className="text-sm">
                  {badge}
                </Badge>}
            </div>
            <p className="text-base text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          
          <ChevronDown className={cn("w-6 h-6 text-muted-foreground transition-transform flex-shrink-0", isExpanded && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isExpanded && <motion.div initial={{
          height: 0,
          opacity: 0
        }} animate={{
          height: 'auto',
          opacity: 1
        }} exit={{
          height: 0,
          opacity: 0
        }} transition={{
          duration: 0.2
        }} className="overflow-hidden">
              <div className="p-5 pt-0 border-t border-border bg-muted/20">
                {children}
              </div>
            </motion.div>}
        </AnimatePresence>
      </motion.div>;
  };

  // Info tooltip component
  const InfoTip = ({
    text
  }: {
    text: string;
  }) => <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-muted/80 ml-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {text}
      </TooltipContent>
    </Tooltip>;
  const renderStep = () => {
    switch (currentStep) {
      // Step 1: Title and Description (Essential info)
      case 0:
        return <div className="space-y-6">
            {/* Welcoming header */}
            <div className="text-center py-6">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg mb-4">
                <FileText className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {t('seniorEditor.titleStepTitle', 'Donnez un titre à votre souvenir')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t('seniorEditor.titleStepDesc', "C'est la première chose que vous verrez. Choisissez un titre qui vous parle.")}
              </p>
            </div>

            {/* Prompt hint if present */}
            {promptFromUrl}

            {/* Title input - LARGE */}
            <div className="space-y-3">
              <label className="text-xl font-semibold text-foreground flex items-center">
                {t('seniorEditor.titleLabel', 'Titre du souvenir')}
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input placeholder={t('seniorEditor.titlePlaceholder', 'Ex: Vacances à la mer en 1975')} className="h-16 text-xl px-5 border-2 focus:border-secondary" value={title} onChange={e => onTitleChange(e.target.value)} autoFocus />
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
              <Textarea placeholder={t('seniorEditor.descPlaceholder', 'Décrivez brièvement ce souvenir...')} className="min-h-[120px] text-lg px-5 py-4 border-2 focus:border-secondary resize-none" value={description} onChange={e => onDescriptionChange(e.target.value)} />
            </div>
          </div>;

      // Step 2: Content (Text, Media, YouTube)
      case 1:
        return <div className="space-y-5">
            {/* Header */}
            <div className="text-center py-4">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
                <Image className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {t('seniorEditor.contentStepTitle', 'Ajoutez votre contenu')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t('seniorEditor.contentStepDesc', 'Texte, photos, vidéos, audio... Ajoutez ce que vous souhaitez !')}
              </p>
            </div>

            {/* Content sections as expandable cards */}
            <div className="space-y-4">
              {/* Text section */}
              <Section id="text" icon={FileText} title={t('seniorEditor.textTitle', 'Écrire un texte')} description={t('seniorEditor.textDesc', 'Lettre, histoire, anecdote...')} badge={content.trim() ? '✓' : undefined}>
                <Textarea placeholder={t('seniorEditor.textPlaceholder', 'Écrivez votre texte ici...')} className="min-h-[200px] text-lg px-4 py-3 border-2 focus:border-secondary resize-none" value={content} onChange={e => onContentChange(e.target.value)} />
              </Section>

              {/* Photos section */}
              <Section id="photos" icon={Image} title={t('seniorEditor.photosTitle', 'Ajouter des photos')} description={t('seniorEditor.photosDesc', 'Glissez vos photos ou cliquez pour les sélectionner')} badge={mediaFiles.filter(f => f.type === 'image').length > 0 ? `${mediaFiles.filter(f => f.type === 'image').length}` : undefined}>
                <UnifiedMediaSection userId={userId} content="" onContentChange={() => {}} showTextSection={false} files={mediaFiles} onFilesChange={onMediaFilesChange} maxFiles={20} onUploadAll={onUploadAllRef} hasError={hasMediaError} />
              </Section>

              {/* YouTube section */}
              <Section id="youtube" icon={Youtube} title={t('seniorEditor.youtubeTitle', 'Ajouter une vidéo YouTube')} description={t('seniorEditor.youtubeDesc', 'Collez un lien YouTube pour intégrer une vidéo')} badge={youtubeUrl ? '✓' : undefined}>
                <YouTubeEmbed value={youtubeUrl} onChange={onYoutubeUrlChange} />
              </Section>
            </div>
          </div>;

      // Step 3: Details (Category, Date, Tags)
      case 2:
        return <div className="space-y-5">
            {/* Header */}
            <div className="text-center py-4">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                <FolderOpen className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {t('seniorEditor.detailsStepTitle', 'Organisez votre souvenir')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t('seniorEditor.detailsStepDesc', 'Ces informations vous aideront à retrouver ce souvenir plus tard')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <Section id="category" icon={FolderOpen} title={t('seniorEditor.categoryTitle', 'Catégorie')} description={t('seniorEditor.categoryDesc', 'Dans quelle catégorie classer ce souvenir ?')} badge={primaryCategory ? '✓' : undefined}>
                <CategorySelector categories={categories} primaryCategory={primaryCategory} onPrimaryChange={onPrimaryCategoryChange} onCreateCustom={onCreateCustomCategory} subCategories={subCategories} selectedSubCategories={selectedSubCategories} onSubCategoryChange={onSubCategoriesChange} />
              </Section>

              {/* Date */}
              <Section id="date" icon={Calendar} title={t('seniorEditor.dateTitle', 'Date du souvenir')} description={t('seniorEditor.dateDesc', 'Quand ce souvenir a-t-il eu lieu ?')} badge={memoryDate ? '✓' : undefined}>
                <div className="pt-2">
                  <MemoryDateSelector value={memoryDate} onChange={onMemoryDateChange} />
                </div>
              </Section>

              {/* Tags */}
              <Section id="tags" icon={Tag} title={t('seniorEditor.tagsTitle', 'Mots-clés')} description={t('seniorEditor.tagsDesc', 'Ajoutez des mots pour retrouver facilement ce souvenir')} badge={tags.length > 0 ? `${tags.length}` : undefined}>
                <TagInput tags={tags} onChange={onTagsChange} />
              </Section>
            </div>
          </div>;

      // Step 4: Review and Publish
      case 3:
        const selectedCategory = categories.find(c => c.id === primaryCategory);
        const photoCount = mediaFiles.filter(f => f.type === 'image').length;
        const videoCount = mediaFiles.filter(f => f.type === 'video').length;
        const audioCount = mediaFiles.filter(f => f.type === 'audio').length;
        return <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-4">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg mb-4">
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {t('seniorEditor.reviewStepTitle', 'Vérifiez avant de publier')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t('seniorEditor.reviewStepDesc', 'Relisez les informations ci-dessous avant de sauvegarder')}
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-5">
              {/* Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {t('seniorEditor.reviewTitle', 'Titre')}
                  </p>
                  <p className="text-xl font-semibold text-foreground">{title || '—'}</p>
                </div>
              </div>

              {/* Category */}
              {selectedCategory && <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                backgroundColor: `${selectedCategory.color}20`
              }}>
                    <span className="text-2xl">{selectedCategory.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {t('seniorEditor.reviewCategory', 'Catégorie')}
                    </p>
                    <p className="text-xl font-semibold text-foreground">{selectedCategory.name_fr}</p>
                  </div>
                </div>}

              {/* Content summary */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {t('seniorEditor.reviewContent', 'Contenu')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.trim() && <Badge variant="outline" className="text-base">
                        <FileText className="w-4 h-4 mr-1" /> Texte
                      </Badge>}
                    {photoCount > 0 && <Badge variant="outline" className="text-base">
                        <Image className="w-4 h-4 mr-1" /> {photoCount} photo{photoCount > 1 ? 's' : ''}
                      </Badge>}
                    {videoCount > 0 && <Badge variant="outline" className="text-base">
                        <Video className="w-4 h-4 mr-1" /> {videoCount} vidéo{videoCount > 1 ? 's' : ''}
                      </Badge>}
                    {audioCount > 0 && <Badge variant="outline" className="text-base">
                        <Music className="w-4 h-4 mr-1" /> {audioCount} audio
                      </Badge>}
                    {youtubeUrl && <Badge variant="outline" className="text-base">
                        <Youtube className="w-4 h-4 mr-1" /> YouTube
                      </Badge>}
                    {!content.trim() && photoCount === 0 && videoCount === 0 && audioCount === 0 && !youtubeUrl && <span className="text-muted-foreground italic">Aucun contenu ajouté</span>}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {t('seniorEditor.reviewTags', 'Mots-clés')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags.map(tag => <Badge key={tag} variant="secondary" className="text-base">
                          #{tag}
                        </Badge>)}
                    </div>
                  </div>
                </div>}
            </div>

            {/* Action buttons - VERY LARGE */}
            <div className="space-y-4 pt-4">
              <Button size="lg" className="w-full h-16 text-xl gap-3 bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 text-white shadow-lg" onClick={onPublish} disabled={isSaving}>
                <Send className="w-7 h-7" />
                {t('seniorEditor.publish', 'Publier mon souvenir')}
              </Button>
              
              <Button variant="outline" size="lg" className="w-full h-14 text-lg gap-3 border-2" onClick={onSaveDraft} disabled={isSaving}>
                <Save className="w-6 h-6" />
                {t('seniorEditor.saveDraft', 'Enregistrer comme brouillon')}
              </Button>
            </div>
          </div>;
    }
  };
  return <div className="min-h-screen bg-gradient-warm">
      {/* Fixed header with progress */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Back button and step indicator */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="lg" className="gap-2 text-lg -ml-2" onClick={currentStep === 0 ? onBack : prevStep}>
              <ArrowLeft className="w-5 h-5" />
              {currentStep === 0 ? t('seniorEditor.cancel', 'Annuler') : t('seniorEditor.back', 'Retour')}
            </Button>
            
            <span className="text-lg font-medium text-muted-foreground">
              {t('seniorEditor.stepOf', 'Étape {{current}} sur {{total}}', {
              current: currentStep + 1,
              total: STEPS.length
            })}
            </span>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-3 rounded-full" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return <div key={step.id} className={cn("flex flex-col items-center gap-2 transition-all", isActive && "text-secondary", isCompleted && "text-green-600", !isActive && !isCompleted && "text-muted-foreground")}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", isActive && "bg-secondary text-white shadow-md scale-110", isCompleted && "bg-green-100 text-green-600", !isActive && !isCompleted && "bg-muted")}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {t(`seniorEditor.step${step.id.charAt(0).toUpperCase() + step.id.slice(1)}`, step.id)}
                  </span>
                </div>;
          })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed bottom navigation - LARGE buttons */}
      {currentStep < 3 && <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-2 border-border p-4">
          <div className="max-w-4xl mx-auto">
            <Button size="lg" className={cn("w-full h-16 text-xl gap-3", canContinue() ? "bg-secondary hover:bg-secondary/90 text-white" : "bg-muted text-muted-foreground")} onClick={nextStep} disabled={!canContinue()}>
              {t('seniorEditor.continue', 'Continuer')}
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>}
    </div>;
};
export default SeniorFriendlyEditor;