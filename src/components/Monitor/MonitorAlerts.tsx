// ========================================
// MONITOR DE ALERTAS - FASE 3 MONITORING
// ========================================
// Dashboard de alertas e health checks em tempo real

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Activity, Database, Shield, HardDrive } from "lucide-react";
import { toast } from "sonner";

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    auth: { status: string; error?: string };
    storage: { status: string; error?: string };
  };
  uptime: number;
}

interface SystemHealthLog {
  id: string;
  check_type: string;
  status: 'ok' | 'warning' | 'error';
  details: any;
  created_at: string;
}

export const MonitorAlerts = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [recentLogs, setRecentLogs] = useState<SystemHealthLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health');
      
      if (error) throw error;
      
      setHealthStatus(data);
      
      if (data.status !== 'healthy') {
        toast.warning(`Sistema em estado: ${data.status}`, {
          description: 'Alguns serviços podem estar degradados',
        });
      }
    } catch (error) {
      console.error('Erro ao verificar health:', error);
      setHealthStatus({
        status: 'unknown',
        timestamp: new Date().toISOString(),
        version: 'unknown',
        checks: {
          database: { status: 'unknown' },
          auth: { status: 'unknown' },
          storage: { status: 'unknown' },
        },
        uptime: 0,
      });
      toast.error('Falha ao verificar status do sistema');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setRecentLogs((data || []) as SystemHealthLog[]);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchRecentLogs();

    if (autoRefresh) {
      const interval = setInterval(() => {
        checkHealth();
        fetchRecentLogs();
      }, 60000); // 1 minuto

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      healthy: 'default',
      ok: 'default',
      degraded: 'secondary',
      warning: 'secondary',
      unhealthy: 'destructive',
      error: 'destructive',
      unknown: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🔔 Alertas & Monitoring</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pausar' : '▶️ Iniciar'} Auto-Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {healthStatus && getStatusIcon(healthStatus.status)}
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(healthStatus.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Versão:</span>
                <Badge variant="outline">{healthStatus.version}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Verificação:</span>
                <span className="text-sm">
                  {new Date(healthStatus.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tempo de Resposta:</span>
                <Badge>{healthStatus.uptime}ms</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Carregando status...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dos Serviços */}
      {healthStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(healthStatus.checks.database.status)}
                {healthStatus.checks.database.latency && (
                  <p className="text-sm text-muted-foreground">
                    Latência: {healthStatus.checks.database.latency}ms
                  </p>
                )}
                {healthStatus.checks.database.error && (
                  <p className="text-xs text-destructive">
                    {healthStatus.checks.database.error}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(healthStatus.checks.auth.status)}
                {healthStatus.checks.auth.error && (
                  <p className="text-xs text-destructive">
                    {healthStatus.checks.auth.error}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(healthStatus.checks.storage.status)}
                {healthStatus.checks.storage.error && (
                  <p className="text-xs text-destructive">
                    {healthStatus.checks.storage.error}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="text-sm font-medium">{log.check_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum log disponível
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
