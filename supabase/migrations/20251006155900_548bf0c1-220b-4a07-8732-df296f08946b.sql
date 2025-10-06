-- FASE 1: Estrutura de Banco de Dados
-- Adicionar projeto_id em planejamentos e melhorar trigger

-- 1. Adicionar coluna projeto_id na tabela planejamentos
ALTER TABLE public.planejamentos 
ADD COLUMN IF NOT EXISTS projeto_id uuid REFERENCES public.projetos(id);

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_planejamentos_projeto_id ON public.planejamentos(projeto_id);

-- 3. Atualizar trigger criar_tarefas_planejamento para criar projeto e vincular especialistas
CREATE OR REPLACE FUNCTION public.criar_tarefas_planejamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_projeto_id uuid;
  v_grs_id uuid;
  v_designer_id uuid;
  v_filmmaker_id uuid;
  v_gerente_id uuid;
  v_especialistas jsonb;
BEGIN
  -- Só executar quando planejamento for aprovado
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
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
      -- Buscar ou criar projeto para este cliente/mês
      SELECT id INTO v_projeto_id
      FROM public.projetos
      WHERE cliente_id = NEW.cliente_id
        AND EXTRACT(MONTH FROM mes_referencia) = EXTRACT(MONTH FROM NEW.mes_referencia)
        AND EXTRACT(YEAR FROM mes_referencia) = EXTRACT(YEAR FROM NEW.mes_referencia)
      LIMIT 1;

      IF v_projeto_id IS NULL THEN
        -- Criar novo projeto
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
        
        -- Atualizar planejamento com projeto_id
        UPDATE public.planejamentos
        SET projeto_id = v_projeto_id
        WHERE id = NEW.id;
      END IF;
    END IF;

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

    -- Criar tarefas e atribuir aos especialistas vinculados
    IF v_grs_id IS NOT NULL THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo
      ) VALUES (
        v_projeto_id, 'Revisar Conteúdo - ' || NEW.titulo,
        'Revisar e ajustar conteúdo do planejamento aprovado',
        'grs', v_grs_id, 'todo', 'alta', NEW.mes_referencia + INTERVAL '5 days'
      );
    END IF;

    IF v_designer_id IS NOT NULL THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo, briefing_obrigatorio
      ) VALUES (
        v_projeto_id, 'Criar Artes - ' || NEW.titulo,
        'Criar artes para os posts do planejamento aprovado',
        'design', v_designer_id, 'todo', 'alta',
        NEW.mes_referencia + INTERVAL '10 days', true
      );
    END IF;

    IF v_filmmaker_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts_planejamento
      WHERE planejamento_id = NEW.id
        AND formato_postagem IN ('video', 'reels', 'stories')
    ) THEN
      INSERT INTO public.tarefas_projeto (
        projeto_id, titulo, descricao, setor_responsavel, responsavel_id,
        status, prioridade, data_prazo, briefing_obrigatorio
      ) VALUES (
        v_projeto_id, 'Produzir Vídeos - ' || NEW.titulo,
        'Produzir vídeos conforme planejamento aprovado',
        'audiovisual', v_filmmaker_id, 'todo', 'alta',
        NEW.mes_referencia + INTERVAL '15 days', true
      );
    END IF;

    -- Notificar cliente sobre aprovação
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