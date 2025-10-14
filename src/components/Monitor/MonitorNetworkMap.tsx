import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';
import { Badge } from '@/components/ui/badge';
import { Network, Database, Plug, Box, Layout } from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  group: string;
  status: string;
  latency_ms?: number;
  error_message?: string;
}

export function MonitorNetworkMap() {
  const { connections } = useSystemMonitor();
  const [groupedConns, setGroupedConns] = useState<Record<string, Connection[]>>({});

  useEffect(() => {
    if (connections) {
      const grouped = connections.reduce((acc, conn) => {
        if (!acc[conn.group]) acc[conn.group] = [];
        acc[conn.group].push(conn);
        return acc;
      }, {} as Record<string, Connection[]>);
      setGroupedConns(grouped);
    }
  }, [connections]);

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'api':
        return <Plug className="h-5 w-5" />;
      case 'integration':
        return <Network className="h-5 w-5" />;
      case 'module':
        return <Layout className="h-5 w-5" />;
      case 'modal':
        return <Box className="h-5 w-5" />;
      default:
        return <Network className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'disconnected':
        return 'bg-destructive';
      case 'paused':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'degraded':
        return 'Degradado';
      case 'disconnected':
        return 'Desconectado';
      case 'paused':
        return 'Pausado';
      default:
        return 'Aguardando';
    }
  };

  return (
    <div className="space-y-6">
      {/* Central Hub */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Network className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">BEX 3.0</h2>
            <p className="text-sm text-muted-foreground">Sistema Central de Gestão</p>
          </div>
        </div>
      </Card>

      {/* Network Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedConns).map(([group, conns]) => (
          <Card key={group} className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {getGroupIcon(group)}
              </div>
              <div>
                <h3 className="font-semibold capitalize">{group}</h3>
                <p className="text-xs text-muted-foreground">{conns.length} conexões</p>
              </div>
            </div>

            <div className="space-y-2">
              {conns.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(conn.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conn.name}</p>
                      {conn.latency_ms && (
                        <p className="text-xs text-muted-foreground">
                          {conn.latency_ms}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(conn.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Conectado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Degradado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span>Desconectado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span>Pausado/Pendente</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
