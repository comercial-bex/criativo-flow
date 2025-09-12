-- Remover registros duplicados da Tech Solutions Ltda, mantendo apenas o que tem dados de onboarding
DELETE FROM clientes 
WHERE nome = 'Tech Solutions Ltda' 
AND id NOT IN (
  SELECT DISTINCT cliente_id 
  FROM cliente_onboarding 
  WHERE cliente_id IS NOT NULL
);