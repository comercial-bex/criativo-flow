-- Corrigir endpoints Brasil API e IBGE Demographics

UPDATE intelligence_sources
SET 
  endpoint_url = 'https://brasilapi.com.br/api/cep/v2/01310100',
  params = '{}',
  updated_at = NOW()
WHERE name = 'Brasil API';

UPDATE intelligence_sources
SET 
  endpoint_url = 'https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2022/variaveis/9324',
  params = '{"localidades": "N1[all]"}',
  updated_at = NOW()
WHERE name = 'IBGE Demographics';