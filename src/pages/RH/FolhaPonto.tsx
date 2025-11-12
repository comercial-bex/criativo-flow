import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOcorrenciasPonto } from '@/hooks/useOcorrenciasPonto';
import { usePessoas } from '@/hooks/usePessoas';
import { PontoCard } from '@/components/RH/PontoCard';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/lib/toast-compat';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function FolhaPonto() {
  const [competencia, setCompetencia] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  
  const { ocorrencias, isLoading, aprovar, rejeitar } = useOcorrenciasPonto(undefined, competencia);
  const { pessoas } = usePessoas('colaborador');
  const { startTutorial, hasSeenTutorial } = useTutorial('folha-ponto');

  const filteredOcorrencias = ocorrencias.filter((p) => {
    if (statusFilter === 'todos') return true;
    return p.status === statusFilter;
  });

  const pendingCount = ocorrencias.filter((p) => p.status === 'pendente').length;
  const approvedCount = ocorrencias.filter((p) => p.status === 'aprovado').length;

  const handleApproveAll = async () => {
    const pending = ocorrencias.filter((p) => p.status === 'pendente');
    if (pending.length === 0) {
      toast.error('Nenhuma ocorrência pendente para aprovar');
      return;
    }

    if (!confirm(`Aprovar ${pending.length} ocorrências de ponto?`)) return;

    try {
      for (const ocorrencia of pending) {
        await aprovar(ocorrencia.id);
      }
      toast.success(`${pending.length} ocorrências aprovadas com sucesso!`);
    } catch (error) {
      toast.error('Erro ao aprovar ocorrências em lote');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Gestão de Ponto
          </h1>
          <p className="text-muted-foreground">
            Aprove e gerencie registros de ponto dos colaboradores
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button
            onClick={handleApproveAll}
            className="bg-success hover:bg-success/90"
            disabled={pendingCount === 0}
            data-tour="aprovar-todos"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar Todos ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md" data-tour="competencia-ponto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Competência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-primary" data-tour="resumo">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendentes:</span>
              <span className="font-bold text-warning">{pendingCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aprovados:</span>
              <span className="font-bold text-success">{approvedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pontos */}
      <div className="space-y-4" data-tour="cards-ponto">
        {isLoading ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Carregando registros de ponto...
            </CardContent>
          </Card>
        ) : filteredOcorrencias.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma ocorrência de ponto encontrada para esta competência
            </CardContent>
          </Card>
        ) : (
          filteredOcorrencias.map((ocorrencia) => {
            const pessoa = pessoas.find((p) => p.id === ocorrencia.pessoa_id);
            return (
              <PontoCard
                key={ocorrencia.id}
                ponto={ocorrencia}
                pessoa={pessoa}
                onApprove={() => aprovar(ocorrencia.id)}
                onReject={() => rejeitar({ id: ocorrencia.id, motivo: 'Rejeitado pelo RH' })}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
