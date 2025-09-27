import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
}

interface CreatePlanejamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clienteId?: string;
}

export function CreatePlanejamentoModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  clienteId 
}: CreatePlanejamentoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: clienteId || "",
    mes_referencia: "",
    descricao: ""
  });

  useEffect(() => {
    if (open) {
      fetchClientes();
      if (clienteId) {
        setFormData(prev => ({ ...prev, cliente_id: clienteId }));
      }
    }
  }, [open, clienteId]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('planejamentos')
        .insert({
          titulo: formData.titulo,
          cliente_id: formData.cliente_id,
          mes_referencia: formData.mes_referencia,
          descricao: formData.descricao,
          status: 'rascunho'
        });

      if (error) throw error;

      toast({
        title: "Planejamento criado com sucesso!",
        description: "O novo planejamento foi adicionado ao sistema",
      });

      onOpenChange(false);
      setFormData({
        titulo: "",
        cliente_id: clienteId || "",
        mes_referencia: "",
        descricao: ""
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      toast({
        title: "Erro ao criar planejamento",
        description: "Não foi possível criar o planejamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Planejamento</DialogTitle>
          <DialogDescription>
            Crie um novo planejamento para o cliente selecionado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Planejamento</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Planejamento Janeiro 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select 
                value={formData.cliente_id} 
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                disabled={!!clienteId}
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
              <Label htmlFor="mes_referencia">Mês de Referência</Label>
              <Input
                id="mes_referencia"
                type="date"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os objetivos e escopo do planejamento..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Criando..." : "Criar Planejamento"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}