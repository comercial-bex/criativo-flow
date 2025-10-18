import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMigracaoStatus } from "@/hooks/useMigracaoStatus";
import { AlertCircle, CheckCircle2, Clock, Database, RefreshCw, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function MigracaoDashboard() {
  const { progresso, auditoria, conflitos, isLoading, refetch } = useMigracaoStatus();
  const [executando, setExecutando] = useState(false);

  const executarMigracao = async (batchSize: number = 5) => {
    try {
      setExecutando(true);
      toast.info(`Iniciando migração de ${batchSize} clientes...`);

      const { data, error } = await supabase.rpc('fn_migrar_clientes_batch', {
        p_batch_size: batchSize
      });

      if (error) throw error;

      toast.success(
        `✅ Migração concluída: ${data.migrados} migrados, ${data.erros} erros`
      );
      
      refetch();
    } catch (error: any) {
      console.error('Erro na migração:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setExecutando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const percentualConcluido = progresso?.percentual_concluido || 0;
  const statusColor = (status: string) => {
    switch (status) {
      case 'migrado': return 'default';
      case 'erro': return 'destructive';
      case 'conflito': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Migração</h1>
          <p className="text-muted-foreground">
            Unificação: clientes → pessoas
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progresso?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Migrados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {progresso?.migrados || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              concluídos com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {progresso?.pendentes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              aguardando migração
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(progresso?.com_erro || 0) + (progresso?.conflitos || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
          <CardDescription>
            {progresso?.migrados || 0} de {progresso?.total || 0} clientes migrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{percentualConcluido.toFixed(1)}% concluído</span>
              <span className="text-muted-foreground">
                {progresso?.pendentes || 0} restantes
              </span>
            </div>
            <Progress value={percentualConcluido} className="h-2" />
          </div>

          {percentualConcluido < 100 && (
            <div className="flex gap-2">
              <Button
                onClick={() => executarMigracao(5)}
                disabled={executando}
                size="sm"
              >
                {executando ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Migrar 5 Clientes
              </Button>
              <Button
                onClick={() => executarMigracao(100)}
                disabled={executando}
                variant="outline"
                size="sm"
              >
                Migrar Todos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Conflitos */}
      {conflitos && conflitos.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conflitos Detectados</AlertTitle>
          <AlertDescription>
            {conflitos.length} clientes têm correspondência em pessoas.
            Revise manualmente antes de migrar.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Auditoria de Migração</CardTitle>
          <CardDescription>
            Status detalhado de cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Última Tentativa</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditoria?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.dados_originais?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.tentativas || 0}</TableCell>
                    <TableCell>
                      {item.ultima_tentativa
                        ? new Date(item.ultima_tentativa).toLocaleString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {item.erro_mensagem || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Conflitos Detalhados */}
      {conflitos && conflitos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conflitos Detectados</CardTitle>
            <CardDescription>
              Clientes com correspondência em pessoas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pessoa Existente</TableHead>
                    <TableHead>Tipo Match</TableHead>
                    <TableHead>Já é Cliente?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflitos.map((conflito) => (
                    <TableRow key={conflito.cliente_id}>
                      <TableCell className="font-medium">
                        {conflito.cliente_nome}
                      </TableCell>
                      <TableCell className="text-xs">
                        {conflito.cliente_email}
                      </TableCell>
                      <TableCell className="text-xs">
                        {conflito.pessoa_nome}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {conflito.tipo_conflito}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conflito.pessoa_ja_eh_cliente ? (
                          <Badge variant="destructive">Sim</Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
