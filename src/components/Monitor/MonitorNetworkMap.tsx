import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';
import { Network, Database, Plug, Box, Layout } from 'lucide-react';
import { ConnectionNode } from './ConnectionNode';
import { CircuitLine } from './CircuitLine';
import { DiagnosticPanel } from './DiagnosticPanel';
import { CircuitLegend } from './CircuitLegend';
import '@/styles/circuit-animations.css';

interface Connection {
  id: string;
  name: string;
  group: string;
  status: string;
  latency_ms?: number;
  error_message?: string;
}

export function MonitorNetworkMap() {
  const { connections, testConnection } = useSystemMonitor();
  const [groupedConns, setGroupedConns] = useState<Record<string, Connection[]>>({});
  const [filters, setFilters] = useState({
    database: true,
    api: true,
    integration: true,
    module: true,
    modal: true,
  });
  const [simplifiedMode, setSimplifiedMode] = useState(false);

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
        return Database;
      case 'api':
        return Plug;
      case 'integration':
        return Network;
      case 'module':
        return Layout;
      case 'modal':
        return Box;
      default:
        return Network;
    }
  };

  const getHelpInfo = (group: string, name: string) => {
    const helpDatabase = {
      description: 'Conexão com banco de dados principal do sistema',
      problems: ['Timeout de conexão', 'Credenciais inválidas', 'Pool de conexões esgotado'],
      solutions: ['Verificar configurações de rede', 'Validar credenciais', 'Reiniciar pool'],
    };
    
    const helpAPI = {
      description: 'Interface de programação de aplicações externa',
      problems: ['Rate limit excedido', 'Endpoint indisponível', 'Falha de autenticação'],
      solutions: ['Aguardar cooldown', 'Verificar status da API', 'Renovar token'],
    };

    const helpIntegration = {
      description: 'Integração com serviços de terceiros',
      problems: ['Webhook não responde', 'Dados incorretos', 'Timeout de resposta'],
      solutions: ['Reconfigurar webhook', 'Validar payload', 'Aumentar timeout'],
    };

    if (group === 'database') return helpDatabase;
    if (group === 'api') return helpAPI;
    if (group === 'integration') return helpIntegration;
    
    return {
      description: `Componente ${name} do sistema`,
      problems: ['Erro de inicialização', 'Dependências ausentes'],
      solutions: ['Reiniciar componente', 'Verificar dependências'],
    };
  };

  // Calculate positions for circuit layout
  const calculatePosition = (index: number, total: number, radius: number, centerX: number, centerY: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const centerHub = { x: 400, y: 300 };

  // Group connections by layers
  const layeredConnections = useMemo(() => {
    const layers: Record<string, { connections: Connection[]; radius: number }> = {
      database: { connections: groupedConns.database || [], radius: 150 },
      api: { connections: groupedConns.api || [], radius: 250 },
      integration: { connections: groupedConns.integration || [], radius: 250 },
      module: { connections: groupedConns.module || [], radius: 350 },
      modal: { connections: groupedConns.modal || [], radius: 350 },
    };
    return layers;
  }, [groupedConns]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      database: groupedConns.database?.length || 0,
      api: groupedConns.api?.length || 0,
      integration: groupedConns.integration?.length || 0,
      module: groupedConns.module?.length || 0,
      modal: groupedConns.modal?.length || 0,
    };
  }, [groupedConns]);

  // Generate diagnostic issues
  const diagnosticIssues = useMemo(() => {
    const issues: any[] = [];
    
    connections?.forEach((conn) => {
      if (conn.status === 'disconnected') {
        issues.push({
          id: conn.id,
          severity: 'critical',
          title: `${conn.name} desconectado`,
          description: conn.error_message || 'Conexão perdida com o serviço',
          suggestion: 'Clique em "Tentar Resolver" para testar novamente a conexão',
          connectionId: conn.id,
          onResolve: () => testConnection(conn.id),
        });
      } else if (conn.status === 'degraded') {
        issues.push({
          id: conn.id,
          severity: 'warning',
          title: `${conn.name} degradado`,
          description: `Latência elevada: ${conn.latency_ms}ms`,
          suggestion: 'Verifique a saúde da rede ou servidor',
          connectionId: conn.id,
        });
      }
    });

    return issues;
  }, [connections, testConnection]);

  const healthyConnections = connections?.filter((c) => c.status === 'connected').length || 0;
  const totalConnections = connections?.length || 0;

  return (
    <div className="flex gap-6">
      {/* Main Circuit Diagram */}
      <div className="flex-1 space-y-4">
        {/* Controls */}
        <CircuitLegend
          stats={stats}
          filters={filters}
          onFilterChange={(group, enabled) =>
            setFilters((prev) => ({ ...prev, [group]: enabled }))
          }
          simplifiedMode={simplifiedMode}
          onModeChange={setSimplifiedMode}
        />

        {/* Circuit Canvas */}
        <Card className="relative bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden" style={{ height: '600px' }}>
          {/* Central Hub */}
          <div
            className="absolute"
            style={{
              left: `${centerHub.x}px`,
              top: `${centerHub.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center animate-pulse-glow">
                <Network className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center mt-2 font-bold text-sm">BEX 3.0</p>
            </div>
          </div>

          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {Object.entries(layeredConnections).map(([group, { connections: conns, radius }]) =>
              filters[group as keyof typeof filters]
                ? conns.map((conn, index) => {
                    const pos = calculatePosition(index, conns.length, radius, centerHub.x, centerHub.y);
                    return (
                      <CircuitLine
                        key={conn.id}
                        from={centerHub}
                        to={pos}
                        status={conn.status as any}
                        animated={!simplifiedMode}
                      />
                    );
                  })
                : null
            )}
          </svg>

          {/* Connection Nodes */}
          {Object.entries(layeredConnections).map(([group, { connections: conns, radius }]) =>
            filters[group as keyof typeof filters]
              ? conns.map((conn, index) => {
                  const pos = calculatePosition(index, conns.length, radius, centerHub.x, centerHub.y);
                  return (
                    <ConnectionNode
                      key={conn.id}
                      id={conn.id}
                      name={conn.name}
                      status={conn.status as any}
                      icon={getGroupIcon(group)}
                      latency={conn.latency_ms}
                      position={pos}
                      helpInfo={getHelpInfo(group, conn.name)}
                      onClick={() => testConnection(conn.id)}
                    />
                  );
                })
              : null
          )}
        </Card>
      </div>

      {/* Diagnostic Panel */}
      <DiagnosticPanel
        issues={diagnosticIssues}
        totalConnections={totalConnections}
        healthyConnections={healthyConnections}
      />
    </div>
  );
}
