import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BriefingForm } from './BriefingForm';
import { useOperationalPermissions } from '@/hooks/useOperationalPermissions';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (taskData: any) => void;
  projetoId: string;
  defaultStatus?: string;
}

export function CreateTaskModal({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  projetoId,
  defaultStatus = 'backlog' 
}: CreateTaskModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<'avulsa' | 'planejamento'>('avulsa');
  
  // ⛔ GUARD: Verificar permissão de criação
  const { permissions } = useOperationalPermissions();
  
  // Bloquear acesso se não tiver permissão
  if (!permissions.canCreateTask && open) {
    toast({
      title: "⛔ Sem Permissão",
      description: "Apenas GRS e Administradores podem criar tarefas.",
      variant: "destructive"
    });
    onOpenChange(false);
    return null;
  }
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    setor_responsavel: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    data_prazo: undefined as Date | undefined,
    horas_estimadas: '',
    // Briefing fields
    objetivo_postagem: '',
    publico_alvo: '',
    formato_postagem: '',
    contexto_estrategico: '',
    call_to_action: '',
    hashtags: '',
    observacoes: ''
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      setor_responsavel: '',
      prioridade: 'media',
      data_prazo: undefined,
      horas_estimadas: '',
      objetivo_postagem: '',
      publico_alvo: '',
      formato_postagem: '',
      contexto_estrategico: '',
      call_to_action: '',
      hashtags: '',
      observacoes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // CRÍTICO: Previne reload da página
    
    if (!formData.titulo.trim() || !formData.setor_responsavel) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o setor responsável.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        projeto_id: projetoId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        setor_responsavel: formData.setor_responsavel,
        prioridade: formData.prioridade,
        status: defaultStatus,
        data_prazo: formData.data_prazo?.toISOString().split('T')[0],
        horas_estimadas: formData.horas_estimadas ? parseInt(formData.horas_estimadas) : null,
        // Add briefing data as JSON in observacoes field for now
        observacoes: JSON.stringify({
          objetivo_postagem: formData.objetivo_postagem,
          publico_alvo: formData.publico_alvo,
          formato_postagem: formData.formato_postagem,
          contexto_estrategico: formData.contexto_estrategico,
          call_to_action: formData.call_to_action,
          hashtags: formData.hashtags ? formData.hashtags.split(',').map(h => h.trim()) : [],
          observacoes: formData.observacoes
        })
      };

      await onTaskCreate(taskData);
      
      // Fecha o modal ANTES do toast para UX mais fluida
      onOpenChange(false);
      
      // Toast de sucesso com ícone
      toast({
        title: "✅ Tarefa criada com sucesso!",
        description: `A tarefa "${formData.titulo}" foi adicionada ao projeto.`,
      });

      // Reset após fechar (cleanup)
      setTimeout(() => resetForm(), 300);
      
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "❌ Erro ao criar tarefa",
        description: error?.message || "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentResponsible = (setor: string) => {
    // This could be enhanced to automatically assign based on available team members
    const departmentMapping = {
      'design': 'Designer responsável será atribuído automaticamente',
      'audiovisual': 'Filmmaker responsável será atribuído automaticamente', 
      'grs': 'Especialista GRS será atribuído automaticamente',
      'estrategico': 'Gestor será atribuído automaticamente'
    };
    return departmentMapping[setor as keyof typeof departmentMapping] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Crie uma nova tarefa com briefing detalhado para o projeto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setTaskType('avulsa')}
              className={cn(
                "flex-1 p-3 rounded-md text-sm font-medium transition-colors",
                taskType === 'avulsa' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-background"
              )}
            >
              Tarefa Avulsa
              <div className="text-xs opacity-75 mt-1">Briefing completo obrigatório</div>
            </button>
            <button
              type="button"
              onClick={() => setTaskType('planejamento')}
              className={cn(
                "flex-1 p-3 rounded-md text-sm font-medium transition-colors",
                taskType === 'planejamento' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-background"
              )}
            >
              Planejamento Mensal
              <div className="text-xs opacity-75 mt-1">Estrutura pré-definida</div>
            </button>
          </div>

          {/* Basic Task Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Tarefa *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Post promocional Black Friday"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor Responsável *</Label>
              <Select 
                value={formData.setor_responsavel} 
                onValueChange={(value) => setFormData({ ...formData, setor_responsavel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design/Criativo</SelectItem>
                  <SelectItem value="audiovisual">Audiovisual</SelectItem>
                  <SelectItem value="grs">GRS/Estratégico</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                </SelectContent>
              </Select>
              {formData.setor_responsavel && (
                <p className="text-xs text-muted-foreground">
                  {getDepartmentResponsible(formData.setor_responsavel)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(value: 'baixa' | 'media' | 'alta') => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_prazo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_prazo ? format(formData.data_prazo, "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_prazo}
                    onSelect={(date) => setFormData({ ...formData, data_prazo: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas">Horas Estimadas</Label>
              <Input
                id="horas"
                type="number"
                value={formData.horas_estimadas}
                onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
                placeholder="Ex: 4"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Geral</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva a tarefa de forma geral..."
              rows={3}
            />
          </div>

          {/* Briefing Form */}
          {taskType === 'avulsa' && (
            <BriefingForm 
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {taskType === 'planejamento' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Planejamento Mensal</h3>
              <p className="text-sm text-blue-700">
                Esta tarefa seguirá a estrutura pré-definida do planejamento mensal com posts, cards e vídeos automáticos baseados na assinatura do cliente.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || !formData.titulo || !formData.setor_responsavel}
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}