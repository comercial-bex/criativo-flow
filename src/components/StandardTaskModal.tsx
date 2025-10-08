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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Save, Eye, Paperclip, Sparkles, Send, Copy, Archive, 
  Clock, User, Calendar, Tag, AlertCircle, CheckCircle2,
  FileText, MessageSquare, History, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { getStatusPrazoClasses, getPrioridadeConfig, getStatusConfig } from '@/utils/tarefaUtils';
import { Tarefa, TipoTarefa, StatusTarefa, PrioridadeTarefa } from '@/types/tarefa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StandardTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Tarefa | null;
  onUpdate?: (taskId: string, updates: Partial<Tarefa>) => void;
  profiles?: any[];
}

export function StandardTaskModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdate,
  profiles = []
}: StandardTaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [formData, setFormData] = useState<Partial<Tarefa>>({});
  
  const { timeRemaining, status: statusPrazo, formattedTime, isUrgent } = useTaskTimer(task?.prazo_executor);

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  if (!task) return null;

  const prioridadeConfig = getPrioridadeConfig(task.prioridade);
  const statusConfig = getStatusConfig(task.status);
  const prazoClasses = getStatusPrazoClasses(statusPrazo);

  const handleSave = () => {
    if (onUpdate && task.id) {
      onUpdate(task.id, formData);
      setIsEditing(false);
    }
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
        {/* Header com Título e Metadados */}
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
                
                {task.prazo_executor && (
                  <Badge className={cn("font-mono", prazoClasses.badge)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {formattedTime}
                  </Badge>
                )}
              </div>
            </div>

            {task.executor_id && (
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>EX</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Executor</div>
                    <div className="text-xs">{task.executor_area}</div>
                  </div>
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
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button size="sm" variant="outline">
            <Paperclip className="h-4 w-4 mr-2" />
            Anexos
          </Button>
          <Button size="sm" variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Gerar com IA
          </Button>
          <Button size="sm" variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Enviar Aprovação
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="ghost">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button size="sm" variant="ghost">
            <Archive className="h-4 w-4 mr-2" />
            Arquivar
          </Button>
        </div>

        <Separator />

        {/* Conteúdo com Abas */}
        <ScrollArea className="flex-1 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="resumo" className="gap-2">
                <FileText className="h-4 w-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="conteudo" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="anexos" className="gap-2">
                <Paperclip className="h-4 w-4" />
                Anexos
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="aprovacao" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Aprovação
              </TabsTrigger>
              <TabsTrigger value="historico" className="gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Aba Resumo */}
            <TabsContent value="resumo" className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de Tarefa</Label>
                    <p className="text-sm font-medium">{tipoLabels[task.tipo]}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Responsável</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>R</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Responsável Geral</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Executor</Label>
                    {task.executor_area && task.executor_id ? (
                      <div className="space-y-2 mt-1">
                        <Badge variant="outline">{task.executor_area}</Badge>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>E</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">Nome do Executor</span>
                        </div>
                        {task.prazo_executor && (
                          <div className={cn("flex items-center gap-2 text-sm", prazoClasses.text)}>
                            <Clock className="h-4 w-4" />
                            Prazo: {format(new Date(task.prazo_executor), 'PPp', { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Não atribuído</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Data Entrega</Label>
                    <p className="text-sm">
                      {task.data_entrega_prevista 
                        ? format(new Date(task.data_entrega_prevista), 'PPP', { locale: ptBR })
                        : 'Não definida'
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Data Publicação</Label>
                    <p className="text-sm">
                      {task.data_publicacao 
                        ? format(new Date(task.data_publicacao), 'PPP', { locale: ptBR })
                        : 'Não agendada'
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Canais</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.canais?.map((canal) => (
                        <Badge key={canal} variant="secondary" className="text-xs">
                          {canal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Público-Alvo</Label>
                  <p className="text-sm mt-1">{task.publico_alvo || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tom de Voz</Label>
                  <p className="text-sm mt-1">{task.tom_voz || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CTA</Label>
                  <p className="text-sm mt-1">{task.cta || '-'}</p>
                </div>
              </div>
            </TabsContent>

            {/* Aba Conteúdo - Campos condicionais por tipo */}
            <TabsContent value="conteudo" className="space-y-6 py-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Campos específicos para <strong>{tipoLabels[task.tipo]}</strong>
                </p>
              </div>
              
              {task.tipo === 'roteiro_reels' && (
                <div className="space-y-4">
                  <div>
                    <Label>Roteiro</Label>
                    <Textarea rows={6} placeholder="Escreva o roteiro aqui..." />
                  </div>
                  <div>
                    <Label>Duração</Label>
                    <Input placeholder="Ex: 30 segundos" />
                  </div>
                </div>
              )}

              {(task.tipo === 'criativo_card' || task.tipo === 'criativo_carrossel') && (
                <div className="space-y-4">
                  <div>
                    <Label>Texto Principal</Label>
                    <Textarea rows={3} placeholder="Headline/título principal" />
                  </div>
                  <div>
                    <Label>Texto Secundário</Label>
                    <Textarea rows={2} placeholder="Descrição ou subtítulo" />
                  </div>
                  <div>
                    <Label>Cores</Label>
                    <Input placeholder="Ex: #FF5733, #33FF57" />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Aba Anexos */}
            <TabsContent value="anexos" className="space-y-4 py-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos aqui ou clique para fazer upload
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Selecionar Arquivos
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Anexos Existentes</Label>
                <p className="text-sm text-muted-foreground">Nenhum anexo ainda</p>
              </div>
            </TabsContent>

            {/* Aba Preview */}
            <TabsContent value="preview" className="py-6">
              <div className="border rounded-lg p-8 bg-muted/20 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Preview será exibido aqui</p>
                </div>
              </div>
            </TabsContent>

            {/* Aba Aprovação */}
            <TabsContent value="aprovacao" className="space-y-4 py-6">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Status de aprovação: <strong>Pendente</strong>
                </p>
              </div>

              <div>
                <Label>Comentários de Aprovação</Label>
                <Textarea rows={4} placeholder="Adicione comentários sobre a aprovação..." className="mt-2" />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="default">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button className="flex-1" variant="outline">
                  Solicitar Ajustes
                </Button>
                <Button className="flex-1" variant="destructive">
                  Reprovar
                </Button>
              </div>
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="historico" className="py-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Usuário</span>
                      <span className="text-xs text-muted-foreground">
                        {task.created_at && format(new Date(task.created_at), 'PPp', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Tarefa criada</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer com Toggle Edição */}
        <div className="px-6 py-3 border-t flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar Edição' : 'Editar Tarefa'}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Última atualização: {task.updated_at && format(new Date(task.updated_at), 'PPp', { locale: ptBR })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
