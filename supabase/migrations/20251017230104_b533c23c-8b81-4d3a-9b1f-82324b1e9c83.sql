-- Corrigir função criar_tarefas_planejamento para usar 'aprovado_cliente'
CREATE OR REPLACE FUNCTION public.criar_tarefas_planejamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_projeto_id UUID;
  v_grs_id UUID;
  v_designer_id UUID;
  v_filmmaker_id UUID;
  v_gerente_id UUID;
  v_especialistas JSONB;
  v_trace_id UUID := gen_random_uuid();
  v_tarefa_grs_id UUID;
  v_tarefa_designer_id UUID;
  v_tarefa_filmmaker_id UUID;
  v_aprovacao_result JSONB;
  v_vinculo_valido JSONB;
BEGIN
  -- ✅ CORREÇÃO: 'aprovado' → 'aprovado_cliente'
  IF NEW.status = 'aprovado_cliente' AND (OLD.status IS NULL OR OLD.status != 'aprovado_cliente') THEN
    
    -- Extrair especialistas do metadata se existir
    v_especialistas := NEW.descricao::jsonb->'especialistas';
    
    IF v_especialistas IS NOT NULL THEN
      v_grs_id := (v_especialistas->>'grs_id')::uuid;
      v_designer_id := (v_especialistas->>'designer_id')::uuid;
      v_filmmaker_id := (v_especialistas->>'filmmaker_id')::uuid;
      v_gerente_id := (v_especialistas->>'gerente_id')::uuid;
    END IF;

    -- Verificar se já existe projeto vinculado
    v_projeto_id := NEW.projeto_id;
    
    -- Se não existe projeto, criar um novo
    IF v_projeto_id IS NULL THEN
      SELECT id INTO v_projeto_id
      FROM public.projetos
      WHERE cliente_id = NEW.cliente_id
        AND EXTRACT(MONTH FROM mes_referencia) = EXTRACT(MONTH FROM NEW.mes_referencia)
        AND EXTRACT(YEAR FROM mes_referencia) = EXTRACT(YEAR FROM NEW.mes_referencia)
      LIMIT 1;

      IF v_projeto_id IS NULL THEN
        INSERT INTO public.projetos (
          cliente_id,
          titulo,
          descricao,
          mes_referencia,
          status,
          criado_por,
          responsavel_grs_id
        ) VALUES (
          NEW.cliente_id,
          'Projeto - ' || TO_CHAR(NEW.mes_referencia, 'MM/YYYY'),
          'Projeto criado automaticamente a partir do planejamento: ' || NEW.titulo,
          NEW.mes_referencia,
          'em_andamento',
          NEW.responsavel_grs_id,
          COALESCE(v_grs_id, NEW.responsavel_grs_id)
        ) RETURNING id INTO v_projeto_id;
        
        UPDATE public.planejamentos
        SET projeto_id = v_projeto_id
        WHERE id = NEW.id;
      END IF;
    END IF;

    -- 🔒 VALIDAR VÍNCULO PROJETO → CLIENTE → ORÇAMENTO/CONTRATO
    BEGIN
      v_vinculo_valido := fn_validar_vinculo_projeto_cliente(v_projeto_id);
      RAISE NOTICE '✅ Vínculo validado: %', v_vinculo_valido;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Projeto % sem Orçamento/Contrato válido. Tarefas serão criadas mas podem ser bloqueadas posteriormente.', v_projeto_id;
    END;

    -- Vincular especialistas ao projeto se foram fornecidos
    IF v_grs_id IS NOT NULL THEN
      INSERT INTO public.projeto_especialistas (
        projeto_id, especialista_id, especialidade, is_gerente
      ) VALUES (
        v_projeto_id, v_grs_id, 'grs', (v_grs_id = v_gerente_id)
      ) ON CONFLICT (projeto_id, especialista_id) DO UPDATE 
      SET is_gerente = (v_grs_id = v_gerente_id);
    END IF;

    IF v_designer_id IS NOT NULL THEN
      INSERT INTO public.projeto_especialistas (
        projeto_id, especialista_id, especialidade, is_gerente
      ) VALUES (
        v_projeto_id, v_designer_id, 'designer', (v_designer_id = v_gerente_id)
      ) ON CONFLICT (projeto_id, especialista_id) DO UPDATE 
      SET is_gerente = (v_designer_id = v_gerente_id);
    END IF;

    IF v_filmmaker_id IS NOT NULL THEN
      INSERT INTO public.projeto_especialistas (
        projeto_id, especialista_id, especialidade, is_gerente
      ) VALUES (
        v_projeto_id, v_filmmaker_id, 'filmmaker', (v_filmmaker_id = v_gerente_id)
      ) ON CONFLICT (projeto_id, especialista_id) DO UPDATE 
      SET is_gerente = (v_filmmaker_id = v_gerente_id);
    END IF;

    -- 📋 CRIAR TAREFAS USANDO FUNÇÃO DE NEGÓCIO
    IF v_grs_id IS NOT NULL THEN
      v_tarefa_grs_id := fn_criar_tarefa_de_planejamento(
        p_planejamento_id := NEW.id,
        p_projeto_id := v_projeto_id,
        p_especialista_id := v_grs_id,
        p_setor := 'grs',
        p_titulo := 'Revisar Conteúdo - ' || NEW.titulo,
        p_descricao := 'Revisar e ajustar conteúdo do planejamento aprovado',
        p_prioridade := 'alta',
        p_data_prazo := (NEW.mes_referencia + INTERVAL '5 days')::date,
        p_trace_id := v_trace_id
      );
    END IF;

    IF v_designer_id IS NOT NULL THEN
      v_tarefa_designer_id := fn_criar_tarefa_de_planejamento(
        p_planejamento_id := NEW.id,
        p_projeto_id := v_projeto_id,
        p_especialista_id := v_designer_id,
        p_setor := 'design',
        p_titulo := 'Criar Artes - ' || NEW.titulo,
        p_descricao := 'Criar artes para os posts do planejamento aprovado',
        p_prioridade := 'alta',
        p_data_prazo := (NEW.mes_referencia + INTERVAL '10 days')::date,
        p_trace_id := v_trace_id
      );
    END IF;

    IF v_filmmaker_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts_planejamento
      WHERE planejamento_id = NEW.id
        AND formato_postagem IN ('video', 'reels', 'stories')
    ) THEN
      v_tarefa_filmmaker_id := fn_criar_tarefa_de_planejamento(
        p_planejamento_id := NEW.id,
        p_projeto_id := v_projeto_id,
        p_especialista_id := v_filmmaker_id,
        p_setor := 'audiovisual',
        p_titulo := 'Produzir Vídeos - ' || NEW.titulo,
        p_descricao := 'Produzir vídeos conforme planejamento aprovado',
        p_prioridade := 'alta',
        p_data_prazo := (NEW.mes_referencia + INTERVAL '15 days')::date,
        p_trace_id := v_trace_id
      );
    END IF;

    -- 🔔 GERAR APROVAÇÃO AUTOMÁTICA PARA O CLIENTE
    v_aprovacao_result := fn_criar_aprovacao_cliente(
      p_cliente_id := NEW.cliente_id,
      p_referencia_tipo := 'planejamento',
      p_referencia_id := NEW.id,
      p_titulo := '✅ Planejamento Aprovado: ' || NEW.titulo,
      p_descricao := 'Seu planejamento foi aprovado e as tarefas foram criadas. Acompanhe o progresso aqui.',
      p_trace_id := v_trace_id
    );

    RAISE NOTICE '✅ Aprovação criada: %', v_aprovacao_result->>'aprovacao_id';

    -- Log de atividade com trace_id compartilhado
    PERFORM criar_log_atividade(
      NEW.cliente_id,
      auth.uid(),
      'aprovacao_planejamento',
      'planejamentos',
      NEW.id,
      '🎯 Planejamento aprovado com propagação automática: ' || NEW.titulo,
      jsonb_build_object(
        'planejamento_id', NEW.id,
        'projeto_id', v_projeto_id,
        'trace_id', v_trace_id,
        'tarefas_criadas', jsonb_build_object(
          'grs', v_tarefa_grs_id,
          'designer', v_tarefa_designer_id,
          'filmmaker', v_tarefa_filmmaker_id
        ),
        'aprovacao', v_aprovacao_result,
        'vinculo_validado', v_vinculo_valido
      )
    );

    -- Notificar cliente sobre aprovação
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, data_evento)
    SELECT p.id, 'Planejamento Aprovado',
      '🎉 Seu planejamento "' || NEW.titulo || '" foi aprovado! Acompanhe em: ' || (v_aprovacao_result->>'link_aprovacao'),
      'success', NOW()
    FROM public.profiles p
    WHERE p.cliente_id = NEW.cliente_id;

  END IF;

  RETURN NEW;
