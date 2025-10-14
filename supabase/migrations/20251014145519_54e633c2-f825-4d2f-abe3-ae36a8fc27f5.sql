-- Adicionar valores faltantes ao enum status_tarefa_enum
-- Isso permite que todos os módulos Kanban usem seus status específicos

-- Status gerais (Admin/Tarefas)
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'a_fazer';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'em_andamento';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'concluido';

-- Status de Design
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'em_cadastro';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'em_analise';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'em_criacao';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'revisao_interna';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'entregue';

-- Status de Audiovisual
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'roteiro';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'pre_producao';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'gravacao';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'pos_producao';

-- Status de Atendimento/Comercial
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'novo';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'qualificado';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'proposta';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'negociacao';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'fechado';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'contato';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'oportunidade';
ALTER TYPE status_tarefa_enum ADD VALUE IF NOT EXISTS 'convertido';