import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface OrcamentoItem {
  id?: string;
  produto_servico: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  desconto_percentual: number;
  valor_total: number;
}

interface Cliente {
  id: string;
  nome: string;
}

interface OrcamentoFormProps {
  onSuccess: () => void;
}

export function OrcamentoForm({ onSuccess }: OrcamentoFormProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    cliente_id: "",
    data_validade: "",
    observacoes: "",
  });
  const [itens, setItens] = useState<OrcamentoItem[]>([
    {
      produto_servico: "",
      descricao: "",
      quantidade: 1,
      preco_unitario: 0,
      desconto_percentual: 0,
      valor_total: 0,
    }
  ]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calcularValorItem = (item: OrcamentoItem) => {
    const subtotal = item.quantidade * item.preco_unitario;
    const desconto = (subtotal * item.desconto_percentual) / 100;
    return subtotal - desconto;
  };

  const atualizarItem = (index: number, campo: keyof OrcamentoItem, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    // Recalcular valor total do item
    novosItens[index].valor_total = calcularValorItem(novosItens[index]);
    
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([...itens, {
      produto_servico: "",
      descricao: "",
      quantidade: 1,
      preco_unitario: 0,
      desconto_percentual: 0,
      valor_total: 0,
    }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const valorTotalOrcamento = itens.reduce((acc, item) => acc + item.valor_total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar orçamento
      const { data: orcamento, error: orcamentoError } = await supabase
        .from("orcamentos")
        .insert({
          ...formData,
          valor_total: valorTotalOrcamento,
          valor_final: valorTotalOrcamento,
          responsavel_id: user?.id,
        })
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // Criar itens do orçamento
      const itensParaInserir = itens.map(item => ({
        ...item,
        orcamento_id: orcamento.id,
      }));

      const { error: itensError } = await supabase
        .from("orcamento_itens")
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      toast({
        title: "Sucesso!",
        description: "Orçamento criado com sucesso.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao criar orçamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                required
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Itens do orçamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens do Orçamento</CardTitle>
            <Button type="button" onClick={adicionarItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {itens.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Produto/Serviço</Label>
                  <Input
                    value={item.produto_servico}
                    onChange={(e) => atualizarItem(index, "produto_servico", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={item.descricao}
                    onChange={(e) => atualizarItem(index, "descricao", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(index, "quantidade", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.preco_unitario}
                    onChange={(e) => atualizarItem(index, "preco_unitario", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={item.desconto_percentual}
                    onChange={(e) => atualizarItem(index, "desconto_percentual", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.valor_total)}
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total geral */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Geral:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(valorTotalOrcamento)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Orçamento"}
        </Button>
      </div>
    </form>
  );
}