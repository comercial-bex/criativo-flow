-- AUTOMAÇÕES DE PRODUTIVIDADE BEX 3.0

-- 1️⃣ FUNÇÃO: Criar notificação de meta concluída
CREATE OR REPLACE FUNCTION criar_notificacao_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.progresso = 100 AND (OLD.progresso IS NULL OR OLD.progresso < 100) THEN
    INSERT INTO public.notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    ) VALUES (
      NEW.user_id,
      '🎉 Meta Concluída!',
      'Parabéns! Você atingiu 100% na meta: ' || NEW.titulo,
      'success',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 2️⃣ TRIGGER: Notificar ao concluir meta
DROP TRIGGER IF EXISTS trigger_notificar_meta_concluida ON produtividade_metas;

CREATE TRIGGER trigger_notificar_meta_concluida
AFTER UPDATE ON produtividade_metas
FOR EACH ROW
WHEN (NEW.progresso = 100 AND OLD.progresso < 100)
EXECUTE FUNCTION criar_notificacao_meta();

-- 3️⃣ ADICIONAR COLUNA resumo_semanal
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtividade_reflexao' 
    AND column_name = 'resumo_semanal'
  ) THEN
    ALTER TABLE public.produtividade_reflexao 
    ADD COLUMN resumo_semanal TEXT;
  END IF;
END $$;