import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFolhaPonto } from '@/hooks/useFolhaPonto';
import { useColaboradores } from '@/hooks/useColaboradores';
import { PontoCard } from '@/components/RH/PontoCard';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FolhaPonto() {
  const [competencia, setCompetencia] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  
  const { pontos, isLoading, aprovarRH, rejeitar } = useFolhaPonto(undefined, competencia);
  const { colaboradores } = useColaboradores();

  const filteredPontos = pontos.filter((p) => {
    if (statusFilter === 'todos') return true;
    return p.status === statusFilter;
  });

  const pendingCount = pontos.filter((p) => p.status === 'pendente').length;
  const approvedCount = pontos.filter((p) => p.status === 'aprovado_rh' || p.status === 'aprovado_gestor').length;

  const handleApproveAll = async () => {
    const pending = pontos.filter((p) => p.status === 'pendente');
    if (pending.length === 0) {
      toast.error('Nenhum ponto pendente para aprovar');
      return;
    }

    if (!confirm(`Aprovar ${pending.length} registros de ponto?`)) return;

    try {
      for (const ponto of pending) {
        await aprovarRH(ponto.id);
      }
      toast.success(`${pending.length} registros aprovados com sucesso!`);
    } catch (error) {
      toast.error('Erro ao aprovar pontos em lote');
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
          <Button
            onClick={handleApproveAll}
            className="bg-success hover:bg-success/90"
            disabled={pendingCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar Todos ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
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

        <Card className="shadow-md border-t-4 border-t-primary">
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
      <div className="space-y-4">
        {isLoading ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Carregando registros de ponto...
            </CardContent>
          </Card>
        ) : filteredPontos.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhum registro de ponto encontrado para esta competência
            </CardContent>
          </Card>
        ) : (
          filteredPontos.map((ponto) => {
            const colaborador = colaboradores.find((c) => c.id === ponto.colaborador_id);
            return (
              <PontoCard
                key={ponto.id}
                ponto={ponto}
                colaborador={colaborador}
                onApprove={() => aprovarRH(ponto.id)}
                onReject={() => rejeitar({ id: ponto.id, motivo: 'Rejeitado pelo RH' })}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
