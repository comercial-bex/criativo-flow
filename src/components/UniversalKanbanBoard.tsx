import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  MessageSquare,
  Paperclip,
  CheckSquare,
  MoreHorizontal,
  Eye,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos unificados
interface UniversalTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  anexos?: any[];
  comentarios?: any[];
  etiquetas?: string[];
  checklist?: any[];
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface UniversalColumn {
  id: string;
  titulo: string;
  cor: string;
  icon: string;
  tasks: UniversalTask[];
  ordem: number;
  descricao?: string;
}

interface UniversalKanbanProps {
  tasks: UniversalTask[];
  moduleColumns: UniversalColumn[];
  moduleType: 'grs' | 'design' | 'audiovisual' | 'crm' | 'lead' | 'geral';
  onTaskMove: (taskId: string, newStatus: string, observations?: string) => void;
  onTaskCreate: (status?: string) => void;
  onTaskClick: (task: UniversalTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<UniversalTask>) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  clienteId?: string;
  projetoId?: string;
}

// Configurações de colunas por módulo
export const moduleConfigurations = {
  grs: [
    { id: 'em_cadastro', titulo: 'EM CADASTRO', cor: 'bg-gray-500', icon: '📋', ordem: 1, descricao: 'Tarefas sendo organizadas' },
    { id: 'a_fazer', titulo: 'A FAZER', cor: 'bg-blue-500', icon: '📝', ordem: 2, descricao: 'Prontas para iniciar' },
    { id: 'em_andamento', titulo: 'EM ANDAMENTO', cor: 'bg-yellow-500', icon: '⚡', ordem: 3, descricao: 'Em execução' },
    { id: 'em_revisao', titulo: 'EM REVISÃO', cor: 'bg-purple-500', icon: '👀', ordem: 4, descricao: 'Aguardando revisão' },
    { id: 'em_analise', titulo: 'EM ANÁLISE', cor: 'bg-orange-500', icon: '🔍', ordem: 5, descricao: 'Em análise final' }
  ],
  design: [
    { id: 'briefing', titulo: 'BRIEFING', cor: 'bg-blue-500', icon: '📋', ordem: 1, descricao: 'Coletando requisitos' },
    { id: 'em_criacao', titulo: 'EM CRIAÇÃO', cor: 'bg-purple-500', icon: '🎨', ordem: 2, descricao: 'Processo criativo' },
    { id: 'revisao_interna', titulo: 'REVISÃO INTERNA', cor: 'bg-yellow-500', icon: '👀', ordem: 3, descricao: 'Revisão da equipe' },
    { id: 'aprovacao_cliente', titulo: 'APROVAÇÃO CLIENTE', cor: 'bg-orange-500', icon: '✅', ordem: 4, descricao: 'Aguardando cliente' },
    { id: 'entregue', titulo: 'ENTREGUE', cor: 'bg-green-500', icon: '🚀', ordem: 5, descricao: 'Finalizado' }
  ],
  audiovisual: [
    { id: 'roteiro', titulo: 'ROTEIRO', cor: 'bg-blue-500', icon: '📝', ordem: 1, descricao: 'Desenvolvimento do roteiro' },
    { id: 'pre_producao', titulo: 'PRÉ-PRODUÇÃO', cor: 'bg-purple-500', icon: '📋', ordem: 2, descricao: 'Planejamento da gravação' },
    { id: 'gravacao', titulo: 'GRAVAÇÃO', cor: 'bg-red-500', icon: '🎬', ordem: 3, descricao: 'Captação do material' },
    { id: 'pos_producao', titulo: 'PÓS-PRODUÇÃO', cor: 'bg-yellow-500', icon: '✂️', ordem: 4, descricao: 'Edição e finalização' },
    { id: 'entregue', titulo: 'ENTREGUE', cor: 'bg-green-500', icon: '🚀', ordem: 5, descricao: 'Produto final' }
  ],
  crm: [
    { id: 'novo', titulo: 'NOVO', cor: 'bg-blue-500', icon: '📱', ordem: 1, descricao: 'Primeiro contato' },
    { id: 'qualificado', titulo: 'QUALIFICADO', cor: 'bg-purple-500', icon: '✅', ordem: 2, descricao: 'Lead validado' },
    { id: 'proposta', titulo: 'PROPOSTA', cor: 'bg-yellow-500', icon: '📄', ordem: 3, descricao: 'Proposta enviada' },
    { id: 'negociacao', titulo: 'NEGOCIAÇÃO', cor: 'bg-orange-500', icon: '🤝', ordem: 4, descricao: 'Em negociação' },
    { id: 'fechado', titulo: 'FECHADO', cor: 'bg-green-500', icon: '💰', ordem: 5, descricao: 'Deal fechado' }
  ],
  lead: [
    { id: 'novo', titulo: 'NOVO', cor: 'bg-blue-500', icon: '📱', ordem: 1, descricao: 'Lead novo' },
    { id: 'contato', titulo: 'CONTATO', cor: 'bg-purple-500', icon: '📞', ordem: 2, descricao: 'Primeiro contato' },
    { id: 'qualificado', titulo: 'QUALIFICADO', cor: 'bg-yellow-500', icon: '✅', ordem: 3, descricao: 'Lead qualificado' },
    { id: 'oportunidade', titulo: 'OPORTUNIDADE', cor: 'bg-orange-500', icon: '💎', ordem: 4, descricao: 'Oportunidade real' },
    { id: 'convertido', titulo: 'CONVERTIDO', cor: 'bg-green-500', icon: '🎯', ordem: 5, descricao: 'Virou cliente' }
  ],
  geral: [
    { id: 'backlog', titulo: 'BACKLOG', cor: 'bg-gray-500', icon: '📋', ordem: 1, descricao: 'Lista de espera' },
    { id: 'a_fazer', titulo: 'A FAZER', cor: 'bg-blue-500', icon: '📝', ordem: 2, descricao: 'Prontas para iniciar' },
    { id: 'em_andamento', titulo: 'EM ANDAMENTO', cor: 'bg-yellow-500', icon: '⚡', ordem: 3, descricao: 'Em execução' },
    { id: 'concluido', titulo: 'CONCLUÍDO', cor: 'bg-green-500', icon: '✅', ordem: 4, descricao: 'Finalizadas' }
  ]
};

