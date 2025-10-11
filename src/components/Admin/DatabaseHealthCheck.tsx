import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Users,
  Database,
  Shield,
  Activity
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DatabaseHealthCheck = () => {
  const { 
    integrity, 
    integrityLoading, 
    healthLogs,
    overallStatus,
    checkIntegrity,
    syncOrphans,
    isSyncing
  } = useSystemHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'healthy': 'default',
      'ok': 'default',
      'warning': 'secondary',
      'critical': 'destructive',
      'error': 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'ok' || status === 'healthy' ? 'Saudável' : 
         status === 'warning' ? 'Atenção' : 
         status === 'critical' || status === 'error' ? 'Crítico' : status}
      </Badge>
    );
  };

  if (integrityLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnóstico do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status Geral do Sistema
            </div>
            {getStatusBadge(overallStatus)}
          </CardTitle>
          <CardDescription>
            Última verificação: {format(new Date(), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score de Integridade</span>
            <span className="text-2xl font-bold">{integrity?.integrity_score || 0}%</span>
          </div>
          <Progress value={integrity?.integrity_score || 0} className="h-2" />
          
          <div className="flex gap-2">
            <Button
              onClick={() => checkIntegrity()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Agora
            </Button>
            
            {integrity && integrity.orphan_auth_users > 0 && (
              <Button
                onClick={() => syncOrphans()}
                disabled={isSyncing}
                size="sm"
                className="flex-1"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Sincronizar Órfãos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Integridade */}
      {integrity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Integridade de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Usuários Auth</div>
                <div className="text-2xl font-bold">{integrity.total_auth_users}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Com Perfil</div>
                <div className="text-2xl font-bold text-green-600">
                  {integrity.users_with_profile}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Com Role</div>
                <div className="text-2xl font-bold text-blue-600">
                  {integrity.users_with_role}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Órfãos Auth</div>
                <div className={`text-2xl font-bold ${
                  integrity.orphan_auth_users > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {integrity.orphan_auth_users}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Órfãos Perfil</div>
                <div className={`text-2xl font-bold ${
                  integrity.orphan_profiles > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {integrity.orphan_profiles}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs de Saúde */}
      {healthLogs && healthLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Histórico de Verificações
            </CardTitle>
            <CardDescription>
              Últimas {healthLogs.length} verificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {log.check_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>
                              {key}: <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
