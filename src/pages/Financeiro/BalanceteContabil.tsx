import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFolhaPagamento } from '@/hooks/useFolhaPagamento';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function BalanceteContabil() {
  const { startTutorial, hasSeenTutorial } = useTutorial('financeiro-balancete');
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  
  const [periodoInicio, setPeriodoInicio] = useState(currentMonth);
  const [periodoFim, setPeriodoFim] = useState(currentMonth);
  
  const { folhas, isLoading } = useFolhaPagamento();

  const folhasFiltradas = folhas.filter((f) => {
    const competencia = new Date(f.competencia);
    const inicio = new Date(periodoInicio);
    const fim = new Date(periodoFim);
    return competencia >= inicio && competencia <= fim;
  });

  const totalizadores = folhasFiltradas.reduce(
    (acc, folha) => ({
      proventos: acc.proventos + folha.total_proventos,
      descontos: acc.descontos + folha.total_descontos,
      encargos: acc.encargos + folha.total_encargos,
      liquido: acc.liquido + folha.total_liquido,
      colaboradores: acc.colaboradores + folha.total_colaboradores,
    }),
    { proventos: 0, descontos: 0, encargos: 0, liquido: 0, colaboradores: 0 }
  );

  const custoTotalEmpresa = totalizadores.proventos + totalizadores.encargos;
  const margem = totalizadores.proventos - totalizadores.descontos;

  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Balancete Contábil
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada dos custos de folha de pagamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>Selecione o intervalo para o balancete</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo-inicio">Data Início</Label>
              <Input
                id="periodo-inicio"
                type="month"
                value={periodoInicio.substring(0, 7)}
                onChange={(e) => setPeriodoInicio(`${e.target.value}-01`)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo-fim">Data Fim</Label>
              <Input
                id="periodo-fim"
                type="month"
                value={periodoFim.substring(0, 7)}
                onChange={(e) => setPeriodoFim(`${e.target.value}-01`)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
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
                Custo Total Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(custoTotalEmpresa)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Proventos + Encargos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-t-4 border-t-success shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Proventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalizadores.proventos)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-t-4 border-t-destructive shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Descontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalizadores.descontos)}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Encargos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalizadores.encargos)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                FGTS e outros
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Demonstrativo Detalhado */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demonstrativo Consolidado
          </CardTitle>
          <CardDescription>
            Detalhamento por competência no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Competência</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Proventos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Descontos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Encargos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Líquido</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Custo Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Colab.</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : folhasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma folha encontrada no período selecionado
                    </td>
                  </tr>
                ) : (
                  folhasFiltradas.map((folha) => {
                    const [ano, mes] = folha.competencia.split('-');
                    const custoTotal = folha.total_proventos + folha.total_encargos;
                    return (
                      <tr key={folha.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {mes}/{ano}
                        </td>
                        <td className="px-6 py-4 text-right text-success font-medium">
                          {formatCurrency(folha.total_proventos)}
                        </td>
                        <td className="px-6 py-4 text-right text-destructive font-medium">
                          {formatCurrency(folha.total_descontos)}
                        </td>
                        <td className="px-6 py-4 text-right text-warning font-medium">
                          {formatCurrency(folha.total_encargos)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          {formatCurrency(folha.total_liquido)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-primary">
                          {formatCurrency(custoTotal)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {folha.total_colaboradores}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {folhasFiltradas.length > 0 && (
                <tfoot className="bg-muted/50 border-t-2">
                  <tr className="font-bold">
                    <td className="px-6 py-4">TOTAL</td>
                    <td className="px-6 py-4 text-right text-success">
                      {formatCurrency(totalizadores.proventos)}
                    </td>
                    <td className="px-6 py-4 text-right text-destructive">
                      {formatCurrency(totalizadores.descontos)}
                    </td>
                    <td className="px-6 py-4 text-right text-warning">
                      {formatCurrency(totalizadores.encargos)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(totalizadores.liquido)}
                    </td>
                    <td className="px-6 py-4 text-right text-primary">
                      {formatCurrency(custoTotalEmpresa)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {Math.round(totalizadores.colaboradores / folhasFiltradas.length)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Composição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Proventos</span>
                <span className="font-bold text-success">
                  {((totalizadores.proventos / custoTotalEmpresa) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Encargos</span>
                <span className="font-bold text-warning">
                  {((totalizadores.encargos / custoTotalEmpresa) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-success"
                  style={{
                    width: `${(totalizadores.proventos / custoTotalEmpresa) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Custo Médio/Colaborador</span>
                <span className="font-bold">
                  {formatCurrency(
                    totalizadores.colaboradores > 0
                      ? custoTotalEmpresa / totalizadores.colaboradores
                      : 0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Encargos</span>
                <span className="font-bold text-warning">
                  {((totalizadores.encargos / totalizadores.proventos) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Descontos</span>
                <span className="font-bold text-destructive">
                  {((totalizadores.descontos / totalizadores.proventos) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
