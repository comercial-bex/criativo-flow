import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { ConnectionCard } from './ConnectionCard';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

export function MonitorGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [functionsAvailable, setFunctionsAvailable] = useState<boolean | null>(null);

  const {
    connections,
    isLoading,
    testConnection,
    isTestingConnection,
    testAll,
    isTestingAll,
    toggleMonitoring,
    saveConnectionConfig,
    isSavingConfig,
  } = useSystemMonitor();

  const filteredConnections = connections?.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || conn.group === filterGroup;
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const groupedConnections = filteredConnections?.reduce((acc, conn) => {
    if (!acc[conn.group]) acc[conn.group] = [];
    acc[conn.group].push(conn);
    return acc;
  }, {} as Record<string, any[]>);

  // Verificar disponibilidade das Edge Functions
  useEffect(() => {
    const checkFunctions = async () => {
      try {
        const { error } = await supabase.functions.invoke('monitor-test-connection', {
          body: { connection_id: 'check-availability' }
        });
        setFunctionsAvailable(
          !error?.message?.includes('Failed to send') && 
          !error?.message?.includes('FunctionsRelayError')
        );
      } catch {
        setFunctionsAvailable(false);
      }
    };
    checkFunctions();
  }, []);

  const exportCSV = () => {
    if (!connections) return;

    const headers = ['Nome', 'Grupo', 'Status', 'Latência (ms)', 'Último Ping', 'Erro'];
    const rows = connections.map(c => [
      c.name,
      c.group,
      c.status,
      c.latency_ms || '-',
      c.last_ping ? new Date(c.last_ping).toISOString() : '-',
      c.error_message || '-',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitor-conexoes-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso de Edge Functions indisponíveis */}
      {functionsAvailable === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Edge Functions não disponíveis</AlertTitle>
          <AlertDescription>
            Os testes estão rodando em modo local (fallback). Para melhor performance, 
            implante as Edge Functions: <code className="bg-black/10 px-2 py-1 rounded text-xs">supabase functions deploy monitor-test-all</code>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros e Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conexão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Grupos</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="integration">Integração</SelectItem>
            <SelectItem value="module">Módulo</SelectItem>
            <SelectItem value="modal">Modal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="connected">Conectado</SelectItem>
            <SelectItem value="degraded">Degradado</SelectItem>
            <SelectItem value="disconnected">Desconectado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => testAll()}
          disabled={isTestingAll}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isTestingAll ? 'animate-spin' : ''}`} />
          Testar Tudo
        </Button>

        <Button
          variant="outline"
          onClick={exportCSV}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV
        </Button>
      </div>

      {/* Grid por Grupo */}
      {Object.entries(groupedConnections || {}).map(([group, conns]) => (
        <div key={group} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">
            {group.replace('_', ' ')} ({conns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conns.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onTest={() => testConnection(conn.id)}
                onToggleMonitoring={(enabled) => toggleMonitoring({ id: conn.id, enabled })}
                onSaveConfig={async (id, config) => {
                  saveConnectionConfig({ connectionId: id, config });
                }}
                isTesting={isTestingConnection}
                isSavingConfig={isSavingConfig}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredConnections?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma conexão encontrada com os filtros selecionados
        </div>
      )}
    </div>
  );
}
