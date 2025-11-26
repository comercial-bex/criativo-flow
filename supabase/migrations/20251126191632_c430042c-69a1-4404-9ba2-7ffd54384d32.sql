-- ====================================================================
-- FASE 1: Adicionar novos status e tipos de tarefa
-- Crítico para funcionamento correto do fluxo Kanban
-- ====================================================================

-- Adicionar novos status ao enum status_tarefa_enum
DO $$ 
BEGIN
    -- Status para fluxo de Design/Audiovisual
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'recebidos' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'recebidos';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ajuste_interno' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'ajuste_interno';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'alteracao_cliente' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'alteracao_cliente';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefing_recebido' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'briefing_recebido';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'planejando_captacao' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'planejando_captacao';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'gravacao' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'gravacao';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ingest_backup' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'ingest_backup';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pos_producao' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'pos_producao';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'enviado_cliente' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'enviado_cliente';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'entregue' AND enumtypid = 'status_tarefa_enum'::regtype) THEN
        ALTER TYPE status_tarefa_enum ADD VALUE 'entregue';
    END IF;
END $$;

-- Adicionar novos tipos de tarefa ao enum tipo_tarefa_enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'landing_page' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'landing_page';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'email_marketing' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'email_marketing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'arte_impressa' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'arte_impressa';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'motion_graphics' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'motion_graphics';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'video_depoimento' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'video_depoimento';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cobertura_evento' AND enumtypid = 'tipo_tarefa_enum'::regtype) THEN
        ALTER TYPE tipo_tarefa_enum ADD VALUE 'cobertura_evento';
    END IF;
END $$;

COMMENT ON TYPE status_tarefa_enum IS 'Status disponíveis para tarefas no sistema BEX - Atualizado em 2025-01-26';
COMMENT ON TYPE tipo_tarefa_enum IS 'Tipos de tarefas disponíveis no sistema BEX - Atualizado em 2025-01-26';