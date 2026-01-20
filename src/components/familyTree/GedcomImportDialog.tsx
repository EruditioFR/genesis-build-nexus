import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Users, Heart, Loader2, UserCheck, UserPlus, SkipForward, Zap } from 'lucide-react';
// Removed framer-motion animations for Android compatibility
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { parseGedcom, isValidGedcomFile, type GedcomParseResult, type GedcomIndividual } from '@/lib/gedcomParser';
import { detectDuplicates, type DuplicateMatch, type MergeDecision } from '@/lib/duplicateDetection';
import type { FamilyPerson } from '@/types/familyTree';

interface GedcomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (result: GedcomParseResult, skipIds: string[]) => Promise<void>;
  existingPersons: FamilyPerson[];
}

type ImportStep = 'upload' | 'preview' | 'duplicates' | 'importing' | 'complete';

interface DuplicateDecision {
  importedId: string;
  decision: MergeDecision;
}

export function GedcomImportDialog({
  open,
  onOpenChange,
  onImport,
  existingPersons,
}: GedcomImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [parseResult, setParseResult] = useState<GedcomParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [decisions, setDecisions] = useState<Record<string, MergeDecision>>({});
  const [importStats, setImportStats] = useState({ created: 0, skipped: 0 });
  const [directImport, setDirectImport] = useState(false);

  const handleReset = () => {
    setStep('upload');
    setParseResult(null);
    setError(null);
    setProgress(0);
    setFileName('');
    setDuplicateMatches([]);
    setDecisions({});
    setImportStats({ created: 0, skipped: 0 });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('[GEDCOM] onDrop called with', acceptedFiles.length, 'files');
    const file = acceptedFiles[0];
    if (!file) {
      console.log('[GEDCOM] No file received');
      return;
    }

    console.log('[GEDCOM] Processing file:', file.name, 'type:', file.type, 'size:', file.size);

    // Vérification manuelle de l'extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'ged' && ext !== 'gedcom') {
      setError('Veuillez sélectionner un fichier .ged ou .gedcom');
      return;
    }

    setFileName(file.name);
    setError(null);

    try {
      const content = await file.text();
      console.log('[GEDCOM] File content length:', content.length);
      
      if (!isValidGedcomFile(content)) {
        setError('Ce fichier ne semble pas être un fichier GEDCOM valide.');
        return;
      }

      const result = parseGedcom(content);
      console.log('[GEDCOM] Parsed result:', result.individuals.length, 'individuals,', result.families.length, 'families');

      if (result.errors.length > 0 && result.individuals.length === 0) {
        setError(result.errors.join('\n'));
        return;
      }

      setParseResult(result);

      // Mode test: import direct sans vérification de doublons (utile sur Android)
      if (directImport) {
        console.log('[GEDCOM] Direct import enabled -> starting import');
        setStep('importing');
        setProgress(0);
        setError(null);

        try {
          const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 10, 90));
          }, 200);

          await onImport(result, []);

          clearInterval(progressInterval);
          setProgress(100);
          setImportStats({ created: result.individuals.length, skipped: 0 });
          setStep('complete');
        } catch (err) {
          console.error('[GEDCOM] Direct import error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'import. Veuillez réessayer.';
          setError(errorMessage);
          setStep('preview');
        }

        return;
      }

      console.log('[GEDCOM] Setting step to preview');
      setStep('preview');
      console.log('[GEDCOM] Step set to preview, parseResult set');
    } catch (err) {
      console.error('[GEDCOM] Error parsing:', err);
      setError('Erreur lors de la lecture du fichier. Vérifiez le format.');
    }
  }, [directImport, onImport]);

  const onDropRejected = useCallback((fileRejections: Array<{ file: File; errors: readonly { message: string }[] }>) => {
    console.log('[GEDCOM] onDropRejected called:', fileRejections);
    const rejection = fileRejections[0];
    if (rejection) {
      const errorMessages = rejection.errors.map(e => e.message).join(', ');
      setError(`Fichier refusé : ${errorMessages}. Essayez un fichier .ged ou .gedcom.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    // Pas de filtre MIME strict - on valide manuellement l'extension
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleCheckDuplicates = () => {
    if (!parseResult) return;

    if (existingPersons.length === 0) {
      // No existing persons, skip duplicate check
      handleImport();
      return;
    }

    const { duplicates } = detectDuplicates(parseResult.individuals, existingPersons);
    
    if (duplicates.length === 0) {
      // No duplicates found, proceed to import
      handleImport();
      return;
    }

    // Initialize decisions to 'create' by default
    const initialDecisions: Record<string, MergeDecision> = {};
    duplicates.forEach((d) => {
      initialDecisions[d.importedPerson.id] = 'create';
    });

    setDuplicateMatches(duplicates);
    setDecisions(initialDecisions);
    setStep('duplicates');
  };

  const handleDecisionChange = (importedId: string, decision: MergeDecision) => {
    setDecisions((prev) => ({ ...prev, [importedId]: decision }));
  };

  const skipCount = useMemo(() => {
    return Object.values(decisions).filter((d) => d === 'skip').length;
  }, [decisions]);

  const handleImport = async () => {
    if (!parseResult) return;

    setStep('importing');
    setProgress(0);
    setError(null);

    try {
      // Get list of IDs to skip
      const skipIds = Object.entries(decisions)
        .filter(([, decision]) => decision === 'skip')
        .map(([id]) => id);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onImport(parseResult, skipIds);

      clearInterval(progressInterval);
      setProgress(100);
      
      const created = parseResult.individuals.length - skipIds.length;
      setImportStats({ created, skipped: skipIds.length });
      setStep('complete');
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'import. Veuillez réessayer.';
      setError(errorMessage);
      setStep('preview');
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (confidence >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  const formatPersonName = (person: GedcomIndividual | FamilyPerson): string => {
    if ('first_names' in person) {
      return `${person.first_names} ${person.last_name}`.trim() || 'Sans nom';
    }
    return `${person.firstName} ${person.lastName}`.trim() || 'Sans nom';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className={step === 'duplicates' ? 'sm:max-w-2xl' : 'sm:max-w-lg'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            Importer un fichier GEDCOM
          </DialogTitle>
          <DialogDescription>
            {step === 'duplicates' 
              ? 'Des personnes similaires ont été détectées. Choisissez quoi faire pour chacune.'
              : 'Importez votre arbre généalogique depuis un autre logiciel (Ancestry, MyHeritage, Geneanet, etc.)'}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive 
                    ? 'border-secondary bg-secondary/10' 
                    : 'border-muted-foreground/25 hover:border-secondary/50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-secondary font-medium">Déposez le fichier ici...</p>
                ) : (
                  <>
                    <p className="text-foreground font-medium mb-1">
                      Glissez-déposez un fichier GEDCOM
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner (fichier .ged)
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Import direct (test Android)</p>
                  <p className="text-xs text-muted-foreground">Ignore la détection de doublons et lance l'import dès la sélection.</p>
                </div>
                <Switch checked={directImport} onCheckedChange={setDirectImport} />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {existingPersons.length > 0 && !directImport && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Arbre existant</AlertTitle>
                  <AlertDescription>
                    Votre arbre contient déjà {existingPersons.length} personne(s). 
                    Les doublons potentiels seront détectés avant l'import.
                  </AlertDescription>
                </Alert>
              )}

              {existingPersons.length > 0 && directImport && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Mode test activé</AlertTitle>
                  <AlertDescription>
                    La détection de doublons est ignorée pour ce test.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Formats supportés :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>GEDCOM 5.5 et 5.5.1</li>
                  <li>Export depuis Ancestry, MyHeritage, Geneanet, Gramps, etc.</li>
                </ul>
              </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && parseResult && (
          <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Fichier GEDCOM</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border rounded-lg text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-2xl font-bold">{parseResult.individuals.length}</p>
                  <p className="text-sm text-muted-foreground">Personnes</p>
                </div>
                <div className="p-4 bg-card border rounded-lg text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-2xl font-bold">{parseResult.families.length}</p>
                  <p className="text-sm text-muted-foreground">Familles</p>
                </div>
              </div>

              {parseResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Avertissements ({parseResult.warnings.length})</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-20 mt-2">
                      <ul className="text-xs space-y-1">
                        {parseResult.warnings.slice(0, 10).map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                        {parseResult.warnings.length > 10 && (
                          <li>... et {parseResult.warnings.length - 10} autres</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={handleCheckDuplicates} className="flex-1">
                    {existingPersons.length > 0 ? 'Vérifier les doublons' : 'Importer'}
                  </Button>
                </div>
                
                {/* Import direct - sans détection de doublons */}
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    console.log('[GEDCOM] Direct import clicked');
                    handleImport();
                  }}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Import direct (ignorer doublons)
                </Button>
              </div>
          </div>
        )}

        {/* Duplicates Review Step */}
        {step === 'duplicates' && (
          <div className="space-y-4">
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertTitle>{duplicateMatches.length} doublon(s) potentiel(s) détecté(s)</AlertTitle>
                <AlertDescription>
                  Pour chaque personne, choisissez de la créer quand même ou de l'ignorer.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {duplicateMatches.map((match, index) => (
                    <div key={match.importedPerson.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatPersonName(match.importedPerson)}
                            </span>
                            <Badge className={getConfidenceColor(match.confidence)}>
                              {match.confidence}% similaire
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>Ressemble à : <span className="font-medium text-foreground">{formatPersonName(match.existingPerson)}</span></p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.matchReasons.map((reason, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <RadioGroup
                        value={decisions[match.importedPerson.id] || 'create'}
                        onValueChange={(value) => handleDecisionChange(match.importedPerson.id, value as MergeDecision)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="create" id={`create-${index}`} />
                          <Label htmlFor={`create-${index}`} className="flex items-center gap-1 cursor-pointer">
                            <UserPlus className="w-4 h-4" />
                            Créer quand même
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skip" id={`skip-${index}`} />
                          <Label htmlFor={`skip-${index}`} className="flex items-center gap-1 cursor-pointer">
                            <SkipForward className="w-4 h-4" />
                            Ignorer (doublon)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {parseResult ? parseResult.individuals.length - skipCount : 0} personne(s) sera/seront créée(s)
                  {skipCount > 0 && `, ${skipCount} ignorée(s)`}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('preview')}>
                    Retour
                  </Button>
                  <Button onClick={handleImport}>
                    Importer
                  </Button>
                </div>
              </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="space-y-6 py-8">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-secondary animate-spin mb-4" />
                <p className="font-medium">Import en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Veuillez patienter pendant l'import de vos données
                </p>
              </div>
              <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && parseResult && (
          <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Import terminé !</h3>
                <p className="text-muted-foreground">
                  {importStats.created} personne(s) créée(s)
                  {importStats.skipped > 0 && `, ${importStats.skipped} ignorée(s)`}
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Voir mon arbre
              </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
