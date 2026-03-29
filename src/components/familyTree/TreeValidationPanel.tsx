import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp, ShieldCheck, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ValidationIssue, ValidationSeverity, ValidationCategory } from '@/lib/familyTreeValidation';

interface TreeValidationPanelProps {
  open: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onPersonClick?: (personId: string) => void;
}

const severityConfig: Record<ValidationSeverity, { icon: typeof AlertTriangle; color: string; label: string }> = {
  error: { icon: AlertCircle, color: 'text-red-500', label: 'Erreur' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', label: 'Attention' },
  info: { icon: Info, color: 'text-blue-500', label: 'Info' },
};

const categoryLabels: Record<ValidationCategory, string> = {
  temporal: 'Incohérences temporelles',
  biological: 'Anomalies biologiques',
  data_quality: 'Qualité des données',
  structural: 'Structure de l\'arbre',
};

export function TreeValidationPanel({ open, onClose, issues, onPersonClick }: TreeValidationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    error: issues.filter(i => i.severity === 'error').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
  }), [issues]);

  const grouped = useMemo(() => {
    const map: Record<ValidationCategory, ValidationIssue[]> = {
      temporal: [],
      biological: [],
      data_quality: [],
      structural: [],
    };
    for (const issue of issues) {
      map[issue.category].push(issue);
    }
    return map;
  }, [issues]);

  const noIssues = issues.length === 0;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Audit de l'arbre
          </SheetTitle>

          {!noIssues && (
            <div className="flex gap-2 flex-wrap mt-2">
              {counts.error > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {counts.error} erreur{counts.error > 1 ? 's' : ''}
                </Badge>
              )}
              {counts.warning > 0 && (
                <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  {counts.warning} alerte{counts.warning > 1 ? 's' : ''}
                </Badge>
              )}
              {counts.info > 0 && (
                <Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
                  <Info className="w-3 h-3" />
                  {counts.info} info{counts.info > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          {noIssues ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun problème détecté</h3>
              <p className="text-muted-foreground text-sm">
                Votre arbre ne présente aucune incohérence temporelle, biologique ou structurelle. Bravo !
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {(Object.entries(grouped) as [ValidationCategory, ValidationIssue[]][]).map(
                ([category, catIssues]) => {
                  if (catIssues.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        {categoryLabels[category]} ({catIssues.length})
                      </h3>
                      <div className="space-y-2">
                        {catIssues.map(issue => {
                          const cfg = severityConfig[issue.severity];
                          const Icon = cfg.icon;
                          const isExpanded = expandedId === issue.id;

                          return (
                            <div
                              key={issue.id}
                              className="rounded-lg border bg-card p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                              onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                            >
                              <div className="flex items-start gap-2">
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-snug">{issue.message}</p>
                                  {issue.personName && (
                                    <button
                                      className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (issue.personId && onPersonClick) onPersonClick(issue.personId);
                                      }}
                                    >
                                      <User className="w-3 h-3" />
                                      {issue.personName}
                                    </button>
                                  )}
                                  {isExpanded && issue.detail && (
                                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                                      {issue.detail}
                                    </p>
                                  )}
                                  {isExpanded && issue.relatedPersonName && (
                                    <button
                                      className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (issue.relatedPersonId && onPersonClick) onPersonClick(issue.relatedPersonId);
                                      }}
                                    >
                                      <User className="w-3 h-3" />
                                      Voir : {issue.relatedPersonName}
                                    </button>
                                  )}
                                </div>
                                <Badge variant="outline" className={`text-[10px] shrink-0 ${cfg.color}`}>
                                  {cfg.label}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
