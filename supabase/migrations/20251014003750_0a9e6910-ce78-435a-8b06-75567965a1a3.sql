-- Criar tabela de relatórios de benchmark
CREATE TABLE public.relatorios_benchmark (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  -- Dados do relatório
  titulo TEXT NOT NULL,
  relatorio_markdown TEXT NOT NULL,
  cliente_analise JSONB NOT NULL DEFAULT '{}'::jsonb,
  concorrentes_analises JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Link único para apresentação
  link_hash TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  
  -- Metadados
  versao INTEGER NOT NULL DEFAULT 1,
  gerado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  gerado_por UUID REFERENCES auth.users(id),
  
  -- Controle
  is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_relatorios_cliente ON public.relatorios_benchmark(cliente_id);
CREATE INDEX idx_relatorios_hash ON public.relatorios_benchmark(link_hash);
CREATE INDEX idx_relatorios_ativo ON public.relatorios_benchmark(is_ativo);

-- Trigger para updated_at
CREATE TRIGGER set_relatorios_benchmark_updated_at
  BEFORE UPDATE ON public.relatorios_benchmark
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Habilitar RLS
ALTER TABLE public.relatorios_benchmark ENABLE ROW LEVEL SECURITY;

-- Policy: Equipe pode ver todos os relatórios
CREATE POLICY "Equipe pode ver relatórios"
  ON public.relatorios_benchmark
  FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
  );

-- Policy: Clientes veem seus próprios relatórios
CREATE POLICY "Clientes veem seus relatórios"
  ON public.relatorios_benchmark
  FOR SELECT
  USING (
    cliente_id IN (
      SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Acesso público via link_hash (sem autenticação)
CREATE POLICY "Acesso público via link_hash"
  ON public.relatorios_benchmark
  FOR SELECT
  USING (TRUE);

-- Policy: Apenas GRS/Admin pode criar
CREATE POLICY "GRS e Admin podem criar relatórios"
  ON public.relatorios_benchmark
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'grs')
  );

-- Policy: Apenas GRS/Admin pode atualizar
CREATE POLICY "GRS e Admin podem atualizar relatórios"
  ON public.relatorios_benchmark
  FOR UPDATE
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'grs')
  );

-- Comentário da tabela
COMMENT ON TABLE public.relatorios_benchmark IS 
  'Armazena relatórios de benchmark gerados pela IA com link único para apresentação one-page';