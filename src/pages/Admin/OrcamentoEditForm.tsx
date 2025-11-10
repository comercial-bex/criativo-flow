import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

const statusLabels = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado",
  arquivado: "Arquivado"
};

export default function OrcamentoEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    cliente_id: string;
    data_validade: string;
    observacoes: string;
    status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado' | 'arquivado';
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
  }, [id]);

  const fetchData = async () => {
    try {
      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email')
        .order('nome');

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Buscar orçamento
      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single();

      if (orcamentoError) throw orcamentoError;

      setFormData({
        titulo: orcamentoData.titulo,
        descricao: orcamentoData.descricao || "",
        cliente_id: orcamentoData.cliente_id || "",
        data_validade: orcamentoData.data_validade,
        observacoes: orcamentoData.observacoes || "",
        status: orcamentoData.status as 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado' | 'arquivado'
      });

      // Buscar itens
      const { data: itensData, error: itensError } = await supabase
        .from('orcamento_itens')
        .select('*')
        .eq('orcamento_id', id);

      if (itensError) throw itensError;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { valorTotal } = calcularTotais();
    
    const orcamentoData = {
      ...formData,
      valor_total: valorTotal,
      valor_final: valorTotal,
      cliente_id: formData.cliente_id || null,
    };

    try {
      // Atualizar orçamento
      const { error: updateError } = await supabase
        .from('orcamentos')
        .update(orcamentoData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Deletar itens existentes
      await supabase
        .from('orcamento_itens')
        .delete()
        .eq('orcamento_id', id);

      // Inserir novos itens
      const itensValidos = itens.filter(item => item.produto_servico.trim() !== '');
      if (itensValidos.length > 0) {
        const itensData = itensValidos.map(item => ({
          orcamento_id: id,
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

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', id] });
      queryClient.invalidateQueries({ queryKey: ['orcamento_itens', id] });

      toast({
        title: "Orçamento atualizado",
        description: "Alterações salvas com sucesso!",
      });

      navigate(`/admin/orcamentos/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar orçamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  const { valorTotal } = calcularTotais();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/admin/orcamentos/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Orçamento</h1>
        <p className="text-muted-foreground">Modifique as informações do orçamento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
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
            
            <div className="mt-4">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Itens do Orçamento */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
              <Button type="button" variant="outline" onClick={adicionarItem}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {itens.map((item, index) => (
                <Card key={index} className="border-muted">
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
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Descrição adicional (opcional)"
                          value={item.descricao}
                          onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                          rows={2}
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
                            variant="destructive"
                            size="icon"
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

            <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-lg font-semibold">Valor Total do Orçamento</span>
              <span className="text-2xl font-bold text-primary">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/orcamentos/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
