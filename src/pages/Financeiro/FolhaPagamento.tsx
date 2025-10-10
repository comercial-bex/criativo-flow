import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFolhaPagamento, FolhaItem } from '@/hooks/useFolhaPagamento';
import { useFolhaAnalytics } from '@/hooks/useFolhaAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users, Calculator, FileDown, BarChart3 } from 'lucide-react';
import { downloadHolerite } from '@/utils/holeritePdfGenerator';
import { toast } from 'sonner';
import { PagamentoFolhaModal } from '@/components/Financeiro/PagamentoFolhaModal';
import { DetalhamentoFiscalModal } from '@/components/Financeiro/DetalhamentoFiscalModal';
import { RelatoriosFiscaisModal } from '@/components/Financeiro/RelatoriosFiscaisModal';
import { SimuladorFolha } from '@/components/Financeiro/SimuladorFolha';
import { ComparativoMensal } from '@/components/Financeiro/ComparativoMensal';
import { FolhaPagamentoStepper } from '@/components/Financeiro/FolhaPagamentoStepper';
import { FolhaTableFilters } from '@/components/Financeiro/FolhaTableFilters';
import { FolhaEvolutionChart } from '@/components/Financeiro/Charts/FolhaEvolutionChart';
import { EncargosCompositionChart } from '@/components/Financeiro/Charts/EncargosCompositionChart';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function FolhaPagamento() {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  
  const [competencia, setCompetencia] = useState(currentMonth);
  const [itemSelecionado, setItemSelecionado] = useState<FolhaItem | null>(null);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalDetalhamentoAberto, setModalDetalhamentoAberto] = useState(false);
  const [relatoriosFiscaisAberto, setRelatoriosFiscaisAberto] = useState(false);
  const [simuladorAberto, setSimuladorAberto] = useState(false);
  const [stepperAberto, setStepperAberto] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nome-asc');
  const [showCharts, setShowCharts] = useState(false);
  
  const { 
    folhas, 
    itens, 
    isLoading, 
    processarFolha, 
    isProcessando,
    registrarPagamento,
    isRegistrandoPagamento,
  } = useFolhaPagamento(competencia);
  
  const { evolucaoMensal, composicaoEncargos, taxaAbsenteismo, isLoading: loadingAnalytics } = useFolhaAnalytics();
  const { startTutorial, hasSeenTutorial } = useTutorial('folha-pagamento');
  
  const folhaAtual = folhas[0];
  
  // Filtrar e ordenar itens
  const itensFiltrados = useMemo(() => {
    let filtered = itens.filter(item => {
      const matchSearch = !searchTerm || 
        item.colaborador?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.colaborador?.cpf_cnpj.includes(searchTerm);
      
      const matchStatus = statusFilter === 'todos' || item.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
    
    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nome-asc':
          return (a.colaborador?.nome_completo || '').localeCompare(b.colaborador?.nome_completo || '');
        case 'nome-desc':
          return (b.colaborador?.nome_completo || '').localeCompare(a.colaborador?.nome_completo || '');
        case 'liquido-desc':
          return b.liquido - a.liquido;
        case 'liquido-asc':
          return a.liquido - b.liquido;
        case 'cargo-asc':
          return (a.colaborador?.cargo_atual || '').localeCompare(b.colaborador?.cargo_atual || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [itens, searchTerm, statusFilter, sortBy]);

  const handleProcessarFolha = () => {
    setStepperAberto(true);
  };

  const handleCompletarProcessamento = () => {
    processarFolha({ competencia });
  };

  const handleAbrirModalPagamento = (item: FolhaItem) => {
    setItemSelecionado(item);
    setModalPagamentoAberto(true);
  };

  const handleAbrirDetalhamento = (item: FolhaItem) => {
    setItemSelecionado(item);
    setModalDetalhamentoAberto(true);
  };

  const handleConfirmarPagamento = (data: any) => {
    registrarPagamento(data);
    setModalPagamentoAberto(false);
    setItemSelecionado(null);
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

  const handleDownloadHolerite = (item: FolhaItem) => {
    if (!item.colaborador) {
      toast.error('Dados do colaborador não encontrados');
      return;
    }

    downloadHolerite({
      colaborador: item.colaborador,
      competencia,
      base_calculo: item.base_calculo,
      proventos: item.proventos || [],
      descontos: item.descontos || [],
      encargos: item.encargos || [],
      total_proventos: item.total_proventos,
      total_descontos: item.total_descontos,
      liquido: item.liquido,
    });

    toast.success('✅ Holerite gerado com sucesso!');
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
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button
            variant="outline"
            onClick={() => setRelatoriosFiscaisAberto(true)}
            data-tour="relatorios-fiscais"
          >
            <FileText className="h-4 w-4 mr-2" />
            Relatórios Fiscais
          </Button>
          <Button
            variant="outline"
            onClick={() => setSimuladorAberto(true)}
            data-tour="simulador"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Simulador
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCharts(!showCharts)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showCharts ? 'Ocultar' : 'Ver'} Gráficos
          </Button>
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
      <Card className="shadow-md" data-tour="competencia">
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

      {/* Gráficos Analytics */}
      {showCharts && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <FolhaEvolutionChart data={evolucaoMensal} loading={loadingAnalytics} />
          <EncargosCompositionChart data={composicaoEncargos} loading={loadingAnalytics} />
        </motion.div>
      )}

      {/* KPIs + Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3" data-tour="kpis">
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
        </div>
        <div data-tour="comparativo">
          <ComparativoMensal />
        </div>
      </div>

      {/* Tabela */}
      <Card className="shadow-md animate-scale-in">
        <CardHeader>
          <CardTitle>Folha do Mês</CardTitle>
          <CardDescription>
            {folhaAtual
              ? `Status: ${folhaAtual.status === 'aberta' ? 'Aberta' : folhaAtual.status === 'processada' ? 'Processada' : 'Fechada'} • ${itensFiltrados.length} de ${itens.length} colaboradores`
              : 'Nenhuma folha processada para este período'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FolhaTableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
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
                  <th className="px-6 py-4 text-center text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      {itens.length === 0 
                        ? 'Nenhum item encontrado. Clique em "Processar Folha" para gerar.'
                        : 'Nenhum resultado encontrado com os filtros aplicados.'
                      }
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item) => (
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbrirDetalhamento(item)}
                            className="gap-2"
                          >
                            <Calculator className="h-4 w-4" />
                            Ver Cálculos
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadHolerite(item)}
                            className="gap-2"
                          >
                            <FileDown className="h-4 w-4" />
                            Holerite
                          </Button>
                          {item.status === 'pendente' && (
                            <Button
                              size="sm"
                              onClick={() => handleAbrirModalPagamento(item)}
                              className="gap-2"
                            >
                              <DollarSign className="h-4 w-4" />
                              Pagar
                            </Button>
                          )}
                          {item.status === 'pago' && item.data_pagamento && (
                            <span className="text-sm text-muted-foreground">
                              Pago em {new Date(item.data_pagamento).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
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
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      <PagamentoFolhaModal
        open={modalPagamentoAberto}
        onOpenChange={setModalPagamentoAberto}
        item={itemSelecionado}
        onConfirm={handleConfirmarPagamento}
        isLoading={isRegistrandoPagamento}
      />

      <DetalhamentoFiscalModal
        open={modalDetalhamentoAberto}
        onOpenChange={setModalDetalhamentoAberto}
        item={itemSelecionado}
      />

      <FolhaPagamentoStepper
        open={stepperAberto}
        onOpenChange={setStepperAberto}
        competencia={competencia}
        onComplete={handleCompletarProcessamento}
      />

      <SimuladorFolha
        open={simuladorAberto}
        onOpenChange={setSimuladorAberto}
      />

      <RelatoriosFiscaisModal
        open={relatoriosFiscaisAberto}
        onOpenChange={setRelatoriosFiscaisAberto}
      />
    </div>
  );
}
