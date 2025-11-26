-- ========================================
-- LIMPEZA COMPLETA DO BANCO DE DADOS
-- Remove tabelas órfãs e atualiza dependências
-- ========================================

-- ETAPA 1: Dropar e Recriar Views existentes
-- ============================================

-- Dropar views existentes
DROP VIEW IF EXISTS vw_client_metrics CASCADE;
DROP VIEW IF EXISTS vw_planos_publicos_itens CASCADE;
DROP VIEW IF EXISTS vw_produtividade_7d CASCADE;

-- Recriar views essenciais

-- 1. vw_client_metrics
CREATE VIEW vw_client_metrics AS
SELECT 
  c.id AS cliente_id,
  c.nome,
  c.telefone,
  c.endereco,
  c.status::text AS status,
  c.cnpj_cpf,
  c.logo_url,
  p_resp.nome AS responsavel_nome,
  p_resp.profile_id AS responsavel_id,
  c.created_at,
  c.updated_at,
  COUNT(DISTINCT proj.id) AS total_projetos,
  COUNT(DISTINCT CASE WHEN proj.status = 'ativo' THEN proj.id END) AS projetos_ativos
FROM clientes c
LEFT JOIN pessoas p_resp ON p_resp.profile_id = c.responsavel_id
LEFT JOIN projetos proj ON proj.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone, c.endereco, c.status, c.cnpj_cpf, 
         c.logo_url, p_resp.nome, p_resp.profile_id, c.created_at, c.updated_at;

-- 2. vw_planos_publicos_itens
CREATE VIEW vw_planos_publicos_itens AS
SELECT 
  prod.id,
  prod.nome,
  prod.tipo,
  prod.preco_padrao,
  prod.periodo,
  prod.posts_mensais,
  prod.reels_suporte,
  prod.anuncios_facebook,
  prod.anuncios_google,
  prod.recursos,
  prod.ativo,
  prod.created_at,
  prod.updated_at
FROM produtos prod
WHERE prod.tipo = 'plano_assinatura' AND prod.ativo = true;

-- 3. vw_produtividade_7d
CREATE VIEW vw_produtividade_7d AS
SELECT 
  p.profile_id AS user_id,
  p.nome AS user_nome,
  COUNT(DISTINCT t.id) AS tarefas_concluidas,
  AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600) AS tempo_medio_conclusao_horas,
  COUNT(DISTINCT DATE(t.updated_at)) AS dias_ativos
FROM pessoas p
LEFT JOIN tarefa t ON t.executor_id = p.profile_id 
  AND t.status = 'concluido'
  AND t.updated_at >= NOW() - INTERVAL '7 days'
GROUP BY p.profile_id, p.nome;


-- ETAPA 2: Atualizar Função auto_populate_papeis
-- ================================================

CREATE OR REPLACE FUNCTION auto_populate_papeis()
RETURNS trigger AS $$
BEGIN
  -- Se papeis estiver vazio, definir como especialista genérico
  IF NEW.papeis IS NULL OR NEW.papeis = '{}' THEN
    NEW.papeis := ARRAY['especialista']::text[];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ETAPA 3: Dropar View profiles
-- ===============================

DROP VIEW IF EXISTS profiles CASCADE;


-- ETAPA 4: Dropar Tabelas Órfãs Vazias
-- ======================================

-- Grupo 1: Legado (5 tabelas)
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS tarefas CASCADE;
DROP TABLE IF EXISTS tarefas_projeto CASCADE;
DROP TABLE IF EXISTS tarefas_equipamentos CASCADE;
DROP TABLE IF EXISTS log_atividade_tarefa CASCADE;

-- Grupo 2: Gamificação vazias (4 tabelas)
DROP TABLE IF EXISTS gamificacao_conquistas CASCADE;
DROP TABLE IF EXISTS gamificacao_pontos CASCADE;
DROP TABLE IF EXISTS gamificacao_premios CASCADE;
DROP TABLE IF EXISTS gamificacao_ranking CASCADE;

-- Grupo 3: Inventário vazias (8 tabelas)
DROP TABLE IF EXISTS inventario_itens CASCADE;
DROP TABLE IF EXISTS inventario_movimentacoes CASCADE;
DROP TABLE IF EXISTS inventario_reservas CASCADE;
DROP TABLE IF EXISTS inventario_manutencoes CASCADE;
DROP TABLE IF EXISTS inventario_alugueis CASCADE;
DROP TABLE IF EXISTS inventario_imagens CASCADE;
DROP TABLE IF EXISTS inventario_termos_assinados CASCADE;
DROP TABLE IF EXISTS inventario_unidades CASCADE;

-- Grupo 4: Social vazias (7 tabelas)
DROP TABLE IF EXISTS social_auth_logs CASCADE;
DROP TABLE IF EXISTS social_connection_logs CASCADE;
DROP TABLE IF EXISTS social_integrations CASCADE;
DROP TABLE IF EXISTS social_integrations_cliente CASCADE;
DROP TABLE IF EXISTS social_metrics CASCADE;
DROP TABLE IF EXISTS social_metrics_cliente CASCADE;
DROP TABLE IF EXISTS social_post_queue CASCADE;

-- Grupo 5: RH vazias (3 tabelas)
DROP TABLE IF EXISTS rh_cargos CASCADE;
DROP TABLE IF EXISTS rh_folha_ponto CASCADE;
DROP TABLE IF EXISTS rh_timeline_carreira CASCADE;

-- Grupo 6: Produtividade vazias (3 tabelas)
DROP TABLE IF EXISTS produtividade_metas CASCADE;
DROP TABLE IF EXISTS produtividade_reflexao CASCADE;
DROP TABLE IF EXISTS produtividade_insights_foco CASCADE;


-- ETAPA 5: Dropar profiles_deprecated_backup_2025
-- =================================================

DROP TABLE IF EXISTS profiles_deprecated_backup_2025 CASCADE;


-- ========================================
-- RESUMO DA LIMPEZA
-- ========================================
-- ✅ 3 views atualizadas para usar pessoas
-- ✅ 1 função atualizada
-- ✅ 1 view profiles removida
-- ✅ ~33 tabelas órfãs removidas
-- ✅ 1 tabela backup deprecated removida
-- 
-- Total: ~34 objetos limpos do banco de dados
-- ========================================