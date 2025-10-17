-- Adicionar coluna config para armazenar configurações de conexões
ALTER TABLE public.system_connections
ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.system_connections.config IS 
'Configurações específicas da conexão (endpoint, API keys, headers, timeout, etc)';

-- Atualizar conexões API existentes com endpoints padrão conhecidos
UPDATE public.system_connections
SET config = jsonb_build_object(
  'endpoint', 
  CASE 
    WHEN name = 'IA de Roteiro (GPT-4.1)' THEN 'https://api.openai.com/v1/models'
    WHEN name = 'Transcrição de Áudio' THEN 'https://api.openai.com/v1/audio/transcriptions'
    WHEN name = 'E-mail SMTP' THEN 'smtp://smtp.gmail.com:587'
    ELSE NULL
  END,
  'method', 'GET',
  'timeout', 5000
)
WHERE "group" = 'api' AND (config IS NULL OR config = '{}'::jsonb);