import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Download, Play, FileText } from 'lucide-react';

interface HeaderStatusProps {
  mvpReady: boolean;
  stats: {
    fks_corretas: number;
    fks_pendentes: number;
    tabela_existe: boolean;
  };
  onVarrer: () => void;
  onExecutarE2E: () => void;
  onGerarPlano: () => void;
  onExportar: (formato: 'csv' | 'json') => void;
  loading?: boolean;
}

export function HeaderStatus({
  mvpReady,
  stats,
  onVarrer,
  onExecutarE2E,
  onGerarPlano,
  onExportar,
  loading
}: HeaderStatusProps) {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Homologação BEX 3.0 — MVP Ready</h1>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Status do MVP:</span>
              {mvpReady ? (
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aprovado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-4 h-4 mr-1" />
                  Em análise
                </Badge>
              )}
              {stats.tabela_existe && (
                <Badge className="bg-blue-500/10 text-blue-600">
                  Funcionarios OK
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onVarrer} disabled={loading} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Varrer Sistema
            </Button>
            <Button onClick={onExecutarE2E} disabled={loading} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Executar E2E
            </Button>
            <Button onClick={onGerarPlano} disabled={loading} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Plano 72h
            </Button>
            <Button onClick={() => onExportar('csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => onExportar('json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">FKs Pendentes:</span>
            <span className="font-semibold">{stats.fks_pendentes}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">FKs Corretas:</span>
            <span className="font-semibold">{stats.fks_corretas}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
