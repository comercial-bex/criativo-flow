import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useClientesAtivos } from '@/hooks/useClientesOptimized';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { Loader2 } from 'lucide-react';
import type { TipoTarefa } from '@/types/tarefa';

interface QuickTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (taskData: any) => Promise<any>;
  clienteId?: string;
}

export function QuickTaskModal({ 
  open, 
  onOpenChange, 
  onTaskCreate,
  clienteId 
}: QuickTaskModalProps) {
  const { toast } = useToast();
  const { data: clientes = [] } = useClientesAtivos();
  const { data: especialistas = [] } = useEspecialistas();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '' as TipoTarefa | '',
    cliente_id: clienteId || '',
    executor_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.tipo || !formData.cliente_id || !formData.executor_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a tarefa",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar executor_area do especialista selecionado
      const executor = especialistas.find(e => e.id === formData.executor_id);
      
      await onTaskCreate({
        titulo: formData.titulo,
        tipo: formData.tipo,
        cliente_id: formData.cliente_id,
        responsavel_id: formData.executor_id,
        executor_area: executor?.especialidade === 'design' ? 'Criativo' : 
                       executor?.especialidade === 'audiovisual' ? 'Audiovisual' : 'Outros',
        status: 'briefing',
        prioridade: 'media',
      });

      toast({
        title: "✅ Tarefa criada",
        description: "A tarefa foi criada com sucesso"
      });

      // Reset form
      setFormData({
        titulo: '',
        tipo: '',
        cliente_id: clienteId || '',
        executor_id: '',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>⚡ Criar Tarefa Rápida</DialogTitle>
          <DialogDescription>
            Crie uma tarefa com os campos essenciais. Você pode adicionar mais detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Tarefa *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Criar post para Instagram"
              required
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Tarefa *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: TipoTarefa) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">📱 Feed</SelectItem>
                <SelectItem value="stories">🎬 Stories</SelectItem>
                <SelectItem value="reels">🎥 Reels</SelectItem>
                <SelectItem value="video_curto">📹 Vídeo Curto</SelectItem>
                <SelectItem value="video_longo">🎞️ Vídeo Longo</SelectItem>
                <SelectItem value="design_grafico">🎨 Design Gráfico</SelectItem>
                <SelectItem value="captacao">📸 Captação</SelectItem>
                <SelectItem value="edicao">✂️ Edição</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
            >
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Selecione o cliente" />
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

          {/* Executor */}
          <div className="space-y-2">
            <Label htmlFor="executor">Executor *</Label>
            <Select
              value={formData.executor_id}
              onValueChange={(value) => setFormData({ ...formData, executor_id: value })}
            >
              <SelectTrigger id="executor">
                <SelectValue placeholder="Selecione o executor" />
              </SelectTrigger>
              <SelectContent>
                {especialistas
                  .filter(e => ['design', 'audiovisual'].includes(e.especialidade || ''))
                  .map((especialista) => (
                    <SelectItem key={especialista.id} value={especialista.id}>
                      {especialista.nome} ({especialista.especialidade === 'design' ? 'Criativo' : 'Audiovisual'})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Tarefa"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
