-- ============================================
-- SPRINT 3 PARTE 2: VIEW UNIFICADA + FUNÇÕES
-- ============================================

-- 1️⃣ RECRIAR VIEW UNIFICADA COM FERIADOS
DROP VIEW IF EXISTS vw_calendario_unificado;
CREATE VIEW vw_calendario_unificado AS
-- Eventos normais
SELECT 
  ec.id,
  ec.titulo,
  ec.descricao,
  ec.data_inicio,
  ec.data_fim,
  ec.tipo,
  ec.status,
  ec.origem,
  ec.cor,
  ec.local,
  ec.responsavel_id,
  ec.cliente_id,
  ec.projeto_id,
  ec.tarefa_id,
  ec.captacao_id,
  ec.is_automatico,
  ec.is_bloqueante,
  ec.is_extra,
  p.nome as responsavel_nome,
  p.avatar_url as responsavel_avatar,
  c.nome as cliente_nome,
  pr.titulo as projeto_titulo,
  'evento' as fonte_origem
FROM eventos_calendario ec
LEFT JOIN pessoas p ON p.id = ec.responsavel_id
LEFT JOIN clientes c ON c.id = ec.cliente_id
LEFT JOIN projetos pr ON pr.id = ec.projeto_id

UNION ALL

-- Feriados
SELECT 
  f.id,
  f.nome as titulo,
  f.descricao,
  (f.data AT TIME ZONE 'America/Sao_Paulo')::timestamptz as data_inicio,
  ((f.data + INTERVAL '1 day') AT TIME ZONE 'America/Sao_Paulo')::timestamptz as data_fim,
  'feriado'::tipo_evento as tipo,
  'agendado'::status_evento as status,
  'sistema' as origem,
  CASE 
    WHEN f.tipo = 'nacional' THEN '#dc2626'
    WHEN f.is_ponto_facultativo THEN '#f97316'
    ELSE '#eab308'
  END as cor,
  NULL as local,
  NULL::uuid as responsavel_id,
  NULL::uuid as cliente_id,
  NULL::uuid as projeto_id,
  NULL::uuid as tarefa_id,
  NULL::uuid as captacao_id,
  true as is_automatico,
  true as is_bloqueante,
  false as is_extra,
  NULL as responsavel_nome,
  NULL as responsavel_avatar,
  NULL as cliente_nome,
  NULL as projeto_titulo,
  'feriado' as fonte_origem
FROM feriados_nacionais f;

-- 2️⃣ FUNÇÃO DE DETECÇÃO DE CONFLITOS
CREATE OR REPLACE FUNCTION fn_detectar_conflitos_horario(
  p_responsavel_id UUID,
  p_data_inicio TIMESTAMPTZ,
  p_data_fim TIMESTAMPTZ,
  p_evento_id UUID DEFAULT NULL
)
RETURNS TABLE(
  conflito_id UUID,
  conflito_titulo TEXT,
  conflito_inicio TIMESTAMPTZ,
  conflito_fim TIMESTAMPTZ,
  tipo_conflito TEXT,
  severidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ec.id,
    ec.titulo,
    ec.data_inicio,
    ec.data_fim,
    CASE 
      WHEN ec.data_inicio <= p_data_inicio AND ec.data_fim >= p_data_fim THEN 'total'
      WHEN ec.data_inicio < p_data_fim AND ec.data_fim > p_data_inicio THEN 'parcial'
      ELSE 'adjacente'
    END as tipo_conflito,
    CASE 
      WHEN ec.is_bloqueante THEN 'critico'
      WHEN ec.tipo IN ('captacao_externa', 'reuniao_externa') THEN 'alto'
      ELSE 'medio'
    END as severidade
  FROM eventos_calendario ec
  WHERE 
    ec.responsavel_id = p_responsavel_id
    AND ec.status != 'cancelado'
    AND ec.tipo != 'feriado'
    AND (p_evento_id IS NULL OR ec.id != p_evento_id)
    AND (
      (ec.data_inicio <= p_data_inicio AND ec.data_fim >= p_data_fim) OR
      (ec.data_inicio < p_data_fim AND ec.data_fim > p_data_inicio)
    )
  ORDER BY ec.data_inicio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3️⃣ PREFERÊNCIAS DE NOTIFICAÇÃO
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS preferencias_notificacao JSONB DEFAULT '{
  "email_enabled": true,
  "lembrete_24h": true,
  "lembrete_1h": false,
  "conflitos": true,
  "novos_eventos": true,
  "feriados": true
}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_pessoas_preferencias ON pessoas USING GIN(preferencias_notificacao);

SELECT '✅ SPRINT 3 COMPLETO!' as status;