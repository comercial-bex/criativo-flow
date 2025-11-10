import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign, User, Trash2, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialButton } from "@/components/TutorialButton";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
}

interface OrcamentoItem {
  id?: string;
  produto_servico: string;
  descricao?: string;
  quantidade: number;
  preco_unitario: number;
  desconto_percentual: number;
  valor_total: number;
}

interface Orcamento {
  id: string;
  titulo: string;
  descricao?: string;
  valor_total: number;
  valor_final: number;
  desconto_percentual: number;
  desconto_valor: number;
  data_validade: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
  observacoes?: string;
  created_at: string;
  cliente_id?: string;
  clientes?: Cliente;
}

const statusColors = {
  rascunho: "bg-gray-100 text-gray-800",
  enviado: "bg-blue-100 text-blue-800",
  aprovado: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
  expirado: "bg-orange-100 text-orange-800"
};

const statusLabels = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado"
};

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startTutorial, hasSeenTutorial, isActive } = useTutorial('administrativo-orcamentos');

  // Form state
  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    cliente_id: string;
    data_validade: string;
    observacoes: string;
    status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
  }>({
    titulo: "",
    descricao: "",
    cliente_id: "",
    data_validade: "",
    observacoes: "",
    status: "rascunho"
  });

  const [itens, setItens] = useState<OrcamentoItem[]>([
    { produto_servico: "", descricao: "", quantidade: 1, preco_unitario: 0, desconto_percentual: 0, valor_total: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar orçamentos
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select(`
          *,
          clientes (id, nome, email)
        `)
        .order('created_at', { ascending: false });

      if (orcamentosError) throw orcamentosError;

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email')
        .order('nome');

      if (clientesError) throw clientesError;

      setOrcamentos(orcamentosData as Orcamento[] || []);
      setClientes(clientesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularValorItem = (item: OrcamentoItem): number => {
    const subtotal = item.quantidade * item.preco_unitario;
    const desconto = subtotal * (item.desconto_percentual / 100);
    return subtotal - desconto;
  };

  const calcularTotais = () => {
    const valorTotal = itens.reduce((acc, item) => acc + calcularValorItem(item), 0);
    return { valorTotal };
  };

  const adicionarItem = () => {
    setItens([...itens, { 
      produto_servico: "", 
      descricao: "", 
      quantidade: 1, 
      preco_unitario: 0, 
      desconto_percentual: 0, 
      valor_total: 0 
    }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: keyof OrcamentoItem, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    if (campo === 'quantidade' || campo === 'preco_unitario' || campo === 'desconto_percentual') {
      novosItens[index].valor_total = calcularValorItem(novosItens[index]);
    }
    
    setItens(novosItens);
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      cliente_id: "",
      data_validade: "",
      observacoes: "",
      status: "rascunho"
    });
    setItens([{ produto_servico: "", descricao: "", quantidade: 1, preco_unitario: 0, desconto_percentual: 0, valor_total: 0 }]);
    setEditingOrcamento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { valorTotal } = calcularTotais();
    
    const orcamentoData = {
      ...formData,
      valor_total: valorTotal,
      valor_final: valorTotal,
      cliente_id: formData.cliente_id || null,
      responsavel_id: (await supabase.auth.getUser()).data.user?.id
    };

    try {
      let orcamentoId;

      if (editingOrcamento) {
        const { error } = await supabase
          .from('orcamentos')
          .update(orcamentoData)
          .eq('id', editingOrcamento.id);

        if (error) throw error;
        orcamentoId = editingOrcamento.id;

        // Deletar itens existentes
        await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', orcamentoId);
      } else {
        const { data, error } = await supabase
          .from('orcamentos')
          .insert(orcamentoData)
          .select()
          .single();

        if (error) throw error;
        orcamentoId = data.id;
      }

      // Inserir itens
      const itensValidos = itens.filter(item => item.produto_servico.trim() !== '');
      if (itensValidos.length > 0) {
        const itensData = itensValidos.map(item => ({
          orcamento_id: orcamentoId,
          produto_servico: item.produto_servico,
          descricao: item.descricao || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          desconto_percentual: item.desconto_percentual || 0,
          valor_total: calcularValorItem(item)
        }));

        const { error: itensError } = await supabase
          .from('orcamento_itens')
          .insert(itensData);

        if (itensError) throw itensError;
      }

      toast({
        title: editingOrcamento ? "Orçamento atualizado" : "Orçamento criado",
        description: "Operação realizada com sucesso!",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar orçamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (orcamento: Orcamento) => {
    setFormData({
      titulo: orcamento.titulo,
      descricao: orcamento.descricao || "",
      cliente_id: orcamento.cliente_id || "",
      data_validade: orcamento.data_validade,
      observacoes: orcamento.observacoes || "",
      status: orcamento.status
    });

    // Buscar itens do orçamento
    const { data: itensData } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamento.id);

    if (itensData && itensData.length > 0) {
      setItens(itensData.map(item => ({
        id: item.id,
        produto_servico: item.produto_servico,
        descricao: item.descricao || "",
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        desconto_percentual: item.desconto_percentual || 0,
        valor_total: item.valor_total
      })));
    }

    setEditingOrcamento(orcamento);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Orçamento excluído",
        description: "Orçamento excluído com sucesso!",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir orçamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleView = (id: string) => {
    navigate(`/admin/orcamentos/${id}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  const { valorTotal } = calcularTotais();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos e propostas comerciais</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-tour="novo-orcamento" onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrcamento ? "Editar Orçamento" : "Novo Orçamento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
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
                <div>
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              {/* Itens do Orçamento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
                  <Button type="button" variant="outline" onClick={adicionarItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
                
                {itens.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <Label>Produto/Serviço</Label>
                          <Input
                            value={item.produto_servico}
                            onChange={(e) => atualizarItem(index, 'produto_servico', e.target.value)}
                            placeholder="Nome do produto/serviço"
                          />
                        </div>
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Preço Unitário</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.preco_unitario}
                            onChange={(e) => atualizarItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Desconto (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.desconto_percentual}
                            onChange={(e) => atualizarItem(index, 'desconto_percentual', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <Textarea
                            placeholder="Descrição adicional (opcional)"
                            value={item.descricao}
                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                            className="min-h-[60px]"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor Total</p>
                            <p className="text-lg font-semibold">
                              R$ {calcularValorItem(item).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          {itens.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removerItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total do Orçamento:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingOrcamento ? "Atualizar" : "Criar"} Orçamento
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 gap-6">
        {orcamentos.map((orcamento) => (
          <Card key={orcamento.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {orcamento.titulo}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {orcamento.clientes && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {orcamento.clientes.nome}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Validade: {format(new Date(orcamento.data_validade), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {orcamento.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[orcamento.status]}>
                    {statusLabels[orcamento.status]}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleView(orcamento.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(orcamento)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(orcamento.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            {orcamento.descricao && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{orcamento.descricao}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {orcamentos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-muted-foreground">Crie seu primeiro orçamento para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}