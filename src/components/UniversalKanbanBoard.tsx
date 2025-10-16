import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { ModernKanbanCard, type KanbanTask } from './ModernKanbanCard';

// Tipos unificados
interface UniversalTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  prazo_executor?: string;
  prazo_conclusao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  executor_id?: string;
  executor_nome?: string;
  executor_area?: string;
  area?: string[];
  horas_trabalhadas?: number;
  horas_estimadas?: number;
  anexos?: any[];
  comentarios?: any[];
  comentarios_count?: number;
  anexos_count?: number;
  etiquetas?: string[];
  checklist?: any[];
  checklist_items?: number;
  checklist_completed?: number;
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  created_at?: string;
  updated_at?: string;
  capa_anexo_id?: string | null;
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
  moduleColumns?: UniversalColumn[];
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
  grs: [{
    id: 'em_cadastro',
    titulo: 'EM CADASTRO',
    cor: 'bg-gray-500',
    icon: '📋',
    ordem: 1,
    descricao: 'Tarefas sendo organizadas'
  }, {
    id: 'a_fazer',
    titulo: 'A FAZER',
    cor: 'bg-blue-500',
    icon: '📝',
    ordem: 2,
    descricao: 'Prontas para iniciar'
  }, {
    id: 'em_andamento',
    titulo: 'EM ANDAMENTO',
    cor: 'bg-yellow-500',
    icon: '⚡',
    ordem: 3,
    descricao: 'Em execução'
  }, {
    id: 'em_revisao',
    titulo: 'EM REVISÃO',
    cor: 'bg-purple-500',
    icon: '👀',
    ordem: 4,
    descricao: 'Aguardando revisão'
  }, {
    id: 'em_analise',
    titulo: 'EM ANÁLISE',
    cor: 'bg-orange-500',
    icon: '🔍',
    ordem: 5,
    descricao: 'Em análise final'
  }],
  design: [{
    id: 'briefing',
    titulo: 'BRIEFING',
    cor: 'bg-blue-500',
    icon: '📋',
    ordem: 1,
    descricao: 'Coletando requisitos'
  }, {
    id: 'em_criacao',
    titulo: 'EM CRIAÇÃO',
    cor: 'bg-purple-500',
    icon: '🎨',
    ordem: 2,
    descricao: 'Processo criativo'
  }, {
    id: 'revisao_interna',
    titulo: 'REVISÃO INTERNA',
    cor: 'bg-yellow-500',
    icon: '👀',
    ordem: 3,
    descricao: 'Revisão da equipe'
  }, {
    id: 'aprovacao_cliente',
    titulo: 'APROVAÇÃO CLIENTE',
    cor: 'bg-orange-500',
    icon: '✅',
    ordem: 4,
    descricao: 'Aguardando cliente'
  }, {
    id: 'entregue',
    titulo: 'ENTREGUE',
    cor: 'bg-green-500',
    icon: '🚀',
    ordem: 5,
    descricao: 'Finalizado'
  }],
  audiovisual: [{
    id: 'roteiro',
    titulo: 'ROTEIRO',
    cor: 'bg-blue-500',
    icon: '📝',
    ordem: 1,
    descricao: 'Desenvolvimento do roteiro'
  }, {
    id: 'pre_producao',
    titulo: 'PRÉ-PRODUÇÃO',
    cor: 'bg-purple-500',
    icon: '📋',
    ordem: 2,
    descricao: 'Planejamento da gravação'
  }, {
    id: 'gravacao',
    titulo: 'GRAVAÇÃO',
    cor: 'bg-red-500',
    icon: '🎬',
    ordem: 3,
    descricao: 'Captação do material'
  }, {
    id: 'pos_producao',
    titulo: 'PÓS-PRODUÇÃO',
    cor: 'bg-yellow-500',
    icon: '✂️',
    ordem: 4,
    descricao: 'Edição e finalização'
  }, {
    id: 'entregue',
    titulo: 'ENTREGUE',
    cor: 'bg-green-500',
    icon: '🚀',
    ordem: 5,
    descricao: 'Produto final'
  }],
  crm: [{
    id: 'novo',
    titulo: 'NOVO',
    cor: 'bg-blue-500',
    icon: '📱',
    ordem: 1,
    descricao: 'Primeiro contato'
  }, {
    id: 'qualificado',
    titulo: 'QUALIFICADO',
    cor: 'bg-purple-500',
    icon: '✅',
    ordem: 2,
    descricao: 'Lead validado'
  }, {
    id: 'proposta',
    titulo: 'PROPOSTA',
    cor: 'bg-yellow-500',
    icon: '📄',
    ordem: 3,
    descricao: 'Proposta enviada'
  }, {
    id: 'negociacao',
    titulo: 'NEGOCIAÇÃO',
    cor: 'bg-orange-500',
    icon: '🤝',
    ordem: 4,
    descricao: 'Em negociação'
  }, {
    id: 'fechado',
    titulo: 'FECHADO',
    cor: 'bg-green-500',
    icon: '💰',
    ordem: 5,
    descricao: 'Deal fechado'
  }],
  lead: [{
    id: 'novo',
    titulo: 'NOVO',
    cor: 'bg-blue-500',
    icon: '📱',
    ordem: 1,
    descricao: 'Lead novo'
  }, {
    id: 'contato',
    titulo: 'CONTATO',
    cor: 'bg-purple-500',
    icon: '📞',
    ordem: 2,
    descricao: 'Primeiro contato'
  }, {
    id: 'qualificado',
    titulo: 'QUALIFICADO',
    cor: 'bg-yellow-500',
    icon: '✅',
    ordem: 3,
    descricao: 'Lead qualificado'
  }, {
    id: 'oportunidade',
    titulo: 'OPORTUNIDADE',
    cor: 'bg-orange-500',
    icon: '💎',
    ordem: 4,
    descricao: 'Oportunidade real'
  }, {
    id: 'convertido',
    titulo: 'CONVERTIDO',
    cor: 'bg-green-500',
    icon: '🎯',
    ordem: 5,
    descricao: 'Virou cliente'
  }],
  geral: [{
    id: 'backlog',
    titulo: 'BACKLOG',
    cor: 'bg-gray-500',
    icon: '📋',
    ordem: 1,
    descricao: 'Lista de espera'
  }, {
    id: 'a_fazer',
    titulo: 'A FAZER',
    cor: 'bg-blue-500',
    icon: '📝',
    ordem: 2,
    descricao: 'Prontas para iniciar'
  }, {
    id: 'em_andamento',
    titulo: 'EM ANDAMENTO',
    cor: 'bg-yellow-500',
    icon: '⚡',
    ordem: 3,
    descricao: 'Em execução'
  }, {
    id: 'concluido',
    titulo: 'CONCLUÍDO',
    cor: 'bg-green-500',
    icon: '✅',
    ordem: 4,
    descricao: 'Finalizadas'
  }]
};

