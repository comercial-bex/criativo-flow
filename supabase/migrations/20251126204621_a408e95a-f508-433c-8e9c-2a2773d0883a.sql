-- =====================================================
-- LIMPEZA COMPLETA - Ordem ajustada para evitar trigger
-- =====================================================

-- 1. TABELAS MAIS DEPENDENTES (exceto anexo)
DELETE FROM public.tarefa_comentarios;
DELETE FROM public.subtarefas;
DELETE FROM public.aprovacao_tarefa;

-- 2. BRIEFINGS (sem FK problem)
UPDATE public.briefings SET projeto_gerado_id = NULL WHERE projeto_gerado_id IS NOT NULL;
DELETE FROM public.briefings;

-- 3. APROVAÇÕES E POSTS
DELETE FROM public.aprovacoes_cliente;
DELETE FROM public.posts_planejamento;

-- 4. TAREFAS (antes de anexo para evitar FK circular)
DELETE FROM public.tarefa;

-- 5. ANEXO (agora sim, sem tarefas referenciando)
DELETE FROM public.anexo;

-- 6. PLANEJAMENTOS
DELETE FROM public.planejamentos;

-- 7. PROJETOS
DELETE FROM public.projetos;

-- 8. AGENDA E EVENTOS
DELETE FROM public.eventos_calendario;
DELETE FROM public.captacoes_agenda;

-- 9. CAMPANHAS
DELETE FROM public.campanha;

-- 10. NOTIFICAÇÕES
DELETE FROM public.notificacoes;

-- 11. LOGS
DELETE FROM public.logs_atividade 
WHERE entidade_tipo IN ('tarefa', 'projeto', 'planejamento', 'evento');

-- 12. AUDIT TRAIL
DELETE FROM public.audit_trail 
WHERE entidade_tipo IN ('tarefa', 'projeto', 'planejamento', 'eventos_calendario', 'anexo', 'briefing')
  AND created_at < NOW();

-- Log de sucesso
INSERT INTO public.audit_trail (
  entidade_tipo,
  entidade_id,
  acao,
  acao_detalhe,
  dados_depois
) VALUES (
  'system',
  gen_random_uuid(),
  'limpeza_banco_completa',
  '✅ Banco limpo: sistema pronto para iniciar operação real',
  jsonb_build_object(
    'timestamp', NOW(),
    'modulos_limpos', ARRAY['projetos', 'tarefas', 'planejamentos', 'eventos', 'agenda', 'notificacoes']
  )
);