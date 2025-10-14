import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
  connectionId?: string;
  onResolve?: () => void;
}

interface DiagnosticPanelProps {
  issues: DiagnosticIssue[];
  totalConnections: number;
  healthyConnections: number;
}

export function DiagnosticPanel({ issues, totalConnections, healthyConnections }: DiagnosticPanelProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Crítico</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500 text-xs">Aviso</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Info</Badge>;
    }
  };

  const healthPercentage = Math.round((healthyConnections / totalConnections) * 100);

  return (
    <Card className="w-80 h-full border-l-2 border-primary/20 rounded-none">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Diagnóstico Automático
        </h3>
        
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Saúde do Sistema</span>
            <span className="font-semibold">{healthPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                healthPercentage >= 80
                  ? 'bg-emerald-500'
                  : healthPercentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-destructive'
              }`}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{healthyConnections} conectadas</span>
            <span>{totalConnections - healthyConnections} com problemas</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-180px)]">
        <div className="p-4 space-y-3">
          {issues.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium">Nenhum problema detectado!</p>
              <p className="text-xs text-muted-foreground">
                Todas as conexões estão funcionando normalmente.
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id} className="p-3 space-y-2 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                  {getSeverityBadge(issue.severity)}
                </div>

                <div className="pl-6 space-y-2">
                  <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
                    <p className="font-medium text-primary mb-1">💡 Sugestão:</p>
                    <p className="text-muted-foreground">{issue.suggestion}</p>
                  </div>

                  {issue.onResolve && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-7"
                      onClick={issue.onResolve}
                    >
                      🔧 Tentar Resolver
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
