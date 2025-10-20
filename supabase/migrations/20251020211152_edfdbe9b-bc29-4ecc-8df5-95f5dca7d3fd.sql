-- PRIORIDADE 3: Sincronizar evitando duplicatas

-- Vincular órfãos SOMENTE se o profile_id não está usado
UPDATE pessoas p 
SET profile_id = pd.id
FROM profiles_deprecated pd
WHERE p.email = pd.email 
  AND p.profile_id IS NULL 
  AND p.email IS NOT NULL 
  AND p.email != ''
  AND NOT EXISTS (
    SELECT 1 FROM pessoas p2 
    WHERE p2.profile_id = pd.id
  );

-- Audit
INSERT INTO audit_trail (acao, entidade_tipo, entidade_id, dados_antes, dados_depois, metadata, user_id, user_role, acao_detalhe, entidades_afetadas, impacto_tipo)
VALUES ('SYNC', 'pessoas', gen_random_uuid(), '{}'::jsonb, '{}'::jsonb, '{"prioridade": "3"}'::jsonb, NULL, 'system', 'Sincronização pessoas ↔ profiles (evitando duplicatas)', '["pessoas"]'::jsonb, 'integridade');