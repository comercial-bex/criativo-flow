import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, ChevronDown, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { TesteE2E } from '@/hooks/useHomologacao';

interface TestesE2EProps {
  cenarios: TesteE2E[];
  onExecutar: (ids: string[]) => void;
}

export function TestesE2E({ cenarios, onExecutar }: TestesE2EProps) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [expandidos, setExpandidos] = useState<string[]>([]);

  const toggleSelecao = (id: string) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleExpansao = (id: string) => {
    setExpandidos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passou': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'falhou': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'executando': return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passou': return <Badge className="bg-green-500/10 text-green-600">Aprovado</Badge>;
      case 'falhou': return <Badge variant="destructive">Reprovado</Badge>;
      case 'executando': return <Badge className="bg-blue-500/10 text-blue-600">Executando...</Badge>;
      default: return <Badge variant="outline">Não executado</Badge>;
    }
  };

  const aprovados = cenarios.filter(c => c.status === 'passou').length;
  const reprovados = cenarios.filter(c => c.status === 'falhou').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Testes End-to-End (E2E)</h3>
          <p className="text-sm text-muted-foreground">
            {aprovados} aprovados | {reprovados} reprovados | {cenarios.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelecionados(cenarios.map(c => c.id))}
          >
            Selecionar Todos
          </Button>
          <Button
            size="sm"
            onClick={() => onExecutar(selecionados)}
            disabled={selecionados.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            Executar Selecionados ({selecionados.length})
          </Button>
        </div>
      </div>

      {/* Cenários */}
      <div className="space-y-3">
        {cenarios.map(cenario => (
          <Card key={cenario.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selecionados.includes(cenario.id)}
                  onCheckedChange={() => toggleSelecao(cenario.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getStatusIcon(cenario.status)}
                      {cenario.nome}
                    </CardTitle>
                    {getStatusBadge(cenario.status)}
                  </div>
                  <CardDescription className="mt-1">{cenario.descricao}</CardDescription>
                </div>
                {cenario.logs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpansao(cenario.id)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Logs
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform ${
                        expandidos.includes(cenario.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                )}
              </div>
            </CardHeader>

            {cenario.logs && expandidos.includes(cenario.id) && (
              <CardContent>
                <div className="bg-muted rounded-md p-3 font-mono text-xs">
                  <pre className="whitespace-pre-wrap">{cenario.logs}</pre>
                </div>
                {cenario.evidencias && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Evidências:</strong>{' '}
                    {JSON.stringify(cenario.evidencias, null, 2)}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
