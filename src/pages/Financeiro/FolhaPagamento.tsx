import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFolhaMes } from '@/hooks/useFolhaMes';
import { usePessoasColaboradores } from '@/hooks/usePessoasColaboradores';
import { useFolhaAnalytics } from '@/hooks/useFolhaAnalytics';
import { SelecionarColaboradoresFolha } from '@/components/Financeiro/SelecionarColaboradoresFolha';
import { FolhaStepper } from '@/components/Financeiro/FolhaStepper';
import { FolhaEtapa1Competencia } from '@/components/Financeiro/FolhaEtapa1Competencia';
import { FolhaEtapa3Confirmacao } from '@/components/Financeiro/FolhaEtapa3Confirmacao';
import { FABProcessarFolha } from '@/components/Financeiro/FABProcessarFolha';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users, Calculator, FileDown, BarChart3, Loader2 } from 'lucide-react';
import { downloadHolerite } from '@/utils/holeritePdfGenerator';
import { toast } from 'sonner';
import { PagamentoFolhaModal } from '@/components/Financeiro/PagamentoFolhaModal';
import { DetalhamentoFiscalModal } from '@/components/Financeiro/DetalhamentoFiscalModal';
import { RelatoriosFiscaisModal } from '@/components/Financeiro/RelatoriosFiscaisModal';
import { SimuladorFolha } from '@/components/Financeiro/SimuladorFolha';
import { ComparativoMensal } from '@/components/Financeiro/ComparativoMensal';
import { FolhaTableFilters } from '@/components/Financeiro/FolhaTableFilters';
import { FolhaEvolutionChart } from '@/components/Financeiro/Charts/FolhaEvolutionChart';
import { EncargosCompositionChart } from '@/components/Financeiro/Charts/EncargosCompositionChart';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function FolhaPagamento() {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`; // ✅ Formato: YYYY-MM-DD
  
  const [competencia, setCompetencia] = useState(currentMonth);
  
  // Helper para garantir que competência sempre seja YYYY-MM-DD
  const handleSetCompetencia = (value: string) => {
    const normalized = value.match(/^\d{4}-\d{2}$/) ? `${value}-01` : value;
    console.log('📅 Competência normalizada:', normalized);
    setCompetencia(normalized);
  };
  const [itemSelecionado, setItemSelecionado] = useState<any | null>(null);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalDetalhamentoAberto, setModalDetalhamentoAberto] = useState(false);
  const [relatoriosFiscaisAberto, setRelatoriosFiscaisAberto] = useState(false);
  const [simuladorAberto, setSimuladorAberto] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [mostrarWizard, setMostrarWizard] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nome-asc');
  const [showCharts, setShowCharts] = useState(false);

  // Carregar veículos via useQuery  
  const { data: veiculosData = [] } = useQuery({
    queryKey: ['veiculos-inventario'],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventario_itens')
        .select(`
          id,
          identificacao_interna,
          modelo:inventario_modelos!modelo_id(modelo, categoria)
        `)
        .eq('ativo', true);
      return (data || []).map((item: any) => ({
        id: item.id,
        nome: item.modelo?.modelo || item.identificacao_interna || 'Sem modelo',
        placa: item.identificacao_interna
      }));
    }
  });
  
  const veiculos = veiculosData;
  
  // Hooks integrados para nova arquitetura
  const { folhas, isLoading: isLoadingFolhas, calcularFolha, fecharFolha, marcarComoPaga } = useFolhaMes(undefined, competencia);
  const { colaboradores, isLoading: isLoadingPessoas } = usePessoasColaboradores();
  
  const { evolucaoMensal, composicaoEncargos, taxaAbsenteismo, isLoading: loadingAnalytics } = useFolhaAnalytics();
  const { startTutorial, hasSeenTutorial } = useTutorial('folha-pagamento');
  
  const isLoading = isLoadingFolhas || isLoadingPessoas;
  
  // ========== DEBUG LOGS ==========
  useEffect(() => {
    console.group('🔍 [DEBUG] Estado da Folha de Pagamento');
    console.log('📅 Competência atual:', competencia);
    console.log('📊 Folhas carregadas:', folhas?.length || 0);
    console.log('👥 Colaboradores carregados:', colaboradores?.length || 0);
    console.log('🚗 Veículos carregados:', veiculos?.length || 0);
    console.log('⚙️ Etapa atual:', etapaAtual);
    console.log('🔄 Loading states:', { isLoadingFolhas, isLoadingPessoas });
    console.groupEnd();
  }, [competencia, folhas, colaboradores, veiculos, etapaAtual, isLoadingFolhas, isLoadingPessoas]);
  // ========== FIM DEBUG ==========
  
  // Mapear folhas para itens compatíveis com a UI
  const itens = useMemo(() => {
    return folhas.map(folha => {
      const pessoa = colaboradores.find(p => p.id === folha.pessoa_id);
      return {
        id: folha.id,
        colaborador: pessoa ? {
          id: pessoa.id,
          nome_completo: pessoa.nome,
          cpf_cnpj: pessoa.cpf || '',
          cargo_atual: pessoa.observacoes || '',
          regime: pessoa.regime || 'clt',
        } : null,
        base_calculo: folha.salario_base,
        total_proventos: folha.total_extras,
        total_descontos: folha.total_descontos,
        liquido: folha.total_a_pagar,
        status: folha.status === 'aberta' ? 'pendente' : folha.status === 'fechada' ? 'processado' : 'pago',
        data_pagamento: folha.updated_at,
        proventos: [],
        descontos: [],
        encargos: []
      };
    });
  }, [folhas, colaboradores]);

  // Agregar totais da folha
  const folhaAtual = useMemo(() => {
    if (folhas.length === 0) return null;
    return {
      total_proventos: folhas.reduce((sum, f) => sum + f.total_extras, 0),
      total_descontos: folhas.reduce((sum, f) => sum + f.total_descontos, 0),
      total_liquido: folhas.reduce((sum, f) => sum + f.total_a_pagar, 0),
      total_colaboradores: folhas.length,
      status: folhas.every(f => f.status === 'aberta') ? 'aberta' : 'processada',
    };
  }, [folhas]);

  const handleIniciarProcessamento = () => {
    setEtapaAtual(1);
    setMostrarWizard(true);
  };

  const handleContinuarEtapa1 = (comp: string) => {
    handleSetCompetencia(comp);
    setEtapaAtual(2);
  };

  const handleCancelarWizard = () => {
    setEtapaAtual(1);
    setMostrarWizard(false);
  };

  const handleConfirmarSelecao = async (selecionados: { colaboradorId: string; veiculoId?: string }[]) => {
    // Atualizar veículos dos colaboradores se necessário
    for (const { colaboradorId, veiculoId } of selecionados) {
      if (veiculoId) {
        await supabase
          .from('pessoas')
          .update({ veiculo_id: veiculoId })
          .eq('id', colaboradorId);
      }
      
      // Calcular folha
      calcularFolha({ pessoaId: colaboradorId, competencia });
    }
    
    setEtapaAtual(3);
    toast.success('✅ Folha processada!', {
      description: `${selecionados.length} colaboradores • Total calculado com sucesso`,
    });
  };

  const handleVoltarAoInicio = () => {
    setEtapaAtual(1);
    setMostrarWizard(false);
  };

  const handleVerDetalhes = () => {
    setMostrarWizard(false);
  };

  const handleAbrirModalPagamento = (item: any) => {
    setItemSelecionado(item);
    setModalPagamentoAberto(true);
  };

  const handleAbrirDetalhamento = (item: any) => {
    setItemSelecionado(item);
    setModalDetalhamentoAberto(true);
  };

  const handleConfirmarPagamento = (data: any) => {
    if (itemSelecionado) {
      marcarComoPaga(itemSelecionado.id);
    }
    setModalPagamentoAberto(false);
    setItemSelecionado(null);
  };

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleIniciarProcessamento();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  const handleDownloadHolerite = (item: any) => {
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

  // Wizard Mode (Stepper de 3 etapas)
  if (mostrarWizard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-4xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">
              💰 Processar Folha de Pagamento
            </CardTitle>
            <CardDescription>
              Siga os passos para calcular e processar a folha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FolhaStepper currentStep={etapaAtual} />

            <div className="mt-8">
              {etapaAtual === 1 && (
                <FolhaEtapa1Competencia onContinuar={handleContinuarEtapa1} />
              )}

              {etapaAtual === 2 && (
                <SelecionarColaboradoresFolha
                  colaboradores={colaboradores.map(c => ({
                    id: c.id,
                    nome: c.nome,
                    cargo_atual: c.cargo_atual,
                    regime: c.regime as any,
                    salario_base: c.salario_base,
                    fee_mensal: c.fee_mensal,
                    veiculo_id: c.veiculo_id,
                    status: c.status
                  }))}
                  veiculos={veiculos}
                  onConfirmar={handleConfirmarSelecao}
                  onCancelar={handleCancelarWizard}
                />
              )}

              {etapaAtual === 3 && folhaAtual && (
                <FolhaEtapa3Confirmacao
                  competencia={competencia}
                  totalColaboradores={folhaAtual.total_colaboradores}
                  totalLiquido={folhaAtual.total_liquido}
                  totalProventos={folhaAtual.total_proventos}
                  totalDescontos={folhaAtual.total_descontos}
                  onVoltar={handleVoltarAoInicio}
                  onVerDetalhes={handleVerDetalhes}
                />
              )}
            </div>

            {/* Loading State */}
            {isLoading && etapaAtual === 2 && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="p-8">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Processando folha...</p>
                    <p className="text-sm text-muted-foreground">
                      Calculando valores fiscais dos colaboradores
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex gap-2 flex-wrap">
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

      <FABProcessarFolha onClick={handleIniciarProcessamento} />

      {/* Filtros */}
      <Card className="shadow-md" data-tour="competencia">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione a competência (mês/ano)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="competencia">Mês/Ano</Label>
            <Input
              id="competencia"
              type="month"
              value={competencia.substring(0, 7)}
              onChange={(e) => handleSetCompetencia(`${e.target.value}-01`)}
              className="max-w-xs"
            />
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
                  <th className="px-6 py-4 text-right text-sm font-semibold">Base</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Proventos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Descontos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Líquido</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground mt-2">Carregando...</p>
                    </td>
                  </tr>
                ) : itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      Nenhum colaborador encontrado
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{item.colaborador?.nome_completo}</p>
                          <p className="text-sm text-muted-foreground">{item.colaborador?.cpf_cnpj}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{item.colaborador?.cargo_atual || '-'}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(item.base_calculo)}</td>
                      <td className="px-6 py-4 text-right text-success">{formatCurrency(item.total_proventos)}</td>
                      <td className="px-6 py-4 text-right text-destructive">{formatCurrency(item.total_descontos)}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">{formatCurrency(item.liquido)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadHolerite(item)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAbrirDetalhamento(item)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {itemSelecionado && (
        <>
          <PagamentoFolhaModal
            open={modalPagamentoAberto}
            onOpenChange={setModalPagamentoAberto}
            item={itemSelecionado}
            onConfirm={handleConfirmarPagamento}
          />
          <DetalhamentoFiscalModal
            open={modalDetalhamentoAberto}
            onOpenChange={setModalDetalhamentoAberto}
            item={itemSelecionado}
          />
        </>
      )}
      <RelatoriosFiscaisModal
        open={relatoriosFiscaisAberto}
        onOpenChange={setRelatoriosFiscaisAberto}
      />
      <SimuladorFolha
        open={simuladorAberto}
        onOpenChange={setSimuladorAberto}
      />
    </div>
  );
}