END;
$function$;

-- Corrigir função fn_gerar_meta_posts_planejamento para usar 'aprovado_cliente'
CREATE OR REPLACE FUNCTION public.fn_gerar_meta_posts_planejamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_posts INTEGER;
  v_mes_ref DATE;
  v_meta_id UUID;
BEGIN
  -- ✅ CORREÇÃO: 'aprovado' → 'aprovado_cliente'
  IF NEW.status = 'aprovado_cliente' AND (OLD.status IS NULL OR OLD.status != 'aprovado_cliente') THEN
    
    -- Contar total de posts no planejamento
    SELECT COUNT(*) INTO v_total_posts
    FROM posts_planejamento
    WHERE planejamento_id = NEW.id;
    
    -- Se não houver posts, não criar meta
    IF v_total_posts = 0 THEN
      RETURN NEW;
    END IF;
    
    v_mes_ref := DATE_TRUNC('month', NEW.mes_referencia);
    
    -- Criar ou atualizar meta de posts mensais
    INSERT INTO cliente_metas (
      cliente_id,
      tipo_meta,
      titulo,
      descricao,
      valor_alvo,
      valor_atual,
      unidade,
      periodo_inicio,
      periodo_fim,
      status
    ) VALUES (
      NEW.cliente_id,
      'engajamento',
      'Posts Planejados - ' || TO_CHAR(v_mes_ref, 'MM/YYYY'),
      'Entregas de conteúdo conforme planejamento editorial aprovado',
      v_total_posts,
      0, -- Será atualizado conforme posts são publicados
      'posts',
      v_mes_ref,
      v_mes_ref + INTERVAL '1 month' - INTERVAL '1 day',
      'em_andamento'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_meta_id;
    
    RAISE NOTICE '✅ Meta de posts criada: % posts para %', v_total_posts, TO_CHAR(v_mes_ref, 'MM/YYYY');
  END IF;
  
  RETURN NEW;
END;
$function$;