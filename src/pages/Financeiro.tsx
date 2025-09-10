import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string;
  descricao?: string;
}

interface TransacaoFinanceira {
  id: string;
  titulo: string;
  descricao?: string;
  valor: number;
  tipo: "pagar" | "receber";
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  data_vencimento: string;
  data_pagamento?: string;
  categoria_id?: string;
  cliente_id?: string;
  projeto_id?: string;
  observacoes?: string;
  categorias_financeiras?: CategoriaFinanceira;
  clientes?: { nome: string };
  projetos?: { nome: string };
}

interface Cliente {
  id: string;
  nome: string;
}

interface Projeto {
  id: string;
  nome: string;
}

export default function Financeiro() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransacaoFinanceira | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaFinanceira | null>(null);
  const { toast } = useToast();

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
    observacoes: ""
  });

  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    tipo: "receita" as "receita" | "despesa",
    cor: "#3b82f6",
    descricao: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar transações
      const { data: transacoesData, error: transacoesError } = await supabase
        .from("transacoes_financeiras")
        .select(`
          *,
          categorias_financeiras (id, nome, tipo, cor),
          clientes (nome),
          projetos (nome)
        `)
        .order("data_vencimento", { ascending: false });

      if (transacoesError) throw transacoesError;
      setTransacoes((transacoesData as TransacaoFinanceira[]) || []);

      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias_financeiras")
        .select("*")
        .order("nome");

      if (categoriasError) throw categoriasError;
      setCategorias((categoriasData as CategoriaFinanceira[]) || []);

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Buscar projetos
      const { data: projetosData, error: projetosError } = await supabase
        .from("projetos")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");

      if (projetosError) throw projetosError;
      setProjetos(projetosData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    }
  };

  const handleSaveTransacao = async () => {
    try {
      const transacaoData = {
        titulo: novaTransacao.titulo,
        descricao: novaTransacao.descricao || null,
        valor: parseFloat(novaTransacao.valor),
        tipo: novaTransacao.tipo,
        status: novaTransacao.status,
        data_vencimento: format(novaTransacao.data_vencimento, "yyyy-MM-dd"),
        data_pagamento: novaTransacao.data_pagamento ? format(novaTransacao.data_pagamento, "yyyy-MM-dd") : null,
        categoria_id: novaTransacao.categoria_id || null,
        cliente_id: novaTransacao.cliente_id || null,
        projeto_id: novaTransacao.projeto_id || null,
        observacoes: novaTransacao.observacoes || null
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from("transacoes_financeiras")
          .update(transacaoData)
          .eq("id", editingTransaction.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Transação atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from("transacoes_financeiras")
          .insert([transacaoData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Transação criada com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingTransaction(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar transação",
        variant: "destructive"
      });
    }
  };

  const handleSaveCategoria = async () => {
    try {
      if (editingCategoria) {
        const { error } = await supabase
          .from("categorias_financeiras")
          .update(novaCategoria)
          .eq("id", editingCategoria.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Categoria atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from("categorias_financeiras")
          .insert([novaCategoria]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Categoria criada com sucesso!" });
      }

      setIsCategoriaDialogOpen(false);
      setEditingCategoria(null);
      setNovaCategoria({ nome: "", tipo: "receita", cor: "#3b82f6", descricao: "" });
      fetchData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria",
        variant: "destructive"
      });
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
      observacoes: ""
    });
  };

  const handleEdit = (transacao: TransacaoFinanceira) => {
    setEditingTransaction(transacao);
    setNovaTransacao({
      titulo: transacao.titulo,
      descricao: transacao.descricao || "",
      valor: transacao.valor.toString(),
      tipo: transacao.tipo,
      status: transacao.status,
      data_vencimento: new Date(transacao.data_vencimento),
      data_pagamento: transacao.data_pagamento ? new Date(transacao.data_pagamento) : undefined,
      categoria_id: transacao.categoria_id || "",
      cliente_id: transacao.cliente_id || "",
      projeto_id: transacao.projeto_id || "",
      observacoes: transacao.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleEditCategoria = (categoria: CategoriaFinanceira) => {
    setEditingCategoria(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor,
      descricao: categoria.descricao || ""
    });
    setIsCategoriaDialogOpen(true);
  };

  const filteredTransacoes = transacoes.filter(transacao => {
    const matchesSearch = transacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transacao.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transacao.projetos?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || transacao.tipo === filterTipo;
    const matchesStatus = filterStatus === "todos" || transacao.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const totalReceber = transacoes
    .filter(t => t.tipo === "receber" && t.status !== "cancelado")
    .reduce((sum, t) => sum + t.valor, 0);

  const totalPagar = transacoes
    .filter(t => t.tipo === "pagar" && t.status !== "cancelado")
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoTotal = totalReceber - totalPagar;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      pago: "default",
      atrasado: "destructive",
      cancelado: "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    return (
      <Badge variant={tipo === "receber" ? "default" : "secondary"}>
        {tipo === "receber" ? "A Receber" : "A Pagar"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie contas a pagar e receber
          </p>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transacoes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transações Financeiras</CardTitle>
                  <CardDescription>
                    Gerencie contas a pagar e receber
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setEditingTransaction(null); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTransaction ? "Editar Transação" : "Nova Transação"}
                      </DialogTitle>
                      <DialogDescription>
                        Preencha os dados da transação financeira
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="titulo">Título</Label>
                          <Input
                            id="titulo"
                            value={novaTransacao.titulo}
                            onChange={(e) => setNovaTransacao({ ...novaTransacao, titulo: e.target.value })}
                            placeholder="Título da transação"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="valor">Valor</Label>
                          <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            value={novaTransacao.valor}
                            onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select
                            value={novaTransacao.tipo}
                            onValueChange={(value: "pagar" | "receber") => 
                              setNovaTransacao({ ...novaTransacao, tipo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receber">A Receber</SelectItem>
                              <SelectItem value="pagar">A Pagar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={novaTransacao.status}
                            onValueChange={(value: "pendente" | "pago" | "atrasado" | "cancelado") => 
                              setNovaTransacao({ ...novaTransacao, status: value })
                            }
                          >
                            <SelectTrigger>
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data de Vencimento</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !novaTransacao.data_vencimento && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {novaTransacao.data_vencimento ? 
                                  format(novaTransacao.data_vencimento, "PPP", { locale: ptBR }) : 
                                  "Selecione a data"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={novaTransacao.data_vencimento}
                                onSelect={(date) => date && setNovaTransacao({ ...novaTransacao, data_vencimento: date })}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Pagamento</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !novaTransacao.data_pagamento && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {novaTransacao.data_pagamento ? 
                                  format(novaTransacao.data_pagamento, "PPP", { locale: ptBR }) : 
                                  "Selecione a data"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={novaTransacao.data_pagamento}
                                onSelect={(date) => setNovaTransacao({ ...novaTransacao, data_pagamento: date })}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select
                            value={novaTransacao.categoria_id}
                            onValueChange={(value) => setNovaTransacao({ ...novaTransacao, categoria_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  {categoria.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cliente">Cliente</Label>
                          <Select
                            value={novaTransacao.cliente_id}
                            onValueChange={(value) => setNovaTransacao({ ...novaTransacao, cliente_id: value })}
                          >
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <Label htmlFor="projeto">Projeto</Label>
                          <Select
                            value={novaTransacao.projeto_id}
                            onValueChange={(value) => setNovaTransacao({ ...novaTransacao, projeto_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um projeto" />
                            </SelectTrigger>
                            <SelectContent>
                              {projetos.map((projeto) => (
                                <SelectItem key={projeto.id} value={projeto.id}>
                                  {projeto.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={novaTransacao.descricao}
                          onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                          placeholder="Descrição da transação"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={novaTransacao.observacoes}
                          onChange={(e) => setNovaTransacao({ ...novaTransacao, observacoes: e.target.value })}
                          placeholder="Observações adicionais"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveTransacao}>
                        {editingTransaction ? "Atualizar" : "Criar"} Transação
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="receber">A Receber</SelectItem>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Cliente/Projeto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transacao.titulo}</div>
                          {transacao.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {transacao.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(transacao.tipo)}</TableCell>
                      <TableCell className="font-medium">
                        <span className={transacao.tipo === "receber" ? "text-green-600" : "text-red-600"}>
                          R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transacao.status)}</TableCell>
                      <TableCell>
                        {format(new Date(transacao.data_vencimento), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transacao.clientes?.nome && (
                            <div>{transacao.clientes.nome}</div>
                          )}
                          {transacao.projetos?.nome && (
                            <div className="text-muted-foreground">{transacao.projetos.nome}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transacao.categorias_financeiras && (
                          <Badge 
                            variant="outline" 
                            style={{ backgroundColor: `${transacao.categorias_financeiras.cor}20`, color: transacao.categorias_financeiras.cor }}
                          >
                            {transacao.categorias_financeiras.nome}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transacao)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Categorias Financeiras</CardTitle>
                  <CardDescription>
                    Gerencie categorias de receitas e despesas
                  </CardDescription>
                </div>
                <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { 
                      setNovaCategoria({ nome: "", tipo: "receita", cor: "#3b82f6", descricao: "" }); 
                      setEditingCategoria(null); 
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeCategoria">Nome</Label>
                        <Input
                          id="nomeCategoria"
                          value={novaCategoria.nome}
                          onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                          placeholder="Nome da categoria"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipoCategoria">Tipo</Label>
                          <Select
                            value={novaCategoria.tipo}
                            onValueChange={(value: "receita" | "despesa") => 
                              setNovaCategoria({ ...novaCategoria, tipo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receita">Receita</SelectItem>
                              <SelectItem value="despesa">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cor">Cor</Label>
                          <Input
                            id="cor"
                            type="color"
                            value={novaCategoria.cor}
                            onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descricaoCategoria">Descrição</Label>
                        <Textarea
                          id="descricaoCategoria"
                          value={novaCategoria.descricao}
                          onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                          placeholder="Descrição da categoria"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoriaDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveCategoria}>
                        {editingCategoria ? "Atualizar" : "Criar"} Categoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorias.map((categoria) => (
                  <Card key={categoria.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <div>
                            <div className="font-medium">{categoria.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {categoria.tipo === "receita" ? "Receita" : "Despesa"}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategoria(categoria)}
                        >
                          Editar
                        </Button>
                      </div>
                      {categoria.descricao && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {categoria.descricao}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}