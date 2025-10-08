-- Migration: Adicionar produto_id em transacoes_financeiras e criar admin_temp_data

-- 1. Adicionar coluna produto_id em transacoes_financeiras
ALTER TABLE public.transacoes_financeiras 
ADD COLUMN IF NOT EXISTS produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_produto_id ON public.transacoes_financeiras(produto_id);

-- Comentário
COMMENT ON COLUMN public.transacoes_financeiras.produto_id IS 'Produto/Serviço vinculado ao lançamento financeiro';

-- 2. Criar tabela admin_temp_data para sincronização entre módulos
CREATE TABLE IF NOT EXISTS public.admin_temp_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  produto_nome text NOT NULL,
  valor_unitario numeric NOT NULL,
  categoria text,
  descricao_curta text,
  origem text NOT NULL DEFAULT 'financeiro',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  used_at timestamp with time zone,
  used_in_document_type text,
  used_in_document_id uuid
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_temp_cliente ON admin_temp_data(cliente_id);
CREATE INDEX IF NOT EXISTS idx_admin_temp_produto ON admin_temp_data(produto_id);
CREATE INDEX IF NOT EXISTS idx_admin_temp_used ON admin_temp_data(used_at) WHERE used_at IS NULL;

-- RLS
ALTER TABLE public.admin_temp_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin e equipe podem ver dados temporários" ON public.admin_temp_data;
CREATE POLICY "Admin e equipe podem ver dados temporários" ON public.admin_temp_data
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'financeiro', 'atendimento', 'grs')
  )
);

DROP POLICY IF EXISTS "Usuários autenticados podem criar dados temporários" ON public.admin_temp_data;
CREATE POLICY "Usuários autenticados podem criar dados temporários" ON public.admin_temp_data
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin e gestor podem atualizar dados temporários" ON public.admin_temp_data;
CREATE POLICY "Admin e gestor podem atualizar dados temporários" ON public.admin_temp_data
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor')
  )
);

COMMENT ON TABLE public.admin_temp_data IS 'Dados temporários de produtos do financeiro para uso no módulo administrativo';