// Normalização de status - mapeia status genéricos para específicos do módulo
const normalizeStatus = (
  status: string, 
  moduleType: 'grs' | 'design' | 'audiovisual' | 'crm' | 'lead' | 'geral'
): string | null => {
  // Mapeamentos por módulo
  const mappings: Record<string, Record<string, string>> = {
    design: {
      'backlog': 'briefing',
      'a_fazer': 'briefing',
      'em_cadastro': 'briefing',
      'em_andamento': 'em_criacao',
      'em_revisao': 'revisao_interna',
      'em_analise': 'aprovacao_cliente',
      'concluido': 'entregue',
      'entregue': 'entregue',
      // Status já corretos passam direto
      'briefing': 'briefing',
      'em_criacao': 'em_criacao',
      'revisao_interna': 'revisao_interna',
      'aprovacao_cliente': 'aprovacao_cliente'
    },
    audiovisual: {
      'backlog': 'roteiro',
      'a_fazer': 'roteiro',
      'em_cadastro': 'roteiro',
      'em_andamento': 'pos_producao',
      'concluido': 'entregue',
      'entregue': 'entregue',
      // Status já corretos passam direto
      'roteiro': 'roteiro',
      'pre_producao': 'pre_producao',
      'gravacao': 'gravacao',
      'pos_producao': 'pos_producao'
    },
    grs: {
      // GRS mantém status genéricos
      'backlog': 'em_cadastro',
      'concluido': 'em_analise',
      'entregue': 'em_analise'
    }
  };

  const moduleMapping = mappings[moduleType];
  if (!moduleMapping) {
    // Para módulos sem mapeamento, retorna o status original se existir nas colunas
    return status;
  }

  return moduleMapping[status] || null;
};

