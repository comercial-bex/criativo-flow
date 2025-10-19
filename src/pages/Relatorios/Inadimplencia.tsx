import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { useRelatoriosInadimplencia } from '@/hooks/useRelatoriosInadimplencia';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, TrendingUp, Calendar } from 'lucide-react';

export default function Inadimplencia() {
  const {
    inadimplenciaData,
    isLoading,
    totalInadimplente,
    mediaDiasAtraso,
    totalTitulos,
  } = useRelatoriosInadimplencia();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDiasAtrasoColor = (dias: number) => {
    if (dias <= 7) return 'text-yellow-500';
    if (dias <= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Inadimplência"
        description="Títulos vencidos e em aberto"
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Inadimplente</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalInadimplente)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Dias Atraso</p>
              <p className="text-2xl font-bold text-orange-500">{mediaDiasAtraso} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Títulos em Atraso</p>
              <p className="text-2xl font-bold text-purple-500">{totalTitulos}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : inadimplenciaData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum título inadimplente encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Devedor/Credor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Dias Atraso</TableHead>
                <TableHead className="text-right">Valor em Aberto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inadimplenciaData.map((item) => (
                <TableRow key={item.titulo_id}>
                  <TableCell className="font-mono">{item.numero_documento}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.devedor_credor}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{item.descricao}</TableCell>
                  <TableCell>
                    {format(new Date(item.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className={getDiasAtrasoColor(item.dias_atraso)}>
                      {item.dias_atraso} dias
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-500">
                    {formatCurrency(item.valor_em_aberto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
