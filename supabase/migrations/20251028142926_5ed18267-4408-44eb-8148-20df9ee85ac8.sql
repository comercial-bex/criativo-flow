-- Remover TODAS as funções problemáticas com CASCADE
DROP FUNCTION IF EXISTS fn_registrar_custo_evento() CASCADE;
DROP FUNCTION IF EXISTS auto_lancar_custo_evento() CASCADE;

-- Sincronizar tarefas e captações órfãs
INSERT INTO eventos_calendario (titulo, tipo, status, data_inicio, data_fim, responsavel_id, projeto_id, cliente_id, tarefa_id, origem, cor, is_automatico)
SELECT t.titulo, 'criacao_avulso'::tipo_evento, 'agendado'::status_evento, t.prazo_executor - INTERVAL '4 hours', t.prazo_executor, t.responsavel_id, t.projeto_id, COALESCE(p.cliente_id, t.cliente_id), t.id, 'grs', '#3b82f6', true
FROM tarefa t LEFT JOIN projetos p ON p.id = t.projeto_id
WHERE t.prazo_executor IS NOT NULL AND NOT EXISTS (SELECT 1 FROM eventos_calendario WHERE tarefa_id = t.id);

INSERT INTO eventos_calendario (titulo, tipo, status, data_inicio, data_fim, responsavel_id, cliente_id, captacao_id, origem, cor, is_automatico)
SELECT ca.titulo, 'captacao_externa'::tipo_evento, 'agendado'::status_evento, ca.data_captacao, ca.data_captacao + INTERVAL '2 hours', ca.especialista_id, ca.cliente_id, ca.id, 'audiovisual', '#f97316', true
FROM captacoes_agenda ca WHERE ca.data_captacao IS NOT NULL AND NOT EXISTS (SELECT 1 FROM eventos_calendario WHERE captacao_id = ca.id);

-- Resultado
SELECT '🎉 SINCRONIZAÇÃO COMPLETA!' as status, (SELECT COUNT(*) FROM eventos_calendario WHERE tarefa_id IS NOT NULL) as tarefas, (SELECT COUNT(*) FROM eventos_calendario WHERE captacao_id IS NOT NULL) as captacoes;
SELECT * FROM vw_validacao_calendario_sync;