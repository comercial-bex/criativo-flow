import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

export function MonitorAudit() {
  const { recentChecks, testAll, isTestingAll } = useSystemMonitor();

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'ok':
        return <Badge className="bg-emerald-500">OK</Badge>;
      case 'warn':
        return <Badge className="bg-amber-500">WARN</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  // Calcular estatísticas
  const stats = recentChecks?.reduce((acc, check: any) => {
    acc.total++;
    if (check.result === 'ok') acc.ok++;
    if (check.result === 'warn') acc.warn++;
    if (check.result === 'fail') acc.fail++;
    return acc;
  }, { total: 0, ok: 0, warn: 0, fail: 0 }) || { total: 0, ok: 0, warn: 0, fail: 0 };

  const successRate = stats.total > 0 
    ? Math.round((stats.ok / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Verificações</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ok}</p>
              <p className="text-sm text-muted-foreground">Sucesso</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.warn}</p>
              <p className="text-sm text-muted-foreground">Avisos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.fail}</p>
              <p className="text-sm text-muted-foreground">Falhas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Taxa de Sucesso */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Taxa de Sucesso</h3>
            <p className="text-sm text-muted-foreground">Últimas 50 verificações</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{successRate}%</p>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </Card>

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          onClick={() => testAll()}
          disabled={isTestingAll}
          size="lg"
          className="gap-2"
        >
          <PlayCircle className={`h-5 w-5 ${isTestingAll ? 'animate-spin' : ''}`} />
          Executar Bateria Completa de Testes
        </Button>
      </div>

      {/* Tabela de Verificações */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conexão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Latência</TableHead>
              <TableHead>Data/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentChecks?.map((check: any) => (
              <TableRow key={check.id}>
                <TableCell className="font-medium">
                  {check.system_connections?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{check.check_type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getResultIcon(check.result)}
                    {getResultBadge(check.result)}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {check.details?.latency ? `${check.details.latency}ms` : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(check.created_at).toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
