import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, TrendingUp, TrendingDown, DollarSign, Clock, Edit2, Trash2, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProdutoSelector } from "@/components/Financeiro/ProdutoSelector";
import { CadastroProdutoRapido } from "@/components/Financeiro/CadastroProdutoRapido";
import { useProdutosFinanceiro } from "@/hooks/useProdutosFinanceiro";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { useNavigate } from 'react-router-dom';
import { DataSyncIndicator } from '@/components/Admin/DataSyncIndicator';
import { CardsAcessoRapido } from '@/components/Financeiro/CardsAcessoRapido';
import { useTransacoes, useCreateTransacao, useUpdateTransacao, useDeleteTransacao, TransacaoFinanceira, TransacaoInput } from "@/hooks/useTransacoesFinanceiras";
import { useFinanceiroKPIs } from "@/hooks/useFinanceiroKPIs";
import { useCategoriasFinanceiras, CategoriaFinanceira } from "@/hooks/useCategoriasFinanceiras";
import { useClientes } from "@/hooks/useClientes";
import { useDebounceFilter } from "@/hooks/useDebounceFilter";

interface Projeto {
  id: string;
  titulo: string;
}

export default function Financeiro() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const { startTutorial, hasSeenTutorial } = useTutorial('financeiro-transacoes');
  const navigate = useNavigate();

  const [modalCadastroRapido, setModalCadastroRapido] = useState(false);
  const { produtosDisponiveis, createTempData } = useProdutosFinanceiro();

  // ✅ DEBOUNCE: Evita queries a cada keystroke
  const debouncedSearch = useDebounceFilter(searchTerm, 500);
  const debouncedFilterTipo = useDebounceFilter(filterTipo, 300);
  const debouncedFilterStatus = useDebounceFilter(filterStatus, 300);

  // ✅ HOOKS COM CACHE (TanStack Query)
  const { data: kpis, isLoading: loadingKPIs } = useFinanceiroKPIs();
  const { data: categorias = [], isLoading: loadingCategorias } = useCategoriasFinanceiras();
  const { data: allClientes = [], isLoading: loadingClientes } = useClientes();
  
  // Filtrar apenas clientes ativos
  const clientes = useMemo(() => 
    allClientes.filter(c => c.status === 'ativo'),
    [allClientes]
  );

  // Buscar transações com filtros debounced
  const { data: transacoes = [], isLoading: loadingTransacoes } = useTransacoes({
    tipo: debouncedFilterTipo !== 'todos' ? (debouncedFilterTipo as any) : undefined,
    status: debouncedFilterStatus !== 'todos' ? debouncedFilterStatus : undefined,
  });

  // Mutations
  const createMutation = useCreateTransacao();
  const updateMutation = useUpdateTransacao();
  const deleteMutation = useDeleteTransacao();
  
  const [novaTransacao, setNovaTransacao] = useState({
    titulo: "",
    descricao: "",
    valor: "",
    tipo: "receber" as "pagar" | "receber",
    status: "pendente" as "pendente" | "pago" | "atrasado" | "cancelado",
    data_vencimento: new Date(),
    data_pagamento: undefined as Date | undefined,
    categoria_id: "",
    cliente_id: "",
    projeto_id: "",
    produto_id: "",
    observacoes: ""
  });

  // ============================================================================
  // BUSCAR PROJETOS (mantido do código original)
  // ============================================================================
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const { data } = await supabase
          .from("projetos")
          .select("id, titulo")
          .eq("status", "ativo")
          .order("titulo");
        
        if (data) setProjetos(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };
    
    fetchProjetos();
  }, []);

  // ============================================================================
  // HANDLERS (Otimizados com mutations do TanStack Query)
  // ============================================================================
  const handleSaveTransacao = async () => {
    try {
      const valor = parseFloat(novaTransacao.valor);
      if (isNaN(valor) || valor <= 0) {
        toast.error("Valor deve ser um número válido maior que zero");
        return;
      }

      const transacaoData: Partial<TransacaoInput> = {
        titulo: novaTransacao.titulo.trim(),
        descricao: novaTransacao.descricao?.trim() || undefined,
        valor,
        tipo: (novaTransacao.tipo === 'receber' ? 'receita' : 'despesa') as 'receita' | 'despesa',
        status: novaTransacao.status,
        data_vencimento: format(novaTransacao.data_vencimento, "yyyy-MM-dd"),
        data_pagamento: novaTransacao.data_pagamento 
          ? format(novaTransacao.data_pagamento, "yyyy-MM-dd") 
          : undefined,
        categoria_id: novaTransacao.categoria_id || undefined,
        cliente_id: novaTransacao.cliente_id || undefined,
        projeto_id: novaTransacao.projeto_id || undefined,
        observacoes: novaTransacao.observacoes?.trim() || undefined,
      };

      if (editingTransaction) {
        await updateMutation.mutateAsync({ 
          id: editingTransaction.id, 
          data: transacaoData 
        });
      } else {
        const novaTransacaoData = await createMutation.mutateAsync(transacaoData as any);

        // Sincronização automática com módulo administrativo
        if (novaTransacao.produto_id && novaTransacao.cliente_id && novaTransacaoData) {
          const produtoInfo = produtosDisponiveis.find(p => p.id === novaTransacao.produto_id);
          
          if (produtoInfo) {
            createTempData({
              cliente_id: novaTransacao.cliente_id,
              produto_id: produtoInfo.id,
              produto_nome: produtoInfo.nome,
              valor_unitario: produtoInfo.preco_padrao,
              categoria: produtoInfo.categoria || undefined,
              descricao_curta: produtoInfo.descricao || undefined,
            });
          }
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const resetForm = () => {
    setNovaTransacao({
      titulo: "",
      descricao: "",
      valor: "",
      tipo: "receber",
      status: "pendente",
      data_vencimento: new Date(),
      data_pagamento: undefined,
      categoria_id: "",
      cliente_id: "",
      projeto_id: "",
      produto_id: "",
      observacoes: ""
    });
    setEditingTransaction(null);
  };

  const handleLancarReceita = () => {
    resetForm();
    setNovaTransacao(prev => ({ ...prev, tipo: "receber" }));
    setIsDialogOpen(true);
  };

  const handleLancarDespesa = () => {
    resetForm();
    setNovaTransacao(prev => ({ ...prev, tipo: "pagar" }));
    setIsDialogOpen(true);
  };

  const handleEdit = (transacao: any) => {
    setEditingTransaction(transacao);
    
    // Converter tipo de volta para o formato do form
    const tipoForm = transacao.tipo === 'receita' ? 'receber' : 'pagar';
    
    setNovaTransacao({
      titulo: transacao.titulo || "",
      descricao: transacao.descricao || "",
      valor: transacao.valor?.toString() || "",
      tipo: tipoForm as "pagar" | "receber",
      status: transacao.status as "pendente" | "pago" | "atrasado" | "cancelado",
      data_vencimento: new Date(transacao.data_vencimento),
      data_pagamento: transacao.data_pagamento ? new Date(transacao.data_pagamento) : undefined,
      categoria_id: transacao.categoria_id || "",
      cliente_id: transacao.cliente_id || "",
      projeto_id: transacao.projeto_id || "",
      produto_id: "",
      observacoes: transacao.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "bg-green-100 text-green-800";
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "atrasado": return "bg-red-100 text-red-800";
      case "cancelado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // ============================================================================
  // FILTROS E CÁLCULOS OTIMIZADOS (useMemo para evitar recálculos)
  // ============================================================================
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      const matchesSearch = 
        transacao.titulo?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        transacao.descricao?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      return matchesSearch;
    });
  }, [transacoes, debouncedSearch]);

  // KPIs já vêm do hook otimizado
  const totalReceber = kpis?.totalReceber || 0;
  const totalPagar = kpis?.totalPagar || 0;
  const saldoLiquido = kpis?.saldoLiquido || 0;
  const vencendoHoje = kpis?.vencendoHoje || 0;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            💰 Movimentações Financeiras
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie entradas e saídas de forma simples e rápida
          </p>
        </div>
        <div className="flex gap-2">
          <DataSyncIndicator />
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        </div>
      </div>

      {/* Cards de Acesso Rápido */}
      <CardsAcessoRapido 
        onLancarReceita={handleLancarReceita}
        onLancarDespesa={handleLancarDespesa}
      />

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-4" data-tour="kpis">
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow" data-tour="kpi-receber">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total a Receber</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas pendentes e pagas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow" data-tour="kpi-pagar">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total a Pagar</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Despesas pendentes e pagas
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-md hover:shadow-lg transition-shadow ${saldoLiquido >= 0 ? 'border-l-primary' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
            <div className={`p-2 rounded-lg ${saldoLiquido >= 0 ? 'bg-primary/10' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
              <DollarSign className={`h-5 w-5 ${saldoLiquido >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${saldoLiquido >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Diferença entre receitas e despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencendo Hoje</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {vencendoHoje}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              transações para hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lançamentos do Mês</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction 
                ? "Editar Lançamento" 
                : novaTransacao.tipo === "receber" 
                  ? "➕ Lançar Receita (Entrada)" 
                  : "➖ Lançar Despesa (Saída)"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Edite as informações do lançamento."
                : novaTransacao.tipo === "receber"
                  ? "Registre uma entrada de dinheiro (venda, recebimento, etc.)"
                  : "Registre uma saída de dinheiro (compra, pagamento, etc.)"}
            </DialogDescription>
          </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="titulo" className="text-right">
                  Título
                </Label>
                <Input
                  id="titulo"
                  value={novaTransacao.titulo}
                  onChange={(e) => setNovaTransacao({...novaTransacao, titulo: e.target.value})}
                  className="col-span-3"
                  placeholder="Título da transação"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                  className="col-span-3"
                  placeholder="Descrição da transação"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="valor" className="text-right">
                  Valor
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={novaTransacao.valor}
                  onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                  className="col-span-3"
                  placeholder="0,00"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo" className="text-right">
                  Tipo
                </Label>
                <Select 
                  value={novaTransacao.tipo} 
                  onValueChange={(value: "pagar" | "receber") => setNovaTransacao({...novaTransacao, tipo: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receber">Conta a Receber</SelectItem>
                    <SelectItem value="pagar">Conta a Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={novaTransacao.status} 
                  onValueChange={(value: "pendente" | "pago" | "atrasado" | "cancelado") => 
                    setNovaTransacao({...novaTransacao, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoria" className="text-right">
                  Categoria
                </Label>
                <Select 
                  value={novaTransacao.categoria_id} 
                  onValueChange={(value) => setNovaTransacao({...novaTransacao, categoria_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          {categoria.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <Select 
                  value={novaTransacao.cliente_id} 
                  onValueChange={(value) => setNovaTransacao({...novaTransacao, cliente_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projeto" className="text-right">
                  Projeto
                </Label>
                <Select 
                  value={novaTransacao.projeto_id} 
                  onValueChange={(value) => setNovaTransacao({...novaTransacao, projeto_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map((projeto) => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-3">Produto/Serviço</Label>
                <div className="col-span-3">
                  <ProdutoSelector
                    value={novaTransacao.produto_id}
                    onChange={(produtoId, produtoData) => {
                      setNovaTransacao({ ...novaTransacao, produto_id: produtoId || "" });
                      if (produtoData && !novaTransacao.valor) {
                        setNovaTransacao(prev => ({
                          ...prev,
                          valor: produtoData.preco_padrao.toString()
                        }));
                      }
                    }}
                    onCreateNew={() => setModalCadastroRapido(true)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data_vencimento" className="text-right">
                  Data Vencimento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !novaTransacao.data_vencimento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {novaTransacao.data_vencimento ? (
                        format(novaTransacao.data_vencimento, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={novaTransacao.data_vencimento}
                      onSelect={(date) => date && setNovaTransacao({...novaTransacao, data_vencimento: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {novaTransacao.status === "pago" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="data_pagamento" className="text-right">
                    Data Pagamento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !novaTransacao.data_pagamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {novaTransacao.data_pagamento ? (
                          format(novaTransacao.data_pagamento, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={novaTransacao.data_pagamento}
                        onSelect={(date) => setNovaTransacao({...novaTransacao, data_pagamento: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={novaTransacao.observacoes}
                  onChange={(e) => setNovaTransacao({...novaTransacao, observacoes: e.target.value})}
                  className="col-span-3"
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveTransacao}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Salvando..." 
                  : editingTransaction ? "Atualizar" : "Criar"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CadastroProdutoRapido
          open={modalCadastroRapido}
          onOpenChange={setModalCadastroRapido}
          onSuccess={(produtoId) => {
            setNovaTransacao({ ...novaTransacao, produto_id: produtoId });
          }}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receber">Contas a Receber</SelectItem>
            <SelectItem value="pagar">Contas a Pagar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Transações */}
      <Card className="shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Todas as transações financeiras cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Título</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Vencimento</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransacoes.map((transacao) => (
                <TableRow key={transacao.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{transacao.titulo}</TableCell>
                  <TableCell>
                    <Badge variant={transacao.tipo === "receita" ? "default" : "secondary"} className="font-medium">
                      {transacao.tipo === "receita" ? "A Receber" : "A Pagar"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${transacao.tipo === "receita" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transacao.status)}>
                      {transacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(transacao.data_vencimento).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {transacao.categorias_financeiras && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: transacao.categorias_financeiras.cor }}
                        />
                        <span className="text-sm">{transacao.categorias_financeiras.nome}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transacao.clientes?.nome || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                       onClick={() => handleEdit(transacao)}
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                        disabled={updateMutation.isPending}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transacao.id)}
                        disabled={deleteMutation.isPending}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">Nenhuma transação encontrada</p>
                      <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros ou criar uma nova transação</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Link para Gestão de Pessoas */}
      <Card className="border-l-4 border-l-primary cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/rh/pessoas')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gestão de Pessoas</CardTitle>
                <CardDescription>Cadastrar e gerenciar colaboradores para folha de pagamento</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}