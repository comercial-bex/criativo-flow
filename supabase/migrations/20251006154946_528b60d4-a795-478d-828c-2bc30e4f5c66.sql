-- ================================================
-- FASE 1: LIMPEZA DE DADOS DE TESTE (ORDEM CORRETA)
-- ================================================

-- 1. Deletar posts primeiro (dependem de planejamentos)
DELETE FROM public.posts_planejamento;
DELETE FROM public.posts_gerados_temp;

-- 2. Deletar planejamentos (dependem de clientes)
DELETE FROM public.planejamentos;

-- 3. Deletar outros dados que dependem de clientes
DELETE FROM public.social_metrics_cliente;
DELETE FROM public.social_integrations_cliente;
DELETE FROM public.briefings;
DELETE FROM public.captacoes_agenda WHERE cliente_id IS NOT NULL;
DELETE FROM public.eventos_agenda WHERE cliente_id IS NOT NULL;

-- 4. Deletar orçamentos e propostas
DELETE FROM public.propostas;
DELETE FROM public.orcamentos;

-- 5. Deletar transações financeiras de clientes
DELETE FROM public.transacoes_financeiras WHERE cliente_id IS NOT NULL;

-- 6. Agora deletar todos os clientes
DELETE FROM public.clientes;

-- 7. Limpar logs e dados temporários
DELETE FROM public.audit_logs;
DELETE FROM public.user_access_logs WHERE action NOT LIKE '%login%';
DELETE FROM public.email_logs WHERE destinatario_email LIKE '%test%' OR destinatario_email LIKE '%exemplo%';
DELETE FROM public.social_post_queue;
DELETE FROM public.leads;

-- 8. Resetar sequences se necessário (opcional)
-- ALTER SEQUENCE IF EXISTS clientes_id_seq RESTART WITH 1;

-- ================================================
-- FASE 4: CORRIGIR VINCULAÇÃO CLIENTE-USUÁRIO
-- ================================================

-- Criar função auxiliar para vincular usuários a clientes
CREATE OR REPLACE FUNCTION public.vincular_usuarios_clientes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'Use UPDATE manual na tabela profiles para vincular cliente_id aos usuários corretos.';
END;
$$;

-- ================================================
-- FASE 5: DISTRIBUIÇÃO AUTOMÁTICA DE PLANEJAMENTOS
-- ================================================

-- Função para atribuir GRS automaticamente
CREATE OR REPLACE FUNCTION public.atribuir_grs_automatico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  grs_id uuid;
BEGIN
  IF NEW.responsavel_grs_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT ur.user_id
  INTO grs_id
  FROM public.user_roles ur
  LEFT JOIN public.planejamentos p ON p.responsavel_grs_id = ur.user_id
  WHERE ur.role = 'grs'
  GROUP BY ur.user_id
  ORDER BY COUNT(p.id) ASC, ur.user_id ASC
  LIMIT 1;

  IF grs_id IS NOT NULL THEN
    NEW.responsavel_grs_id := grs_id;
    
    INSERT INTO public.notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    ) VALUES (
      grs_id,
      'Novo Planejamento Atribuído',
      'Um novo planejamento "' || NEW.titulo || '" foi atribuído a você.',
      'info',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_atribuir_grs ON public.planejamentos;
CREATE TRIGGER trigger_atribuir_grs
  BEFORE INSERT ON public.planejamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.atribuir_grs_automatico();

-- Função para criar tarefas automaticamente ao aprovar planejamento
CREATE OR REPLACE FUNCTION public.criar_tarefas_planejamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_id uuid;
  grs_id uuid;
  designer_id uuid;
  filmmaker_id uuid;
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    SELECT id INTO projeto_id
    FROM public.projetos
    WHERE cliente_id = NEW.cliente_id
    AND EXTRACT(MONTH FROM mes_referencia) = EXTRACT(MONTH FROM NEW.mes_referencia)
    AND EXTRACT(YEAR FROM mes_referencia) = EXTRACT(YEAR FROM NEW.mes_referencia)
    LIMIT 1;

    IF projeto_id IS NULL THEN
      INSERT INTO public.projetos (
        cliente_id,
        titulo,
        descricao,
        mes_referencia,
        status,
        criado_por
      ) VALUES (
        NEW.cliente_id,
        'Projeto - ' || TO_CHAR(NEW.mes_referencia, 'MM/YYYY'),
        'Projeto criado automaticamente',
        NEW.mes_referencia,
        'em_andamento',
        NEW.responsavel_grs_id
      ) RETURNING id INTO projeto_id;
    END IF;

    SELECT user_id INTO grs_id FROM public.user_roles WHERE role = 'grs' LIMIT 1;
    SELECT user_id INTO designer_id FROM public.user_roles WHERE role = 'designer' LIMIT 1;
    SELECT user_id INTO filmmaker_id FROM public.user_roles WHERE role = 'filmmaker' LIMIT 1;

    IF grs_id IS NOT NULL THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo
      ) VALUES (
        projeto_id, 'Revisar Conteúdo - ' || NEW.titulo,
        'Revisar e ajustar conteúdo do planejamento aprovado',
        'grs', grs_id, 'todo', 'alta', NEW.mes_referencia + INTERVAL '5 days'
      );
    END IF;

    IF designer_id IS NOT NULL THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo, briefing_obrigatorio
      ) VALUES (
        projeto_id, 'Criar Artes - ' || NEW.titulo,
        'Criar artes para os posts do planejamento aprovado',
        'design', designer_id, 'todo', 'alta',
        NEW.mes_referencia + INTERVAL '10 days', true
      );
    END IF;

    IF filmmaker_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts_planejamento
      WHERE planejamento_id = NEW.id
      AND formato_postagem IN ('video', 'reels', 'stories')
    ) THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo, briefing_obrigatorio
      ) VALUES (
        projeto_id, 'Produzir Vídeos - ' || NEW.titulo,
        'Produzir vídeos conforme planejamento aprovado',
        'audiovisual', filmmaker_id, 'todo', 'alta',
        NEW.mes_referencia + INTERVAL '15 days', true
      );
    END IF;

    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, data_evento)
    SELECT p.id, 'Planejamento Aprovado',
      'Seu planejamento "' || NEW.titulo || '" foi aprovado e está em produção!',
      'success', NOW()
    FROM public.profiles p
    WHERE p.cliente_id = NEW.cliente_id;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_criar_tarefas_planejamento ON public.planejamentos;
CREATE TRIGGER trigger_criar_tarefas_planejamento
  AFTER UPDATE ON public.planejamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_tarefas_planejamento();

COMMENT ON FUNCTION public.atribuir_grs_automatico() IS 'Atribui automaticamente um GRS ao planejamento usando distribuição por carga';
COMMENT ON FUNCTION public.criar_tarefas_planejamento() IS 'Cria tarefas para Design, GRS e Audiovisual quando planejamento é aprovado';
COMMENT ON FUNCTION public.vincular_usuarios_clientes() IS 'Função auxiliar para vincular usuários aos clientes';