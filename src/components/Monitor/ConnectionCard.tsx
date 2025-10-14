import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  PlayCircle, 
  BookOpen,
  Pause,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConnectionCardProps {
  connection: any;
  onTest: () => void;
  onToggleMonitoring: (enabled: boolean) => void;
  isTesting: boolean;
}

export function ConnectionCard({ 
  connection, 
  onTest, 
  onToggleMonitoring,
  isTesting,
}: ConnectionCardProps) {
  const getStatusIcon = () => {
    if (!connection.monitoring_enabled) {
      return <Pause className="h-4 w-4 text-muted-foreground" />;
    }
    
    switch (connection.status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (!connection.monitoring_enabled) {
      return <Badge variant="secondary">Monitoramento Pausado</Badge>;
    }

    switch (connection.status) {
      case 'connected':
        return <Badge className="bg-emerald-500">Conectado</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-500">Degradado</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  const getSeverityBadge = () => {
    if (!connection.severity) return null;

    const variants: any = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    };

    return (
      <Badge variant={variants[connection.severity]} className="ml-2">
        {connection.severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getStatusIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{connection.name}</h4>
              <p className="text-sm text-muted-foreground">
                {connection.group.replace('_', ' ')}
              </p>
            </div>
          </div>

          <Switch
            checked={connection.monitoring_enabled}
            onCheckedChange={onToggleMonitoring}
            className="ml-2"
          />
        </div>

        {/* Status */}
        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge()}
          {getSeverityBadge()}
        </div>

        {/* Métricas */}
        {connection.monitoring_enabled && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Latência</p>
              <p className="font-mono">
                {connection.latency_ms ? `${connection.latency_ms}ms` : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Último Ping</p>
              <p className="text-xs">
                {connection.last_ping 
                  ? new Date(connection.last_ping).toLocaleTimeString('pt-BR')
                  : '-'
                }
              </p>
            </div>
          </div>
        )}

        {/* Erro */}
        {connection.error_message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2">
            <p className="text-xs text-destructive font-mono break-all">
              {connection.error_message}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onTest}
            disabled={isTesting || !connection.monitoring_enabled}
            className="gap-1"
          >
            <PlayCircle className="h-3 w-3" />
            Testar
          </Button>

          {connection.related_route && (
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <Link to={connection.related_route} className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Abrir
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="gap-1"
          >
            <BookOpen className="h-3 w-3" />
            Logs
          </Button>
        </div>
      </div>
    </Card>
  );
}
