import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BriefingForm } from './BriefingForm';
import { AIBriefingGenerator } from './AIBriefingGenerator';
import { TaskReferencesTab } from './TaskReferencesTab';
import { useOperationalPermissions } from '@/hooks/useOperationalPermissions';
import { useClientesAtivos } from '@/hooks/useClientesOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import type { TipoTarefa } from '@/types/tarefa';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (taskData: any) => Promise<any>;
  projetoId?: string;
  defaultStatus?: string;
  clienteId?: string;
}

export function CreateTaskModal({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  projetoId,
  defaultStatus = 'backlog',
  clienteId
}: CreateTaskModalProps) {
  const { toast } = useToast();
  const dialogDescriptionId = "create-task-description";
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<'avulsa' | 'planejamento'>('avulsa');
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState(projetoId || '');
  const [vinculadaPlanejamento, setVinculadaPlanejamento] = useState(false);
  const [planejamentos, setPlanejamentos] = useState<any[]>([]);
  const [selectedPlanejamento, setSelectedPlanejamento] = useState('');
  
  // ✅ Hook otimizado para clientes
  const { data: clientes = [] } = useClientesAtivos();
  const [selectedCliente, setSelectedCliente] = useState(clienteId || '');
  const [activeTab, setActiveTab] = useState('basico');
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedExecutor, setSelectedExecutor] = useState("");
  const [tipoTarefaSelecionado, setTipoTarefaSelecionado] = useState<TipoTarefa | ''>('');
  const [idCartao, setIdCartao] = useState('');
  
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
    observacoes: '',
    ambiente: 'cidade' as string,
    // Referências
    referencias_visuais: [] as any[],
    arquivos_complementares: [] as any[],
    capa_thumbnail: null as File | null
  });

  // Gerar ID do cartão automaticamente
  const gerarIdCartao = (tipoTarefa: TipoTarefa | '', clienteId: string) => {
    if (!tipoTarefa || !clienteId) return '';
    
    const prefixo: Record<string, string> = {
      'criativo_card': 'CRD',
      'criativo_carrossel': 'CRS',
      'criativo_vt': 'VT',
      'reels_instagram': 'REELS',
      'stories_interativo': 'STR',
      'criativo_cartela': 'CTL',
      'feed_post': 'FEED',
      'roteiro_reels': 'ROT'
    };
    
    const prefix = prefixo[tipoTarefa] || 'TASK';
    const timestamp = Date.now().toString().slice(-6);
    const clienteCode = clienteId.slice(0, 4).toUpperCase();
    
    return `${prefix}-${clienteCode}-${timestamp}`;
  };

  // Atualizar ID ao mudar tipo ou cliente
  useEffect(() => {
    if (tipoTarefaSelecionado && selectedCliente) {
      setIdCartao(gerarIdCartao(tipoTarefaSelecionado, selectedCliente));
    }
  }, [tipoTarefaSelecionado, selectedCliente]);

  // Filtrar especialistas por tipo de tarefa
  const getEspecialistasDisponiveisPorTipo = (tipoTarefa: TipoTarefa | '') => {
    if (!tipoTarefa || !todosEspecialistas) return [];
    
    const mapeamento: Record<string, string> = {
      // Audiovisual
      'roteiro_reels': 'audiovisual',
      'reels_instagram': 'audiovisual',
      'criativo_vt': 'audiovisual',
      'stories_interativo': 'audiovisual',
      
      // Design/Criativo
      'criativo_card': 'design',
      'criativo_carrossel': 'design',
      'criativo_cartela': 'design',
      'feed_post': 'design',
      
      // GRS
      'planejamento_estrategico': 'grs',
      'datas_comemorativas': 'grs',
      'trafego_pago': 'grs'
    };
    
    const especialidade = mapeamento[tipoTarefa] || 'grs';
    return todosEspecialistas.filter(esp => esp.especialidade === especialidade);
  };
  
  // ⛔ GUARD: Verificar permissão de criação
  const { permissions } = useOperationalPermissions();
  
  // Buscar especialistas
  const { data: todosEspecialistas } = useEspecialistas();
  
  // Filtrar especialistas por setor ou tipo de tarefa
  const especialistasPorSetor = useMemo(() => {
    if (!todosEspecialistas) return [];
    
    // PRIORIDADE 1: Se setor foi explicitamente selecionado, usar ele
    if (formData.setor_responsavel) {
      const setorMap: Record<string, string> = {
        'design': 'design',
        'audiovisual': 'audiovisual',
        'grs': 'grs',
        'atendimento': 'atendimento'
      };
      
      return todosEspecialistas.filter(esp => 
        esp.especialidade === setorMap[formData.setor_responsavel]
      );
    }
    
    // PRIORIDADE 2: Se não tem setor mas tem tipo, sugerir setor automaticamente
    if (tipoTarefaSelecionado) {
      return getEspecialistasDisponiveisPorTipo(tipoTarefaSelecionado);
    }
    
    return [];
  }, [formData.setor_responsavel, tipoTarefaSelecionado, todosEspecialistas]);

  // Debug de especialistas
  useEffect(() => {
    console.log('🔍 DEBUG Especialistas:', {
      setor: formData.setor_responsavel,
      tipo: tipoTarefaSelecionado,
      todosEspecialistas: todosEspecialistas?.length || 0,
      filtrados: especialistasPorSetor.length
    });
  }, [formData.setor_responsavel, tipoTarefaSelecionado, todosEspecialistas, especialistasPorSetor]);
  
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

  // Buscar projetos quando cliente for selecionado
  useEffect(() => {
    if (selectedCliente) {
      fetchProjetosByCliente(selectedCliente);
    }
  }, [selectedCliente]);

  const fetchProjetosByCliente = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('id, titulo, data_inicio, data_prazo, created_at')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const fetchPlanejamentos = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select('id, titulo, mes_referencia, status')
        .eq('cliente_id', clienteId)
        .order('mes_referencia', { ascending: false });
      
      if (error) throw error;
      
      // Filtrar apenas planejamentos com status válido
      const validPlanejamentos = (data || []).filter(pl => 
        pl.status === 'aprovado_cliente' || 
        pl.status === 'em_producao' || 
        pl.status === 'em_revisao'
      );
      
      setPlanejamentos(validPlanejamentos);
    } catch (error) {
      console.error('Erro ao buscar planejamentos:', error);
    }
  };

  const gerarRoteiroBackground = async (tarefaId: string, briefingData: any) => {
    try {
      toast({
        title: "🎬 Gerando roteiro...",
        description: "Isso pode levar alguns segundos",
      });
      
      const { data: roteiroData, error } = await supabase.functions.invoke(
        'generate-roteiro-audiovisual',
        { body: { briefingData } }
      );
      
      if (!error && roteiroData?.success) {
        await supabase
          .from('tarefa')
          .update({
            kpis: {
              briefing: {
                ...briefingData,
                roteiro_audiovisual: roteiroData.roteiro
              }
            }
          })
          .eq('id', tarefaId);
        
        toast({
          title: "✨ Roteiro adicionado!",
          description: "Abra a tarefa para visualizar",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
    }
  };

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
      observacoes: '',
      ambiente: 'cidade',
      referencias_visuais: [],
      arquivos_complementares: [],
      capa_thumbnail: null
    });
    // Manter cliente/projeto se foram passados como props (modo "dentro do projeto")
    setSelectedProjeto(projetoId || '');
    setSelectedCliente(clienteId || '');
    setVinculadaPlanejamento(false);
    setSelectedPlanejamento('');
    setSelectedExecutor('');
    setActiveTab('basico');
  };

  const melhorarTextoComIA = async (campo: 'titulo' | 'descricao', tipo: 'ortografia' | 'melhorar') => {
    const textoAtual = formData[campo];
    if (!textoAtual?.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite algo primeiro para melhorar com IA",
        variant: "destructive"
      });
      return;
    }

    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: {
          prompt: tipo === 'ortografia' 
            ? `Corrija apenas erros de ortografia e gramática neste texto, mantendo o mesmo tom e estrutura: "${textoAtual}"`
            : `Melhore este ${campo === 'titulo' ? 'título' : 'descrição'} de forma criativa e profissional, mantendo a essência: "${textoAtual}"`,
          type: 'text'
        }
      });

      if (error) throw error;
      
      const textoMelhorado = data?.generatedText?.trim();
      if (textoMelhorado) {
        setFormData(prev => ({ ...prev, [campo]: textoMelhorado }));
        toast({
          title: "✨ Texto melhorado!",
          description: tipo === 'ortografia' ? "Erros corrigidos" : "Texto aprimorado com IA"
        });
      }
    } catch (error) {
      console.error('Erro ao melhorar texto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível melhorar o texto",
        variant: "destructive"
      });
    } finally {
      setLoadingAI(false);
    }
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

    if (!selectedCliente) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para a tarefa.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProjeto) {
      toast({
        title: "Projeto obrigatório",
        description: "Selecione um projeto para a tarefa.",
        variant: "destructive",
      });
      return;
    }

    // Validação de tipo de tarefa
    if (!tipoTarefaSelecionado) {
      toast({
        title: "Tipo de tarefa obrigatório",
        description: "Selecione o tipo da tarefa antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // 🛡️ VALIDAÇÃO FINAL
    if (!selectedCliente?.trim() || !selectedProjeto?.trim()) {
      toast({
        title: "❌ Dados inválidos",
        description: "Cliente e Projeto são obrigatórios",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Mapear setor_responsavel → executor_area_enum
      const mapearExecutorArea = (setor: string | null): string | null => {
        const mapeamento: Record<string, string> = {
          'audiovisual': 'Audiovisual',
          'design': 'Criativo',
          'grs': 'Criativo',
          'atendimento': 'Criativo'
        };
        return setor ? (mapeamento[setor] || null) : null;
      };

      // Buscar user_id do usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "❌ Erro de autenticação",
          description: "Não foi possível identificar o usuário logado.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Buscar nome do cliente para roteiro background
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', selectedCliente)
        .single();

      const taskData = {
        projeto_id: selectedProjeto,
        cliente_id: selectedCliente,
        titulo: formData.titulo,
        descricao: formData.descricao,
        executor_id: selectedExecutor || null,
        executor_area: mapearExecutorArea(formData.setor_responsavel),
        created_by: user.id,
        responsavel_id: user.id,
        prioridade: formData.prioridade,
        status: defaultStatus,
        prazo_executor: formData.data_prazo?.toISOString(),
        horas_estimadas: formData.horas_estimadas ? parseInt(formData.horas_estimadas) : null,
        origem: taskType,
        grs_action_id: vinculadaPlanejamento ? selectedPlanejamento : null,
        tipo: tipoTarefaSelecionado || 'outro',
        kpis: {
          briefing: {
            id_cartao: idCartao,
            objetivo_postagem: formData.objetivo_postagem,
            publico_alvo: formData.publico_alvo,
            formato_postagem: formData.formato_postagem,
            contexto_estrategico: formData.contexto_estrategico,
            call_to_action: formData.call_to_action,
            hashtags: formData.hashtags ? formData.hashtags.split(',').map((h: string) => h.trim()) : [],
            observacoes_gerais: formData.observacoes,
            roteiro_audiovisual: null
          },
          referencias: {
            visuais: formData.referencias_visuais || [],
            arquivos: formData.arquivos_complementares.map((a: any) => a.name) || []
          },
          metadados: {
            criado_via: 'modal_completo'
          }
        }
      };

      console.log('📋 Payload antes do sanitize:', taskData);
      console.log('👤 User ID:', user.id);
      console.log('🔐 Setor:', formData.setor_responsavel);
      console.log('🎯 Executor Area:', taskData.executor_area);

      const createdTask = await onTaskCreate(sanitizeTaskPayload(taskData));
      
      toast({
        title: "✅ Tarefa criada com sucesso!",
        description: `A tarefa "${formData.titulo}" foi adicionada ao projeto.`,
      });
      
      onOpenChange(false);
      setTimeout(() => resetForm(), 300);
      
      // Gerar roteiro em background (não bloqueia criação)
      const tiposAudiovisuais = ['criativo_vt', 'reels_instagram', 'stories_interativo', 'roteiro_reels'];
      if (tipoTarefaSelecionado && tiposAudiovisuais.includes(tipoTarefaSelecionado) && clienteData) {
        gerarRoteiroBackground(createdTask.id, {
          cliente_nome: clienteData.nome || 'Cliente',
          titulo: formData.titulo,
          objetivo: formData.objetivo_postagem || 'promocional',
          tom: 'profissional',
          veiculacao: ['digital'],
          mensagem_chave: formData.contexto_estrategico || formData.descricao,
          beneficios: [formData.call_to_action || 'Confira'],
          cta: formData.call_to_action || 'Saiba mais',
          ambiente: formData.ambiente || 'cidade',
        });
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao criar tarefa:', error);
      console.error('🔍 Detalhes do erro:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      toast({
        title: "❌ Erro ao criar tarefa",
        description: error?.message || error?.hint || "Não foi possível criar a tarefa. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentResponsible = (setor: string) => {
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
      <DialogContent size="2xl" height="xl" overflow="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Nova Tarefa</DialogTitle>
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basico">📋 Básico</TabsTrigger>
              <TabsTrigger value="briefing" disabled={taskType !== 'avulsa'}>📝 Briefing</TabsTrigger>
              <TabsTrigger value="referencias" disabled={taskType !== 'avulsa'}>🎨 Referências</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basico" className="space-y-6 mt-4">
              {/* Cliente e Projeto Selection */}
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select 
                value={selectedCliente} 
                onValueChange={(value) => {
                  setSelectedCliente(value);
                  setSelectedProjeto('');
                  setProjetos([]);
                }}
                disabled={!!clienteId}
              >
                <SelectTrigger className={cn(!selectedCliente && "border-destructive")}>
                  <SelectValue placeholder={clienteId ? "Cliente pré-selecionado" : "Selecione o cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projeto">Projeto *</Label>
              <Select 
                value={selectedProjeto} 
                onValueChange={setSelectedProjeto}
                disabled={!selectedCliente || !!projetoId}
              >
                <SelectTrigger className={cn(!selectedProjeto && selectedCliente && "border-destructive")}>
                  <SelectValue placeholder={
                    projetoId ? "Projeto pré-selecionado" :
                    selectedCliente ? "Selecione o projeto" : 
                    "Selecione um cliente primeiro"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map(projeto => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.titulo} - {projeto.data_prazo ? format(new Date(projeto.data_prazo), 'MMM/yyyy', { locale: ptBR }) : format(new Date(projeto.created_at), 'MMM/yyyy', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vinculação a Planejamento */}
          {taskType === 'avulsa' && selectedCliente && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Switch 
                id="vinculada"
                checked={vinculadaPlanejamento}
                onCheckedChange={setVinculadaPlanejamento}
              />
              <Label htmlFor="vinculada" className="cursor-pointer">
                Vincular a um planejamento mensal aprovado
              </Label>
            </div>
          )}

          {vinculadaPlanejamento && (
            <div className="space-y-2">
              <Label htmlFor="planejamento">Planejamento</Label>
              <Select value={selectedPlanejamento} onValueChange={setSelectedPlanejamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o planejamento" />
                </SelectTrigger>
                <SelectContent>
                  {planejamentos.map(pl => (
                    <SelectItem key={pl.id} value={pl.id}>
                      {pl.titulo} - {format(new Date(pl.mes_referencia), 'MMMM yyyy', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic Task Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Tarefa *</Label>
              <div className="flex gap-2">
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Post promocional Black Friday"
                  required
                  className={cn(!formData.titulo.trim() && "border-destructive")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => melhorarTextoComIA('titulo', 'ortografia')}
                  disabled={loadingAI || !formData.titulo.trim()}
                  title="Corrigir ortografia"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoTarefa">Tipo de Tarefa *</Label>
              <Select 
                value={tipoTarefaSelecionado} 
                onValueChange={(value: TipoTarefa) => {
                  setTipoTarefaSelecionado(value);
                  
                  // Auto-setar setor baseado no tipo
                  const setorAuto = value.includes('reel') || value.includes('vt') || value.includes('stories') 
                    ? 'audiovisual' 
                    : value.includes('card') || value.includes('carrossel') || value.includes('cartela') || value.includes('feed')
                    ? 'design'
                    : 'grs';
                  
                  if (!formData.setor_responsavel) {
                    setFormData({ ...formData, setor_responsavel: setorAuto });
                  }
                }}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  !tipoTarefaSelecionado && "border-destructive"
                )}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criativo_card">📱 Card Instagram/Facebook</SelectItem>
                  <SelectItem value="criativo_carrossel">🎠 Carrossel</SelectItem>
                  <SelectItem value="criativo_cartela">🎨 Cartela</SelectItem>
                  <SelectItem value="criativo_vt">🎬 VT (Vídeo Comercial)</SelectItem>
                  <SelectItem value="reels_instagram">📹 Reels Instagram</SelectItem>
                  <SelectItem value="stories_interativo">📲 Stories Interativo</SelectItem>
                  <SelectItem value="feed_post">📸 Feed Post</SelectItem>
                  <SelectItem value="roteiro_reels">📝 Roteiro Reels</SelectItem>
                  <SelectItem value="planejamento_estrategico">🎯 Planejamento Estratégico</SelectItem>
                  <SelectItem value="datas_comemorativas">📅 Datas Comemorativas</SelectItem>
                  <SelectItem value="trafego_pago">💰 Tráfego Pago</SelectItem>
                  <SelectItem value="outro">📋 Outro</SelectItem>
                </SelectContent>
              </Select>
              
              {/* ID do Cartão */}
              {idCartao && (
                <div className="text-xs text-muted-foreground mt-1">
                  ID do Cartão: <code className="bg-muted px-2 py-1 rounded font-mono">{idCartao}</code>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor Responsável *</Label>
              <Select 
                value={formData.setor_responsavel} 
                onValueChange={(value) => {
                  setFormData({ ...formData, setor_responsavel: value });
                  setSelectedExecutor(''); // Reset executor ao trocar setor
                }}
              >
                <SelectTrigger className={cn(!formData.setor_responsavel && "border-destructive")}>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design/Criativo</SelectItem>
                  <SelectItem value="audiovisual">Audiovisual</SelectItem>
                  <SelectItem value="grs">GRS/Estratégico</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Especialista Executor - Aparece após selecionar setor */}
            {formData.setor_responsavel && (
              <div className="space-y-2">
                <Label htmlFor="executor">
                  Especialista Executor {especialistasPorSetor.length === 0 && '(nenhum disponível)'}
                </Label>
                <Select 
                  value={selectedExecutor} 
                  onValueChange={setSelectedExecutor}
                  disabled={especialistasPorSetor.length === 0}
                >
                  <SelectTrigger className={cn(!selectedExecutor && "border-yellow-500")}>
                    <SelectValue placeholder={
                      especialistasPorSetor.length > 0 
                        ? "Selecione o executor (opcional)" 
                        : "Nenhum especialista disponível"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {especialistasPorSetor.map(esp => (
                      <SelectItem key={esp.id} value={esp.id}>
                        {esp.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedExecutor 
                    ? "✅ Tarefa será atribuída diretamente ao especialista" 
                    : "Se não selecionar, a tarefa ficará disponível para qualquer especialista do setor pegar"
                  }
                </p>
              </div>
            )}

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
            <div className="flex justify-between items-center">
              <Label htmlFor="descricao">Descrição Geral</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => melhorarTextoComIA('descricao', 'ortografia')}
                  disabled={loadingAI || !formData.descricao.trim()}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Corrigir
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => melhorarTextoComIA('descricao', 'melhorar')}
                  disabled={loadingAI || !formData.descricao.trim()}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Melhorar
                </Button>
              </div>
            </div>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva a tarefa de forma geral..."
              rows={3}
            />
          </div>
            </TabsContent>

            <TabsContent value="briefing" className="space-y-6 mt-4">
              {taskType === 'avulsa' && (
                <>
                  <AIBriefingGenerator
                    onGenerate={(briefing) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        titulo: briefing.titulo || prev.titulo,
                        descricao: briefing.descricao || prev.descricao,
                        objetivo_postagem: briefing.objetivo_postagem || prev.objetivo_postagem,
                        publico_alvo: briefing.publico_alvo || prev.publico_alvo,
                        contexto_estrategico: briefing.contexto_estrategico || prev.contexto_estrategico,
                        formato_postagem: briefing.formato_postagem || prev.formato_postagem,
                        call_to_action: briefing.call_to_action || prev.call_to_action
                      }));
                    }}
                    clienteId={selectedCliente}
                    planejamentoId={vinculadaPlanejamento ? selectedPlanejamento : undefined}
                    tipoTarefa={tipoTarefaSelecionado}
                  />
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ambiente">Ambiente da Captação</Label>
                      <Select
                        value={formData.ambiente}
                        onValueChange={(value) => setFormData({ ...formData, ambiente: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="praia">🏖️ Praia</SelectItem>
                          <SelectItem value="floresta">🌲 Floresta</SelectItem>
                          <SelectItem value="cidade">🏙️ Cidade</SelectItem>
                          <SelectItem value="escritorio">🏢 Escritório</SelectItem>
                          <SelectItem value="noturno">🌙 Noturno</SelectItem>
                          <SelectItem value="evento">🎉 Evento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <BriefingForm 
                      formData={formData}
                      setFormData={setFormData}
                      tipoTarefa={tipoTarefaSelecionado}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="referencias" className="space-y-6 mt-4">
              <TaskReferencesTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

          </Tabs>

          {vinculadaPlanejamento && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">📋 Tarefa Vinculada ao Planejamento</h3>
              <p className="text-sm text-blue-700">
                Esta tarefa está vinculada a um planejamento mensal e seguirá as diretrizes aprovadas pelo cliente.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || !formData.titulo || !selectedCliente || !selectedProjeto || !tipoTarefaSelecionado}
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
