import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRiscoPreditivo } from '@/hooks/useRiscoPreditivo';
import { RefreshCw, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Preditiva() {
  const { riscos, loading, executando, executarAnalise } = useRiscoPreditivo();

  const criticos = riscos.filter(r => r.status === 'critico').length;
  const alertas = riscos.filter(r => r.status === 'alerta').length;
  const normais = riscos.filter(r => r.status === 'normal').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-500';
      case 'alerta': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'critico': return 'destructive';
      case 'alerta': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔮 Análise Preditiva</h1>
            <p className="text-muted-foreground">
              Previsão de riscos, sobrecargas e gargalos de produção
            </p>
          </div>
          <Button onClick={executarAnalise} disabled={executando}>
            <RefreshCw className={`h-4 w-4 mr-2 ${executando ? 'animate-spin' : ''}`} />
            {executando ? 'Analisando...' : 'Atualizar Análise'}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analisados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riscos.length}</div>
              <p className="text-xs text-muted-foreground">Responsáveis ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🔴 Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{criticos}</div>
              <p className="text-xs text-muted-foreground">Sobrecarga detectada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🟡 Alertas</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{alertas}</div>
              <p className="text-xs text-muted-foreground">Atenção necessária</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🟢 Normais</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{normais}</div>
              <p className="text-xs text-muted-foreground">Fluxo saudável</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Riscos */}
        <Card>
          <CardHeader>
            <CardTitle>Análise por Responsável</CardTitle>
            <CardDescription>
              Score de risco e recomendações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riscos.map((risco) => (
                <div
                  key={risco.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    risco.status === 'critico' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                    risco.status === 'alerta' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                    'border-green-500 bg-green-50 dark:bg-green-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={risco.responsavel?.avatar_url} />
                        <AvatarFallback>
                          {risco.responsavel?.nome?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{risco.responsavel?.nome}</h4>
                          <Badge variant="outline">{risco.responsavel?.especialidade}</Badge>
                          <Badge variant={getStatusVariant(risco.status)}>
                            {risco.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {risco.sugestao}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>📋 {risco.tarefas_pendentes} tarefas pendentes</span>
                          <span>⚡ {risco.carga_atual}h de carga</span>
                          {risco.prazo_mais_proximo && (
                            <span>⏰ Próximo prazo: {new Date(risco.prazo_mais_proximo).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {Math.round(risco.score_risco)}
                      </div>
                      <p className="text-xs text-muted-foreground">Score de Risco</p>
                      <Progress 
                        value={risco.score_risco} 
                        className={`mt-2 w-20 ${getStatusColor(risco.status)}`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {riscos.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma análise disponível no momento.</p>
                  <p className="text-sm mt-2">Clique em "Atualizar Análise" para gerar dados preditivos.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
