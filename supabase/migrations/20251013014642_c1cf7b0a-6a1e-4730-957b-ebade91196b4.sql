-- ============================================
-- FASE 1: Sistema de Protocolo Automático
-- ============================================

-- Adicionar coluna numero_protocolo à tabela tarefa
ALTER TABLE tarefa 
ADD COLUMN IF NOT EXISTS numero_protocolo TEXT UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_tarefa_protocolo 
ON tarefa(numero_protocolo);

-- Adicionar comentário explicativo
COMMENT ON COLUMN tarefa.numero_protocolo IS 
'Número de protocolo único no formato CLIENTE-DDMMAA/NNNN (ex: VEICULOS-131024/0001)';

-- ============================================
-- Função para gerar protocolo automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION gerar_protocolo_tarefa()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_nome TEXT;
  v_abreviacao TEXT;
  v_data_formatada TEXT;
  v_prefixo TEXT;
  v_count INT;
  v_sequencial TEXT;
  v_protocolo TEXT;
BEGIN
  -- Só gerar se não existir protocolo e se tiver cliente_id
  IF NEW.numero_protocolo IS NULL AND NEW.cliente_id IS NOT NULL THEN
    
    -- Buscar nome do cliente
    SELECT nome INTO v_cliente_nome
    FROM clientes
    WHERE id = NEW.cliente_id;
    
    IF v_cliente_nome IS NOT NULL THEN
      -- Gerar abreviação (máx 8 chars, só letras/números maiúsculas)
      v_abreviacao := UPPER(REGEXP_REPLACE(
        SUBSTRING(v_cliente_nome, 1, 8), 
        '[^A-Z0-9]', 
        '', 
        'g'
      ));
      
      -- Se ficou vazio após limpeza, usar CLIENT
      IF v_abreviacao = '' THEN
        v_abreviacao := 'CLIENT';
      END IF;
      
      -- Data atual DDMMAA
      v_data_formatada := TO_CHAR(CURRENT_DATE, 'DDMMYY');
      
      -- Prefixo completo
      v_prefixo := v_abreviacao || '-' || v_data_formatada;
      
      -- Contar tarefas com este prefixo
      SELECT COUNT(*) INTO v_count
      FROM tarefa
      WHERE numero_protocolo LIKE v_prefixo || '%';
      
      -- Gerar sequencial com 4 dígitos
      v_sequencial := LPAD((v_count + 1)::TEXT, 4, '0');
      v_protocolo := v_prefixo || '/' || v_sequencial;
      
      NEW.numero_protocolo := v_protocolo;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para executar antes de inserir
DROP TRIGGER IF EXISTS trg_gerar_protocolo_tarefa ON tarefa;
CREATE TRIGGER trg_gerar_protocolo_tarefa
BEFORE INSERT ON tarefa
FOR EACH ROW
EXECUTE FUNCTION gerar_protocolo_tarefa();