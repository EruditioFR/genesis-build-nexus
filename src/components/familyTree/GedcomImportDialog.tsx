import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Users, Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { parseGedcom, isValidGedcomFile, type GedcomParseResult } from '@/lib/gedcomParser';

interface GedcomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (result: GedcomParseResult) => Promise<void>;
  existingPersonsCount: number;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function GedcomImportDialog({
  open,
  onOpenChange,
  onImport,
  existingPersonsCount,
}: GedcomImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [parseResult, setParseResult] = useState<GedcomParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');

  const handleReset = () => {
    setStep('upload');
    setParseResult(null);
    setError(null);
    setProgress(0);
    setFileName('');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    try {
      const content = await file.text();
      
      if (!isValidGedcomFile(content)) {
        setError('Ce fichier ne semble pas être un fichier GEDCOM valide.');
        return;
      }

      const result = parseGedcom(content);

      if (result.errors.length > 0 && result.individuals.length === 0) {
        setError(result.errors.join('\n'));
        return;
      }

      setParseResult(result);
      setStep('preview');
    } catch (err) {
      console.error('Error parsing GEDCOM:', err);
      setError('Erreur lors de la lecture du fichier. Vérifiez le format.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.ged', '.gedcom'],
      'application/x-gedcom': ['.ged', '.gedcom'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB max
  });

  const handleImport = async () => {
    if (!parseResult) return;

    setStep('importing');
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onImport(parseResult);

      clearInterval(progressInterval);
      setProgress(100);
      setStep('complete');
    } catch (err) {
      console.error('Import error:', err);
      setError('Erreur lors de l\'import. Veuillez réessayer.');
      setStep('preview');
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            Importer un fichier GEDCOM
          </DialogTitle>
          <DialogDescription>
            Importez votre arbre généalogique depuis un autre logiciel (Ancestry, MyHeritage, Geneanet, etc.)
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {existingPersonsCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Arbre existant</AlertTitle>
                  <AlertDescription>
                    Votre arbre contient déjà {existingPersonsCount} personne(s). 
                    L'import ajoutera les nouvelles personnes à votre arbre existant.
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
            </motion.div>
          )}

          {/* Preview Step */}
          {step === 'preview' && parseResult && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
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

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleImport} className="flex-1">
                  Importer {parseResult.individuals.length} personnes
                </Button>
              </div>
            </motion.div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <motion.div
              key="importing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-8"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-secondary animate-spin mb-4" />
                <p className="font-medium">Import en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Veuillez patienter pendant l'import de vos données
                </p>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}

          {/* Complete Step */}
          {step === 'complete' && parseResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Import terminé !</h3>
                <p className="text-muted-foreground">
                  {parseResult.individuals.length} personnes et {parseResult.families.length} familles ont été importées.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Voir mon arbre
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