// Componente do card de tarefa
function UniversalTaskCard({ 
  task, 
  onTaskClick 
}: { 
  task: UniversalTask; 
  onTaskClick: (task: UniversalTask) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      case 'media': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300';
      default: return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300';
    }
  };

  const isOverdue = task.data_prazo && new Date(task.data_prazo) < new Date();
  const hasComments = task.comentarios && task.comentarios.length > 0;
  const hasAttachments = task.anexos && task.anexos.length > 0;
  const hasChecklist = task.checklist && task.checklist.length > 0;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mb-3 group ${isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-primary/20' : ''} ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
      onClick={() => onTaskClick(task)}
    >
      {/* Barra de prioridade superior */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${getPriorityColor(task.prioridade)}`} />
      
      <CardContent className="p-4 space-y-3">
        {/* Header com etiquetas */}
        {task.etiquetas && task.etiquetas.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.etiquetas.slice(0, 3).map((etiqueta, index) => (
              <div 
                key={index}
                className="h-2 w-8 rounded-full bg-gradient-to-r from-primary to-secondary"
              />
            ))}
          </div>
        )}

        {/* Título da tarefa */}
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">
            {task.titulo}
          </h4>
          {task.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.descricao}
            </p>
          )}
        </div>

        {/* Badges e indicadores */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs px-2 py-0.5 border ${getPriorityBadge(task.prioridade)}`}>
            {task.prioridade}
          </Badge>
          
          {task.setor_responsavel && (
            <Badge variant="outline" className="text-xs">
              {task.setor_responsavel}
            </Badge>
          )}
        </div>

        {/* Informações principais */}
        <div className="space-y-2">
          {/* Data de prazo */}
          {task.data_prazo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                {format(new Date(task.data_prazo), 'dd MMM', { locale: ptBR })}
              </span>
              {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
            </div>
          )}

          {/* Horas estimadas vs trabalhadas */}
          {task.horas_estimadas && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.horas_trabalhadas || 0}h / {task.horas_estimadas}h</span>
            </div>
          )}

          {/* Responsável */}
          {task.responsavel_nome && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {task.responsavel_nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {task.responsavel_nome.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Cliente */}
          {task.cliente_nome && (
            <div className="text-xs text-muted-foreground">
              📧 {task.cliente_nome}
            </div>
          )}
        </div>

        {/* Footer com ícones de atividade */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {hasComments && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comentarios?.length}</span>
              </div>
            )}
            
            {hasAttachments && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>{task.anexos?.length}</span>
              </div>
            )}
            
            {hasChecklist && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckSquare className="h-3 w-3" />
                <span>{task.checklist?.filter(item => item.completed).length}/{task.checklist?.length}</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente da coluna
function UniversalKanbanColumn({ 
  column, 
  onTaskCreate, 
  onTaskClick 
}: { 
  column: UniversalColumn; 
  onTaskCreate: (columnId: string) => void;
  onTaskClick: (task: UniversalTask) => void;
}) {
  return (
    <div className="flex-1 min-w-[300px] max-w-[350px]">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.cor}`} />
              <span className="text-xs uppercase tracking-wider">{column.titulo}</span>
              <Badge variant="secondary" className="ml-auto">
                {column.tasks.length}
              </Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onTaskCreate(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {column.descricao && (
            <p className="text-xs text-muted-foreground mt-1">{column.descricao}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <UniversalTaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick}
              />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">{column.icon}</div>
              <p className="text-sm mb-3">Nenhuma tarefa</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onTaskCreate(column.id)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal
export function UniversalKanbanBoard({ 
  tasks, 
  moduleColumns,
  moduleType,
  onTaskMove, 
  onTaskCreate, 
  onTaskClick,
  showFilters = true,
  showSearch = true 
}: UniversalKanbanProps) {
  const [activeTask, setActiveTask] = useState<UniversalTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponsavel, setSelectedResponsavel] = useState('all');
  const [selectedPrioridade, setSelectedPrioridade] = useState('all');

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesResponsavel = selectedResponsavel === 'all' || task.responsavel_id === selectedResponsavel;
      const matchesPrioridade = selectedPrioridade === 'all' || task.prioridade === selectedPrioridade;
      
      return matchesSearch && matchesResponsavel && matchesPrioridade;
    });
  }, [tasks, searchTerm, selectedResponsavel, selectedPrioridade]);

  // Organizar tarefas em colunas
  const columns: UniversalColumn[] = moduleColumns.map(col => ({
    ...col,
    tasks: filteredTasks.filter(task => task.status === col.id)
  })).sort((a, b) => a.ordem - b.ordem);

  // Obter responsáveis únicos
  const responsaveis = useMemo(() => {
    const unique = tasks
      .filter(task => task.responsavel_nome)
      .reduce((acc, task) => {
        if (!acc.find(r => r.id === task.responsavel_id)) {
          acc.push({
            id: task.responsavel_id!,
            nome: task.responsavel_nome!
          });
        }
        return acc;
      }, [] as Array<{id: string, nome: string}>);
    
    return unique;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Verificar se é uma coluna válida
    const validColumn = columns.find(col => col.id === newStatus);
    if (!validColumn) return;
    
    onTaskMove(taskId, newStatus);
    setActiveTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      {(showSearch || showFilters) && (
        <div className="flex items-center gap-4 flex-wrap">
          {showSearch && (
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas, clientes, descrições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {showFilters && (
            <>
              <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  {responsaveis.map(responsavel => (
                    <SelectItem key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPrioridade} onValueChange={setSelectedPrioridade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      )}

      {/* Board Kanban */}
      <DndContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {columns.map((column) => (
            <UniversalKanbanColumn
              key={column.id}
              column={column}
              onTaskCreate={onTaskCreate}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <UniversalTaskCard task={activeTask} onTaskClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}