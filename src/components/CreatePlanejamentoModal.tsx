import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EspecialistasSelector } from "./EspecialistasSelector";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

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
  const { startTutorial, hasSeenTutorial } = useTutorial('create-planejamento-modal');
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Start tutorial when modal opens if not seen before
  useEffect(() => {
    if (open && !hasSeenTutorial) {
      const timer = setTimeout(() => startTutorial(), 500);
      return () => clearTimeout(timer);
    }
  }, [open, hasSeenTutorial, startTutorial]);

  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: clienteId || "",
    mes_referencia: "",
    descricao: "",
    especialistas: {
      grs_id: null as string | null,
      designer_id: null as string | null,
      filmmaker_id: null as string | null,
      gerente_id: null as string | null
    }
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
    
    // Validar que GRS foi selecionado
    if (!formData.especialistas.grs_id) {
      toast({
        title: "GRS obrigatório",
        description: "Você deve selecionar um GRS responsável pelo projeto",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Criar descrição com metadata dos especialistas
      const descricaoComMetadata = JSON.stringify({
        descricao_original: formData.descricao,
        especialistas: formData.especialistas
      });

      const { error } = await supabase
        .from('planejamentos')
        .insert({
          titulo: formData.titulo,
          cliente_id: formData.cliente_id,
          mes_referencia: formData.mes_referencia,
          descricao: descricaoComMetadata,
          status: 'rascunho',
          responsavel_grs_id: formData.especialistas.grs_id
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
        descricao: "",
        especialistas: {
          grs_id: null,
          designer_id: null,
          filmmaker_id: null,
          gerente_id: null
        }
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
      <DialogContent size="xl" height="auto" data-tour="create-planejamento-modal">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center justify-between">
            <span data-tour="create-planejamento-title">Novo Planejamento</span>
            <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} variant="default" />
          </DialogTitle>
          <DialogDescription>
            Crie um novo planejamento para o cliente selecionado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2" data-tour="create-planejamento-titulo">
              <Label htmlFor="titulo">Título do Planejamento</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Planejamento Janeiro 2024"
                required
              />
            </div>
            <div className="space-y-2" data-tour="create-planejamento-cliente">
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
            <div className="space-y-2" data-tour="create-planejamento-mes">
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
          <div className="space-y-2" data-tour="create-planejamento-descricao">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os objetivos e escopo do planejamento..."
              rows={3}
            />
          </div>

          {/* Seleção de Especialistas */}
          <div className="pt-4 border-t" data-tour="create-planejamento-especialistas">
            <EspecialistasSelector
              value={formData.especialistas}
              onChange={(especialistas) => setFormData({ ...formData, especialistas })}
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
