-- Criar tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS public.configuracoes_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT,
  inscricao_estadual TEXT,
  endereco_completo TEXT,
  telefone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  
  -- Dados bancários
  banco_nome TEXT,
  banco_codigo TEXT,
  agencia TEXT,
  conta TEXT,
  pix_tipo TEXT,
  pix_chave TEXT,
  
  -- Informações para rodapé
  texto_rodape TEXT,
  termos_condicoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (todos autenticados)
CREATE POLICY "Todos podem ler configurações"
  ON public.configuracoes_empresa FOR SELECT
  TO authenticated
  USING (true);

-- Policy para edição (todos autenticados podem editar por enquanto)
CREATE POLICY "Usuários autenticados podem editar"
  ON public.configuracoes_empresa FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir dados padrão da BEX Communication
INSERT INTO public.configuracoes_empresa (
  razao_social,
  nome_fantasia,
  cnpj,
  endereco_completo,
  telefone,
  email,
  website,
  logo_url
) VALUES (
  'BEX Communication LTDA',
  'BEX Communication',
  '00.000.000/0001-00',
  'Endereço completo da agência',
  '(00) 0000-0000',
  'contato@bexcommunication.com.br',
  'www.bexcommunication.com.br',
  '/logo-bex-apk.svg'
);