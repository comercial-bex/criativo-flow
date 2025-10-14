import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ExternalLink } from 'lucide-react';

interface PlaybookStep {
  step: number;
  action: string;
  expected: string;
}

interface Playbook {
  id: string;
  title: string;
  match_error: string;
  steps: PlaybookStep[];
  doc_url?: string;
  estimated_effort_min?: number;
  tags?: string[];
}

interface PlaybookViewerProps {
  playbook: Playbook;
  onClose?: () => void;
}

export function PlaybookViewer({ playbook, onClose }: PlaybookViewerProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{playbook.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {playbook.estimated_effort_min && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~{playbook.estimated_effort_min} min</span>
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Tags */}
      {playbook.tags && playbook.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {playbook.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        <h4 className="font-semibold">Passos para Resolução:</h4>
        <div className="space-y-4">
          {playbook.steps.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{step.step}</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{step.action}</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500" />
                  <span>Esperado: {step.expected}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Link */}
      {playbook.doc_url && (
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={playbook.doc_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Ver Documentação Oficial
            </a>
          </Button>
        </div>
      )}
    </Card>
  );
}
