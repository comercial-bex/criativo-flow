import { useMemo } from 'react';
import { UniversalKanbanBoard, UniversalTask, UniversalColumn } from './UniversalKanbanBoard';

interface ClienteKanbanSimplificadoProps {
  tasks: UniversalTask[];
  onTaskClick?: (task: UniversalTask) => void;
  readOnly?: boolean;
}

/**
 * Kanban Simplificado para visão do CLIENTE
 * Agrupa os status técnicos internos em 6 colunas compreensíveis
 */
export const ClienteKanbanSimplificado = ({ 
  tasks, 
  onTaskClick,
  readOnly = true 
}: ClienteKanbanSimplificadoProps) => {
  
  // Mapeamento de status internos para visão do cliente
  const mapStatusToClienteColumn = (status: string): string => {
    // Em Criação (interna da agência)
    if (['backlog', 'briefing', 'briefing_recebido', 'planejando_captacao', 'em_criacao', 
         'gravacao', 'ingest_backup', 'em_edicao', 'pos_producao'].includes(status)) {
      return 'em_criacao';
    }
    
    // Em Revisão BEX (interna)
    if (['revisao_interna', 'ajuste_interno'].includes(status)) {
      return 'em_revisao_bex';
    }
    
    // Com Você (aguardando cliente)
    if (['enviado_cliente', 'aprovacao_cliente'].includes(status)) {
      return 'com_voce';
    }
    
    // Em Ajuste (cliente solicitou mudanças)
    if (['alteracao_cliente'].includes(status)) {
      return 'em_ajuste';
    }
    
    // Aprovado/Agendado
    if (['aprovado', 'agendado'].includes(status)) {
      return 'aprovado_agendado';
    }
    
    // Concluído
    if (['publicado', 'entregue', 'concluido'].includes(status)) {
      return 'concluido';
    }
    
    return 'em_criacao'; // fallback
  };
  
  // Transformar tarefas mapeando status para visão do cliente
  const tasksWithClienteStatus = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      status: mapStatusToClienteColumn(task.status)
    }));
  }, [tasks]);
  
  // Definir colunas simplificadas para o cliente
  const clienteColumns: UniversalColumn[] = [
    {
      id: 'em_criacao',
      titulo: 'Em Criação',
      cor: 'bg-blue-500',
      icon: '🎨',
      tasks: [],
      ordem: 1,
      descricao: 'Nossa equipe está trabalhando na sua peça'
    },
    {
      id: 'em_revisao_bex',
      titulo: 'Em Revisão BEX',
      cor: 'bg-purple-500',
      icon: '👀',
      tasks: [],
      ordem: 2,
      descricao: 'Revisando internamente antes de enviar'
    },
    {
      id: 'com_voce',
      titulo: 'Com Você',
      cor: 'bg-orange-500',
      icon: '📮',
      tasks: [],
      ordem: 3,
      descricao: 'Aguardando sua aprovação'
    },
    {
      id: 'em_ajuste',
      titulo: 'Em Ajuste',
      cor: 'bg-yellow-500',
      icon: '🔧',
      tasks: [],
      ordem: 4,
      descricao: 'Aplicando suas solicitações de mudança'
    },
    {
      id: 'aprovado_agendado',
      titulo: 'Aprovado/Agendado',
      cor: 'bg-green-500',
      icon: '✅',
      tasks: [],
      ordem: 5,
      descricao: 'Aprovado e aguardando publicação'
    },
    {
      id: 'concluido',
      titulo: 'Concluído',
      cor: 'bg-gray-500',
      icon: '🎉',
      tasks: [],
      ordem: 6,
      descricao: 'Publicado ou entregue'
    }
  ];
  
  return (
    <div className="h-full">
      <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">📋 Seus Projetos em Andamento</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe o status das suas peças de forma simplificada. Clique em cada card para mais detalhes.
        </p>
      </div>
      
      <UniversalKanbanBoard
        tasks={tasksWithClienteStatus}
        onTaskMove={() => {}} // Cliente não move tarefas
        onTaskCreate={() => {}} // Cliente não cria tarefas diretamente
        onTaskClick={onTaskClick || (() => {})}
        moduleType="geral"
        moduleColumns={clienteColumns}
        showFilters={false}
        showSearch={true}
      />
    </div>
  );
};
