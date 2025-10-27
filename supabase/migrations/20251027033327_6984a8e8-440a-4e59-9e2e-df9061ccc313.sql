-- FASE 4.2 CORRIGIDA: Criar triggers para automação editorial

-- TRIGGER 1: Criar tarefa quando post é aprovado
CREATE OR REPLACE FUNCTION fn_post_aprovado_criar_tarefa()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_designer_id uuid;
  v_tarefa_id uuid;
  v_projeto_id uuid;
BEGIN
  -- Só criar tarefa se:
  -- 1. Status mudou para 'aprovado'
  -- 2. Ainda não tem tarefa vinculada
  IF (OLD.status IS NULL OR OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.status = 'aprovado' 
     AND NEW.tarefa_criacao_id IS NULL THEN
    
    -- Buscar projeto do planejamento
    SELECT projeto_id INTO v_projeto_id
    FROM planejamentos 
    WHERE id = NEW.planejamento_id;
    
    -- Buscar designer disponível (ordem aleatória para distribuir carga)
    SELECT profile_id INTO v_designer_id
    FROM pessoas 
    WHERE 'design' = ANY(papeis) 
      AND status = 'ativo'
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Se não encontrou designer, usar GRS
    IF v_designer_id IS NULL THEN
      SELECT profile_id INTO v_designer_id
      FROM pessoas 
      WHERE 'grs' = ANY(papeis) 
        AND status = 'ativo'
      LIMIT 1;
    END IF;
    
    -- Criar tarefa de produção
    INSERT INTO tarefa (
      titulo,
      descricao,
      data_inicio,
      data_conclusao,
      responsavel_id,
      tipo,
      prioridade,
      horas_estimadas,
      projeto_id,
      status
    ) VALUES (
      'Produzir: ' || NEW.titulo,
      'Criar arte para post: ' || COALESCE(NEW.objetivo_postagem, 'Post aprovado pelo cliente'),
      CURRENT_DATE,
      NEW.data_postagem - INTERVAL '2 days', -- Prazo: 2 dias antes da publicação
      v_designer_id,
      'producao_conteudo',
      'media',
      4, -- 4 horas estimadas
      v_projeto_id,
      'pendente'
    ) RETURNING id INTO v_tarefa_id;
    
    -- Vincular tarefa ao post e mudar status
    UPDATE posts_planejamento 
    SET 
      tarefa_criacao_id = v_tarefa_id,
      status = 'em_producao'::post_status_enum,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Notificar designer
    IF v_designer_id IS NOT NULL THEN
      INSERT INTO notificacoes (
        user_id,
        tipo,
        titulo,
        mensagem,
        link_acao
      ) VALUES (
        v_designer_id,
        'tarefa_atribuida',
        'Nova Arte Aprovada',
        'Post "' || NEW.titulo || '" foi aprovado e precisa de produção.',
        '/tarefas/' || v_tarefa_id
      );
    END IF;
    
    RAISE NOTICE '✅ Tarefa % criada automaticamente para post %', v_tarefa_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_aprovado_criar_tarefa ON posts_planejamento;
CREATE TRIGGER trg_post_aprovado_criar_tarefa
AFTER INSERT OR UPDATE OF status ON posts_planejamento
FOR EACH ROW 
EXECUTE FUNCTION fn_post_aprovado_criar_tarefa();

COMMENT ON FUNCTION fn_post_aprovado_criar_tarefa IS 'Cria tarefa de produção automaticamente quando post é aprovado pelo cliente';