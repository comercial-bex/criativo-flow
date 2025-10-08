// BEX 3.0 - Modal Padrão Unificado de Tarefas
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, Eye, Paperclip, Sparkles, Send, Copy, Archive, 
  Clock, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { getStatusPrazoClasses, getPrioridadeConfig, getStatusConfig } from '@/utils/tarefaUtils';
import { Tarefa, TipoTarefa } from '@/types/tarefa';
import { useTarefas } from '@/hooks/useTarefas';
import { TaskExecutorSelector } from '@/components/TaskExecutorSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StandardTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Tarefa | null;
  onUpdate?: (task: Tarefa) => void;
  profiles?: any[];
}

export function StandardTaskModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdate,
  profiles = []
}: StandardTaskModalProps) {
  const [isEditing, setIsEditing] = useState(!task?.id); // Auto-edit mode se nova tarefa
  const [activeTab, setActiveTab] = useState('resumo');
  const [formData, setFormData] = useState<any>({});
  const [anexos, setAnexos] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { updateTarefa, createTarefa } = useTarefas({ projetoId: task?.projeto_id });
  const { timeRemaining, status: statusPrazo, formattedTime, isUrgent } = useTaskTimer(task?.prazo_executor);

  useEffect(() => {
    if (task) {
      setFormData(task);
      if (task.id) {
        supabase
          .from('anexo')
          .select('*')
          .eq('tarefa_id', task.id)
          .then(({ data }) => setAnexos(data || []));
      }
    }
  }, [task]);

  if (!task) return null;

  const prioridadeConfig = getPrioridadeConfig(task.prioridade);
  const statusConfig = getStatusConfig(task.status);
  const prazoClasses = getStatusPrazoClasses(statusPrazo);

  const handleSave = async () => {
    if (task?.id) {
      await updateTarefa(task.id, formData);
      toast({ title: 'Tarefa atualizada com sucesso' });
      setIsEditing(false);
      if (onUpdate) onUpdate({ ...task, ...formData } as Tarefa);
    } else {
      // Criar nova tarefa
      const newTask = await createTarefa(formData);
      toast({ title: 'Tarefa criada com sucesso' });
      onClose();
    }
  };

  const handleVisualizarPreview = () => setActiveTab('preview');
  const handleAnexos = () => setActiveTab('anexos');
  
  const handleEnviarAprovacao = async () => {
    if (!task?.id) return;
    await supabase.from('aprovacao_tarefa').insert({
      tarefa_id: task.id,
      status_aprovacao: 'pendente'
    });
    toast({ title: 'Enviado para aprovação do cliente' });
  };

  const handleDuplicar = async () => {
    if (!task) return;
    const { id, created_at, updated_at, titulo, ...resto } = task;
    await createTarefa({
      ...resto,
      titulo: `${titulo} (cópia)`,
      status: 'backlog'
    });
    toast({ title: 'Tarefa duplicada' });
    onClose();
  };

  const handleArquivar = async () => {
    if (!task?.id) return;
    await updateTarefa(task.id, { status: 'cancelado' });
    toast({ title: 'Tarefa arquivada' });
    onClose();
  };

  const tipoLabels: Record<TipoTarefa, string> = {
    planejamento_estrategico: '📊 Planejamento Estratégico',
    roteiro_reels: '🎬 Roteiro Reels',
    criativo_card: '🖼️ Card Criativo',
    criativo_carrossel: '🎠 Carrossel',
    datas_comemorativas: '🎉 Data Comemorativa',
    trafego_pago: '📈 Tráfego Pago',
    contrato: '📄 Contrato',
    outro: '📋 Outro'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <Input 
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="text-xl font-semibold"
                />
              ) : (
                <h2 className="text-xl font-semibold">{task.titulo}</h2>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{tipoLabels[task.tipo]}</Badge>
                <Badge className={prioridadeConfig.badge}>
                  {prioridadeConfig.icon} {prioridadeConfig.label}
                </Badge>
                <Badge className={statusConfig.color}>
                  {statusConfig.icon} {statusConfig.label}
                </Badge>
              </div>
            </div>

            {task.prazo_executor && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                prazoClasses.bg
              )}>
                <Clock className={cn(
                  "h-4 w-4",
                  isUrgent && "animate-pulse"
                )} />
                <div className="flex flex-col">
                  <span className={cn("text-xs font-semibold", prazoClasses.text)}>
                    {statusPrazo === 'vermelho' && '🔴 VENCIDO'}
                    {statusPrazo === 'amarelo' && '🟡 ATENÇÃO'}
                    {statusPrazo === 'verde' && '🟢 NO PRAZO'}
                    {statusPrazo === 'cinza' && '⚪ SEM PRAZO'}
                  </span>
                  <span className={cn("font-mono text-sm", prazoClasses.text)}>
                    {formattedTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isUrgent && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                ⏰ URGENTE: Menos de 4 horas para o prazo!
              </span>
            </div>
          )}
        </DialogHeader>

        <Separator />

        {/* Barra de Ações */}
        <div className="px-6 py-3 bg-muted/50 flex items-center gap-2 overflow-x-auto">
          <Button size="sm" onClick={handleSave} disabled={!isEditing}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
          <Button size="sm" variant="outline" onClick={handleVisualizarPreview}>
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button size="sm" variant="outline" onClick={handleAnexos}>
            <Paperclip className="h-4 w-4" />
            Anexos ({anexos.length})
          </Button>
          <Button size="sm" variant="outline" disabled>
            <Sparkles className="h-4 w-4" />
            Gerar IA
          </Button>
          <Button size="sm" variant="outline" onClick={handleEnviarAprovacao}>
            <Send className="h-4 w-4" />
            Enviar Aprovação
          </Button>
          <Button size="sm" variant="outline" onClick={handleDuplicar}>
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
          <Button size="sm" variant="outline" onClick={handleArquivar}>
            <Archive className="h-4 w-4" />
            Arquivar
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="anexos">Anexos</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Tarefa</Label>
                  <p className="text-sm mt-1">{tipoLabels[task.tipo]}</p>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <p className="text-sm mt-1">{task.prioridade || 'média'}</p>
                </div>
              </div>

              <TaskExecutorSelector
                executorArea={formData.executor_area}
                executorId={formData.executor_id}
                prazoExecutor={formData.prazo_executor}
                onExecutorAreaChange={(area: any) => setFormData({ ...formData, executor_area: area, executor_id: null })}
                onExecutorIdChange={(id: any) => setFormData({ ...formData, executor_id: id })}
                onPrazoChange={(prazo: any) => setFormData({ ...formData, prazo_executor: prazo })}
                disabled={!isEditing}
              />

              <Separator />

              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Textarea 
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={4}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {task.descricao || 'Sem descrição'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label>Criado em</Label>
                  <p className="text-sm">{task.created_at ? new Date(task.created_at).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <Label>Atualizado em</Label>
                  <p className="text-sm">{task.updated_at ? new Date(task.updated_at).toLocaleString() : '-'}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conteudo" className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  Campos específicos para <strong>{tipoLabels[task.tipo]}</strong>
                </p>
              </div>
              
              {/* Roteiro Reels */}
              {task.tipo === 'roteiro_reels' && (
                <div className="space-y-4">
                  <div>
                    <Label>Objetivo do Reels</Label>
                    <Textarea 
                      value={formData.objetivo || ''}
                      onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                      placeholder="Ex: Aumentar engajamento, educar audiência..."
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Formato</Label>
                      <Select
                        value={formData.formato || ''}
                        onValueChange={(v) => setFormData({ ...formData, formato: v })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15s">15 segundos</SelectItem>
                          <SelectItem value="30s">30 segundos</SelectItem>
                          <SelectItem value="60s">60 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duração (seg)</Label>
                      <Input 
                        type="number" 
                        value={formData.duracao || ''}
                        onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Tom de Voz</Label>
                    <Input 
                      value={formData.tom_voz || ''}
                      onChange={(e) => setFormData({ ...formData, tom_voz: e.target.value })}
                      placeholder="Ex: Casual, profissional, humorístico..."
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Referências</Label>
                    <Textarea 
                      value={formData.referencias || ''}
                      onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                      placeholder="Links de vídeos inspiração..."
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea 
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={2}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              {/* Criativo Card / Carrossel */}
              {(task.tipo === 'criativo_card' || task.tipo === 'criativo_carrossel') && (
                <div className="space-y-4">
                  <div>
                    <Label>Objetivo</Label>
                    <Textarea 
                      value={formData.objetivo || ''}
                      onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                      placeholder="Objetivo principal da arte..."
                      rows={2}
                      disabled={!isEditing}
                    />
                  </div>
                  {task.tipo === 'criativo_carrossel' && (
                    <div>
                      <Label>Número de Slides</Label>
                      <Input 
                        type="number" 
                        min="2"
                        max="10"
                        value={formData.num_slides || 5}
                        onChange={(e) => setFormData({ ...formData, num_slides: parseInt(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Público-Alvo</Label>
                    <Input 
                      value={formData.publico_alvo || ''}
                      onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
                      placeholder="Ex: Jovens 18-25, empresários, mães..."
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Mensagem-Chave</Label>
                    <Textarea 
                      value={formData.mensagem_chave || ''}
                      onChange={(e) => setFormData({ ...formData, mensagem_chave: e.target.value })}
                      placeholder="Principal mensagem..."
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dimensões</Label>
                      <Input 
                        value={formData.dimensoes || '1080x1080'}
                        onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
                        placeholder="Ex: 1080x1080"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>{task.tipo === 'criativo_carrossel' ? 'Cores Sugeridas' : 'Cores'}</Label>
                      <Input 
                        value={formData.cores || ''}
                        onChange={(e) => setFormData({ ...formData, cores: e.target.value })}
                        placeholder="Ex: #FF5733, #C70039"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea 
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={2}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              {/* Planejamento Estratégico */}
            {task.tipo === 'planejamento_estrategico' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Período Início</Label>
                    <Input 
                      type="date"
                      value={formData.periodo_inicio || ''}
                      onChange={(e) => setFormData({ ...formData, periodo_inicio: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Período Fim</Label>
                    <Input 
                      type="date"
                      value={formData.periodo_fim || ''}
                      onChange={(e) => setFormData({ ...formData, periodo_fim: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>Objetivos Estratégicos</Label>
                  <Textarea 
                    value={formData.objetivos || ''}
                    onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                    placeholder="Descreva os principais objetivos estratégicos..."
                    rows={4}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>KPIs (Indicadores-Chave)</Label>
                  <Textarea 
                    value={formData.kpis || ''}
                    onChange={(e) => setFormData({ ...formData, kpis: e.target.value })}
                    placeholder="Ex: Aumentar engajamento em 20%, 1000 novos seguidores..."
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Canais de Divulgação</Label>
                  <Input 
                    value={formData.canais || ''}
                    onChange={(e) => setFormData({ ...formData, canais: e.target.value })}
                    placeholder="Ex: Instagram, Facebook, LinkedIn, Google Ads..."
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Orçamento Estimado (R$)</Label>
                  <Input 
                    type="number"
                    value={formData.orcamento || ''}
                    onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}

            {/* Datas Comemorativas */}
            {task.tipo === 'datas_comemorativas' && (
              <div className="space-y-4">
                <div>
                  <Label>Data Comemorativa</Label>
                  <Input 
                    value={formData.data_comemorativa || ''}
                    onChange={(e) => setFormData({ ...formData, data_comemorativa: e.target.value })}
                    placeholder="Ex: Dia das Mães, Natal, Black Friday..."
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data do Evento</Label>
                    <Input 
                      type="date"
                      value={formData.data_evento || ''}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Formato da Campanha</Label>
                    <Select
                      value={formData.formato_campanha || ''}
                      onValueChange={(v) => setFormData({ ...formData, formato_campanha: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post_simples">Post Simples</SelectItem>
                        <SelectItem value="carrossel">Carrossel</SelectItem>
                        <SelectItem value="reels">Reels</SelectItem>
                        <SelectItem value="stories">Stories</SelectItem>
                        <SelectItem value="campanha_completa">Campanha Completa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Mensagem Principal</Label>
                  <Textarea 
                    value={formData.mensagem_principal || ''}
                    onChange={(e) => setFormData({ ...formData, mensagem_principal: e.target.value })}
                    placeholder="Mensagem a ser comunicada..."
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Call to Action (CTA)</Label>
                  <Input 
                    value={formData.cta || ''}
                    onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                    placeholder="Ex: Compre agora, Saiba mais, Garanta o seu..."
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}

            {/* Tráfego Pago */}
            {task.tipo === 'trafego_pago' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plataforma</Label>
                    <Select
                      value={formData.plataforma || ''}
                      onValueChange={(v) => setFormData({ ...formData, plataforma: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="meta_ads">Meta Ads (Facebook/Instagram)</SelectItem>
                        <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
                        <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
                        <SelectItem value="youtube_ads">YouTube Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de Campanha</Label>
                    <Select
                      value={formData.tipo_campanha || ''}
                      onValueChange={(v) => setFormData({ ...formData, tipo_campanha: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                        <SelectItem value="trafego">Tráfego</SelectItem>
                        <SelectItem value="engajamento">Engajamento</SelectItem>
                        <SelectItem value="conversao">Conversão</SelectItem>
                        <SelectItem value="leads">Geração de Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Orçamento Diário (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.orcamento_diario || ''}
                      onChange={(e) => setFormData({ ...formData, orcamento_diario: e.target.value })}
                      placeholder="Ex: 50.00"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Orçamento Total (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.orcamento_total || ''}
                      onChange={(e) => setFormData({ ...formData, orcamento_total: e.target.value })}
                      placeholder="Ex: 1500.00"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>Público-Alvo</Label>
                  <Textarea 
                    value={formData.publico_alvo || ''}
                    onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
                    placeholder="Descrição do público (idade, localização, interesses...)"
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Palavras-Chave / Segmentação</Label>
                  <Textarea 
                    value={formData.palavras_chave || ''}
                    onChange={(e) => setFormData({ ...formData, palavras_chave: e.target.value })}
                    placeholder="Palavras-chave ou critérios de segmentação..."
                    rows={2}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Objetivo da Campanha</Label>
                  <Textarea 
                    value={formData.objetivo_campanha || ''}
                    onChange={(e) => setFormData({ ...formData, objetivo_campanha: e.target.value })}
                    placeholder="Ex: Aumentar vendas em 30%, gerar 100 leads qualificados..."
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}

            {/* Contrato */}
            {task.tipo === 'contrato' && (
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={formData.tipo_contrato || ''}
                    onValueChange={(v) => setFormData({ ...formData, tipo_contrato: v })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prestacao_servico">Prestação de Serviço</SelectItem>
                      <SelectItem value="assinatura">Assinatura/Recorrente</SelectItem>
                      <SelectItem value="projeto">Projeto Único</SelectItem>
                      <SelectItem value="parceria">Parceria</SelectItem>
                      <SelectItem value="confidencialidade">Confidencialidade (NDA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Início</Label>
                    <Input 
                      type="date"
                      value={formData.data_inicio_contrato || ''}
                      onChange={(e) => setFormData({ ...formData, data_inicio_contrato: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Data de Término</Label>
                    <Input 
                      type="date"
                      value={formData.data_fim_contrato || ''}
                      onChange={(e) => setFormData({ ...formData, data_fim_contrato: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Mensal (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.valor_mensal || ''}
                      onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                      placeholder="Ex: 5000.00"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Valor Total (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.valor_total || ''}
                      onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                      placeholder="Ex: 60000.00"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label>Escopo do Contrato</Label>
                  <Textarea 
                    value={formData.escopo_contrato || ''}
                    onChange={(e) => setFormData({ ...formData, escopo_contrato: e.target.value })}
                    placeholder="Descrição detalhada dos serviços/produtos inclusos..."
                    rows={4}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Condições Comerciais</Label>
                  <Textarea 
                    value={formData.condicoes_comerciais || ''}
                    onChange={(e) => setFormData({ ...formData, condicoes_comerciais: e.target.value })}
                    placeholder="Forma de pagamento, reajustes, rescisão..."
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}

              {/* Datas Comemorativas */}
              {task.tipo === 'datas_comemorativas' && (
                <div className="space-y-4">
                  <div>
                    <Label>Data Comemorativa</Label>
                    <Input 
                      type="date"
                      value={formData.data_comemorativa || ''}
                      onChange={(e) => setFormData({ ...formData, data_comemorativa: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Tema</Label>
                    <Input 
                      value={formData.tema || ''}
                      onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                      placeholder="Ex: Dia das Mães, Black Friday..."
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Contexto</Label>
                    <Textarea 
                      value={formData.contexto || ''}
                      onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              {/* Tráfego Pago */}
              {task.tipo === 'trafego_pago' && (
                <div className="space-y-4">
                  <div>
                    <Label>Plataforma</Label>
                    <Select
                      value={formData.plataforma_ads || ''}
                      onValueChange={(v) => setFormData({ ...formData, plataforma_ads: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook Ads</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="instagram">Instagram Ads</SelectItem>
                        <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Orçamento Diário (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.orcamento_diario || ''}
                      onChange={(e) => setFormData({ ...formData, orcamento_diario: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Objetivo da Campanha</Label>
                    <Textarea 
                      value={formData.objetivo_campanha || ''}
                      onChange={(e) => setFormData({ ...formData, objetivo_campanha: e.target.value })}
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              {/* Contrato */}
              {task.tipo === 'contrato' && (
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Contrato</Label>
                    <Input 
                      value={formData.tipo_contrato || ''}
                      onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })}
                      placeholder="Ex: Prestação de Serviços, Parceria..."
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Partes Envolvidas</Label>
                    <Textarea 
                      value={formData.partes_contrato || ''}
                      onChange={(e) => setFormData({ ...formData, partes_contrato: e.target.value })}
                      rows={2}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vigência Início</Label>
                      <Input 
                        type="date"
                        value={formData.vigencia_inicio || ''}
                        onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Vigência Fim</Label>
                      <Input 
                        type="date"
                        value={formData.vigencia_fim || ''}
                        onChange={(e) => setFormData({ ...formData, vigencia_fim: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="anexos" className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                {anexos.length === 0 ? 'Nenhum anexo ainda' : `${anexos.length} anexo(s)`}
              </p>
            </TabsContent>

            <TabsContent value="preview" className="py-4">
              <div className="border rounded-lg p-8 bg-muted/20 min-h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Preview será exibido aqui</p>
              </div>
            </TabsContent>

            <TabsContent value="aprovacao" className="space-y-4 py-4">
              <p className="text-sm">Sistema de aprovação em desenvolvimento</p>
            </TabsContent>

            <TabsContent value="historico" className="py-4">
              <p className="text-sm text-muted-foreground">Histórico de alterações</p>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="px-6 py-3 border-t flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar Edição' : 'Editar'}
          </Button>
          <span className="text-xs text-muted-foreground">
            Última atualização: {task.updated_at ? new Date(task.updated_at).toLocaleString() : '-'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