// Helper para converter UniversalTask em KanbanTask
const convertToKanbanTask = (task: UniversalTask): KanbanTask => ({
  id: task.id,
  titulo: task.titulo,
  descricao: task.descricao,
  status: task.status,
  prioridade: task.prioridade,
  data_prazo: task.data_prazo,
  prazo_executor: task.prazo_executor,
  prazo_conclusao: task.prazo_conclusao,
  responsavel_nome: task.responsavel_nome,
  executor_nome: task.executor_nome,
  cliente_nome: task.cliente_nome,
  horas_trabalhadas: task.horas_trabalhadas,
  horas_estimadas: task.horas_estimadas,
  comentarios_count: task.comentarios_count || task.comentarios?.length || 0,
  anexos_count: task.anexos_count || task.anexos?.length || 0,
  checklist_items: task.checklist_items || task.checklist?.length || 0,
  checklist_completed: task.checklist_completed || task.checklist?.filter((item: any) => item.completed).length || 0,
  etiquetas: task.etiquetas,
  capa_anexo_id: task.capa_anexo_id || null,
  area: task.area || (task.executor_area ? [task.executor_area] : [])
});

// Componente da coluna
function UniversalKanbanColumn({
  column,
  onTaskCreate,
  onTaskClick,
  moduleColumns,
  onTaskMove
}: {
  column: UniversalColumn;
  onTaskCreate: (columnId: string) => void;
  onTaskClick: (task: UniversalTask) => void;
  moduleColumns: UniversalColumn[];
  onTaskMove: (taskId: string, newStatus: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return <div className="flex-1 min-w-[300px] max-w-[350px]">
      <Card className={`h-full transition-all ${isOver ? 'ring-2 ring-bex shadow-bex-glow' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.cor}`} />
              <span className="text-xs uppercase tracking-wider">{column.titulo}</span>
              <Badge variant="secondary" className="ml-auto">
                {column.tasks.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onTaskCreate(column.id)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {column.descricao && <p className="text-xs text-muted-foreground mt-1">{column.descricao}</p>}
        </CardHeader>
        
        <CardContent 
          ref={setNodeRef}
          className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto"
        >
          <SortableContext 
            id={column.id}
            items={column.tasks.map(task => task.id)} 
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Solte aqui</p>
              </div>
            ) : (
              column.tasks.map(task => (
                <ModernKanbanCard 
                  key={task.id} 
                  task={convertToKanbanTask(task)} 
                  onTaskClick={() => onTaskClick(task)}
                  isDragging={false}
                  quickMoveColumns={moduleColumns.map(c => ({ id: c.id, titulo: c.titulo }))}
                  onQuickMove={(taskId, statusId) => onTaskMove(taskId, statusId)}
                  currentStatus={task.status}
                />
              ))
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>;
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

  // Sensors para drag & drop com delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 220,
        tolerance: 6,
      },
    })
  );

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || task.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || task.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesResponsavel = selectedResponsavel === 'all' || task.responsavel_id === selectedResponsavel;
      const matchesPrioridade = selectedPrioridade === 'all' || task.prioridade === selectedPrioridade;
      return matchesSearch && matchesResponsavel && matchesPrioridade;
    });
  }, [tasks, searchTerm, selectedResponsavel, selectedPrioridade]);

  // Organizar tarefas em colunas
  // Usar configuração padrão se moduleColumns estiver vazio ou não fornecido
  const activeColumns = (moduleColumns && moduleColumns.length > 0)
    ? moduleColumns 
    : moduleConfigurations[moduleType] || [];

  // Mapear tarefas para colunas usando normalização de status
  const columns: UniversalColumn[] = activeColumns.map(col => ({
    ...col,
    tasks: filteredTasks.filter(task => {
      const normalized = normalizeStatus(task.status, moduleType);
      return normalized === col.id || task.status === col.id;
    })
  })).sort((a, b) => a.ordem - b.ordem);

  // Identificar tarefas sem mapeamento (para coluna "Outros")
  const unmappedTasks = filteredTasks.filter(task => {
    const normalized = normalizeStatus(task.status, moduleType);
    const hasColumn = activeColumns.some(col => col.id === task.status || normalized === col.id);
    return !hasColumn && normalized === null;
  });

  // Adicionar coluna "Outros" se houver tarefas não mapeadas
  if (unmappedTasks.length > 0) {
    columns.push({
      id: 'outros',
      titulo: 'OUTROS',
      cor: 'bg-gray-500',
      icon: '📦',
      ordem: 999,
      descricao: 'Status fora do fluxo',
      tasks: unmappedTasks
    });
  }

  // Debug: log de distribuição de tarefas
  console.log(`[Kanban ${moduleType}] Total tarefas:`, filteredTasks.length, '| Distribuição:', 
    columns.map(c => `${c.titulo}: ${c.tasks.length}`).join(', ')
  );

  // Obter responsáveis únicos
  const responsaveis = useMemo(() => {
    const unique = tasks.filter(task => task.responsavel_nome).reduce((acc, task) => {
      if (!acc.find(r => r.id === task.responsavel_id)) {
        acc.push({
          id: task.responsavel_id!,
          nome: task.responsavel_nome!
        });
      }
      return acc;
    }, [] as Array<{
      id: string;
      nome: string;
    }>);
    return unique;
  }, [tasks]);

  // Helper para encontrar coluna de uma tarefa
  const findColumnByTaskId = (taskId: string): string | undefined => {
    const column = columns.find(col => 
      col.tasks.some(task => task.id === taskId)
    );
    return column?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Set flag to prevent immediate click
    if (typeof window !== 'undefined') {
      (window as any).__dndJustDraggedAt = Date.now();
    }
    
    setActiveTask(null);
    
    if (!over) return;
    
    const taskId = active.id as string;
    const overId = over.id as string;
    
    // Tentar encontrar coluna diretamente
    let targetColumn = columns.find(col => col.id === overId);
    
    if (!targetColumn) {
      // Se não for coluna, buscar pela tarefa
      const targetColumnId = findColumnByTaskId(overId);
      if (targetColumnId) {
        targetColumn = columns.find(col => col.id === targetColumnId);
      }
    }
    
    if (targetColumn) {
      onTaskMove(taskId, targetColumn.id);
    }
  };
  return <div className="space-y-6">
      {/* Filtros e busca */}
      {(showSearch || showFilters) && <div className="flex items-center gap-4 flex-wrap">
          {showSearch && <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar tarefas, clientes, descrições..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>}
          
          {showFilters && <>
              <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  {responsaveis.map(responsavel => <SelectItem key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome}
                    </SelectItem>)}
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
            </>}
        </div>}

      {/* Board Kanban */}
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCorners}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {columns.map(column => <UniversalKanbanColumn key={column.id} column={column} onTaskCreate={onTaskCreate} onTaskClick={onTaskClick} moduleColumns={moduleColumns} onTaskMove={onTaskMove} />)}
        </div>

        {activeTask && (
          <DragOverlay dropAnimation={null} style={{ zIndex: 9999 }} modifiers={[snapCenterToCursor]}>
            <div className="pointer-events-none cursor-grabbing rotate-3 scale-105">
              <ModernKanbanCard 
                task={convertToKanbanTask(activeTask)} 
                onTaskClick={() => {}}
                isDragging={true}
                asOverlay
              />
            </div>
          </DragOverlay>
        )}
      </DndContext>
    </div>;
}