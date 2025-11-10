-- FASE 3: Integração Financeira com Orçamentos

-- Adicionar colunas para vincular transações ao orçamento e proposta
ALTER TABLE transacoes_financeiras 
ADD COLUMN IF NOT EXISTS orcamento_id UUID REFERENCES orcamentos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proposta_id UUID REFERENCES propostas(id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_orcamento ON transacoes_financeiras(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_proposta ON transacoes_financeiras(proposta_id);

-- Função que cria transação financeira quando orçamento é aprovado
CREATE OR REPLACE FUNCTION fn_criar_transacao_orcamento_aprovado()
RETURNS TRIGGER AS $$
BEGIN
  -- Só executa se status mudou para 'aprovado'
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    -- Criar transação de receita
    INSERT INTO transacoes_financeiras (
      cliente_id,
      projeto_id,
      orcamento_id,
      tipo,
      categoria,
      descricao,
      valor,
      data_transacao,
      data_vencimento,
      status,
      responsavel_id
    ) VALUES (
      NEW.cliente_id,
      NEW.projeto_id,
      NEW.id,
      'receita',
      'Orçamento Aprovado',
      'Receita gerada automaticamente: ' || NEW.titulo,
      NEW.valor_final,
      NOW(),
      NEW.data_validade, -- vencimento = validade do orçamento
      'pendente',
      NEW.responsavel_id
    );

    -- Log da operação
    INSERT INTO atividades_log (
      entidade_tipo,
      entidade_id,
      acao,
      descricao,
      user_id
    ) VALUES (
      'orcamento',
      NEW.id,
      'financeiro_integrado',
      'Transação financeira criada automaticamente',
      auth.uid()
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_orcamento_aprovado_financeiro ON orcamentos;
CREATE TRIGGER trg_orcamento_aprovado_financeiro
AFTER UPDATE ON orcamentos
FOR EACH ROW
EXECUTE FUNCTION fn_criar_transacao_orcamento_aprovado();

-- Adicionar status 'arquivado' ao enum (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_orcamento') THEN
    -- Se o enum não existe, cria com todos os valores
    CREATE TYPE status_orcamento AS ENUM ('rascunho', 'enviado', 'aprovado', 'rejeitado', 'expirado', 'arquivado');
  ELSE
    -- Se existe, adiciona o valor se não estiver presente
    BEGIN
      ALTER TYPE status_orcamento ADD VALUE IF NOT EXISTS 'arquivado';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;