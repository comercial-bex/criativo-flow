import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Users, 
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function SecurityMonitoring() {
  const { auditLogs, activityLogs, realtimeEvents, stats, refetch } = useSecurityMonitoring();

  const getActionIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: any; label: string }> = {
      'decrypt_credential': { variant: 'destructive', label: 'Descriptografar' },
      'view_sensitive': { variant: 'secondary', label: 'Visualizar' },
      'access_denied': { variant: 'destructive', label: 'Negado' },
      'select': { variant: 'outline', label: 'Consulta' },
      'insert': { variant: 'default', label: 'Inserção' },
      'update': { variant: 'secondary', label: 'Atualização' },
      'delete': { variant: 'destructive', label: 'Exclusão' },
    };

    const config = actionMap[action] || { variant: 'outline', label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityColor = (tableName: string) => {
    const criticalTables = ['credenciais_cliente', 'rh_colaboradores', 'financeiro_titulos'];
    return criticalTables.includes(tableName) ? 'text-red-500' : 'text-yellow-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Monitoramento de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise em tempo real de acessos e alertas de segurança
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAccessAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Negados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.failedAccessAttempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tentativas bloqueadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Sensíveis</CardTitle>
            <Lock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.sensitiveDataAccess || 0}
            </div>
            <p className="text-xs text-muted-foreground">Acessos a dados críticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Recentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {stats?.recentAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Eventos de atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Events Alert */}
      {realtimeEvents.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse text-primary" />
              Eventos em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {realtimeEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      !event.success ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getActionIcon(event.success)}
                      <div>
                        <div className="font-medium text-sm">{event.user_email}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.action} em {event.table_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">
            <Shield className="w-4 h-4 mr-2" />
            Auditoria de Acesso
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            Logs de Atividade
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Database className="w-4 h-4 mr-2" />
            Análise
          </TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Auditoria</CardTitle>
              <CardDescription>
                Registro completo de acessos a dados sensíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <Card key={log.id} className={cn(
                      "p-4 transition-colors",
                      !log.success && "border-red-200 bg-red-50"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getActionIcon(log.success)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.user_email}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.user_role || 'unknown'}
                              </Badge>
                              {getActionBadge(log.action)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tabela: <span className={cn("font-mono", getSeverityColor(log.table_name))}>
                                {log.table_name}
                              </span>
                              {log.record_id && (
                                <span className="ml-2">
                                  ID: <span className="font-mono text-xs">{log.record_id.slice(0, 8)}...</span>
                                </span>
                              )}
                            </div>
                            {log.ip_address && (
                              <div className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip_address}
                              </div>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.timestamp), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade do Sistema</CardTitle>
              <CardDescription>
                Todas as ações executadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {activityLogs.map(log => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Eye className="w-4 h-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.user_email}</span>
                              <Badge variant="outline">{log.acao}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.descricao}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {log.entidade_tipo} {log.entidade_id && `• ID: ${log.entidade_id.slice(0, 8)}...`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.data_hora), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Usuários Mais Ativos
                </CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topUsers?.map((user, index) => (
                    <div key={user.user_email} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.user_email}</span>
                      </div>
                      <Badge variant="secondary">{user.count} acessos</Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>}
                </div>
              </CardContent>
            </Card>

            {/* Top Tables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Tabelas Mais Acessadas
                </CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topTables?.map((table, index) => (
                    <div key={table.table_name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <span className="font-mono text-sm">{table.table_name}</span>
                      </div>
                      <Badge variant="secondary">{table.count} acessos</Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
