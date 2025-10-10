import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFolhaPagamento } from '@/hooks/useFolhaPagamento';
import { DollarSign, Download, FileText, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FolhaPagamento() {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  
  const [competencia, setCompetencia] = useState(currentMonth);
  const { folhas, itens, isLoading, processarFolha, isProcessando } = useFolhaPagamento(competencia);
  
  const folhaAtual = folhas[0];

  const handleProcessarFolha = () => {
    processarFolha({ competencia });
  };

  const handleExportCSV = () => {
    if (!itens.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = ['Nome', 'CPF/CNPJ', 'Cargo', 'Regime', 'Base', 'Proventos', 'Descontos', 'Líquido', 'Status'];
    const rows = itens.map((item) => [
      item.colaborador?.nome_completo || '',
      item.colaborador?.cpf_cnpj || '',
      item.colaborador?.cargo_atual || '',
      item.colaborador?.regime || '',
      item.base_calculo.toFixed(2),
      item.total_proventos.toFixed(2),
      item.total_descontos.toFixed(2),
      item.liquido.toFixed(2),
      item.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `folha_${competencia}.csv`;
    link.click();
    
    toast.success('✅ Folha exportada com sucesso!');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-warning/10 text-warning border-warning/20',
      pago: 'bg-success/10 text-success border-success/20',
      cancelado: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Folha de Pagamento
          </h1>
          <p className="text-muted-foreground">
            Gestão mensal da folha e pagamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!itens.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione a competência (mês/ano)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="competencia">Competência</Label>
              <Input
                id="competencia"
                type="month"
                value={competencia.substring(0, 7)}
                onChange={(e) => setCompetencia(`${e.target.value}-01`)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleProcessarFolha}
                disabled={isProcessando}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isProcessando ? 'Processando...' : 'Processar Folha'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      {folhaAtual && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Proventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(folhaAtual.total_proventos)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-t-4 border-t-destructive shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Descontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(folhaAtual.total_descontos)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-t-4 border-t-success shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(folhaAtual.total_liquido)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-t-4 border-t-warning shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Colaboradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {folhaAtual.total_colaboradores}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Tabela */}
      <Card className="shadow-md animate-scale-in">
        <CardHeader>
          <CardTitle>Folha do Mês</CardTitle>
          <CardDescription>
            {folhaAtual
              ? `Status: ${folhaAtual.status === 'aberta' ? 'Aberta' : folhaAtual.status === 'processada' ? 'Processada' : 'Fechada'}`
              : 'Nenhuma folha processada para este período'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Colaborador</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cargo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Regime</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Base (R$)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Proventos (R$)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Descontos (R$)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Líquido (R$)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : itens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum item encontrado. Clique em "Processar Folha" para gerar.
                    </td>
                  </tr>
                ) : (
                  itens.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.colaborador?.nome_completo}</div>
                        <div className="text-sm text-muted-foreground">{item.colaborador?.cpf_cnpj}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{item.colaborador?.cargo_atual || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono">
                          {item.colaborador?.regime?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(item.base_calculo)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-success">
                        {formatCurrency(item.total_proventos)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-destructive">
                        {formatCurrency(item.total_descontos)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {formatCurrency(item.liquido)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {itens.length > 0 && (
                <tfoot className="bg-muted/50 border-t-2">
                  <tr className="font-bold">
                    <td colSpan={4} className="px-6 py-4 text-right">TOTAL:</td>
                    <td className="px-6 py-4 text-right text-success">
                      {formatCurrency(itens.reduce((sum, i) => sum + i.total_proventos, 0))}
                    </td>
                    <td className="px-6 py-4 text-right text-destructive">
                      {formatCurrency(itens.reduce((sum, i) => sum + i.total_descontos, 0))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(itens.reduce((sum, i) => sum + i.liquido, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
