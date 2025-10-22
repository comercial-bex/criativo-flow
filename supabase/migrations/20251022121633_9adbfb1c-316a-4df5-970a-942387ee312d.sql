-- ==========================================
-- SPRINT: NOTAS INTERNAS INTELIGENTES
-- Tabela, Storage Bucket e RLS Policies
-- ==========================================

-- 1️⃣ Criar tabela notas_onboarding
CREATE TABLE IF NOT EXISTS public.notas_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  onboarding_id UUID REFERENCES public.cliente_onboarding(id) ON DELETE SET NULL,
  
  -- Conteúdo
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo_nota VARCHAR(50) NOT NULL CHECK (tipo_nota IN ('briefing', 'mercado', 'swot', 'estrategia', 'geral')),
  
  -- Anexos/Links do ChatGPT
  link_chatgpt TEXT,
  arquivo_anexo_url TEXT,
  arquivo_nome VARCHAR(255),
  arquivo_tipo VARCHAR(100),
  
  -- Análise IA
  analise_ia JSONB,
  keywords TEXT[],
  categoria_ia VARCHAR(100),
  relevancia_score NUMERIC(3,2) CHECK (relevancia_score >= 0 AND relevancia_score <= 10),
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  versao INTEGER DEFAULT 1,
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  usado_em_planejamento BOOLEAN DEFAULT FALSE
);

-- 2️⃣ Índices para performance
CREATE INDEX IF NOT EXISTS idx_notas_onboarding_cliente ON public.notas_onboarding(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notas_onboarding_tipo ON public.notas_onboarding(tipo_nota);
CREATE INDEX IF NOT EXISTS idx_notas_onboarding_keywords ON public.notas_onboarding USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_notas_onboarding_created_at ON public.notas_onboarding(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notas_onboarding_active ON public.notas_onboarding(is_active) WHERE is_active = TRUE;

-- 3️⃣ Trigger para versionamento
CREATE OR REPLACE FUNCTION public.update_nota_onboarding_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  IF OLD.conteudo != NEW.conteudo OR OLD.titulo != NEW.titulo THEN
    NEW.versao = OLD.versao + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_nota_onboarding_versao ON public.notas_onboarding;
CREATE TRIGGER trg_nota_onboarding_versao
  BEFORE UPDATE ON public.notas_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nota_onboarding_version();

-- 4️⃣ RLS Policies
ALTER TABLE public.notas_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver notas" ON public.notas_onboarding;
CREATE POLICY "Usuários podem ver notas"
  ON public.notas_onboarding FOR SELECT
  USING (
    auth.uid() = created_by 
    OR is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('grs', 'gestor', 'admin')
    )
  );

DROP POLICY IF EXISTS "Usuários podem criar notas" ON public.notas_onboarding;
CREATE POLICY "Usuários podem criar notas"
  ON public.notas_onboarding FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Usuários podem atualizar suas notas" ON public.notas_onboarding;
CREATE POLICY "Usuários podem atualizar suas notas"
  ON public.notas_onboarding FOR UPDATE
  USING (
    auth.uid() = created_by 
    OR is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('grs', 'gestor', 'admin')
    )
  );

DROP POLICY IF EXISTS "Usuários podem deletar suas notas" ON public.notas_onboarding;
CREATE POLICY "Usuários podem deletar suas notas"
  ON public.notas_onboarding FOR DELETE
  USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- 5️⃣ Storage Bucket para notas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notas-onboarding', 
  'notas-onboarding', 
  false,
  10485760, -- 10MB
  ARRAY['text/plain', 'text/markdown', 'application/pdf', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- 6️⃣ Storage Policies
DROP POLICY IF EXISTS "Usuários podem fazer upload de notas" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de notas"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notas-onboarding' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Usuários podem ver suas notas" ON storage.objects;
CREATE POLICY "Usuários podem ver suas notas"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'notas-onboarding' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar seus arquivos" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus arquivos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'notas-onboarding' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Usuários podem deletar seus arquivos" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus arquivos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'notas-onboarding' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7️⃣ Função helper para buscar insights agregados
CREATE OR REPLACE FUNCTION public.fn_agregar_insights_notas(p_cliente_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_insights JSONB;
BEGIN
  SELECT jsonb_build_object(
    'objetivos', COALESCE(jsonb_agg(DISTINCT insight->>'objetivos') FILTER (WHERE insight->'insights'->>'objetivos' IS NOT NULL), '[]'::jsonb),
    'publico_alvo', COALESCE(jsonb_agg(DISTINCT insight->>'publico_alvo') FILTER (WHERE insight->'insights'->>'publico_alvo' IS NOT NULL), '[]'::jsonb),
    'concorrentes', COALESCE(jsonb_agg(DISTINCT insight->>'concorrentes') FILTER (WHERE insight->'insights'->>'concorrentes' IS NOT NULL), '[]'::jsonb),
    'dores', COALESCE(jsonb_agg(DISTINCT insight->>'dores') FILTER (WHERE insight->'insights'->>'dores' IS NOT NULL), '[]'::jsonb),
    'oportunidades', COALESCE(jsonb_agg(DISTINCT insight->>'oportunidades') FILTER (WHERE insight->'insights'->>'oportunidades' IS NOT NULL), '[]'::jsonb),
    'total_notas', COUNT(*),
    'score_medio', ROUND(AVG(relevancia_score), 2)
  )
  INTO v_insights
  FROM public.notas_onboarding
  WHERE cliente_id = p_cliente_id
    AND is_active = TRUE
    AND analise_ia IS NOT NULL;
  
  RETURN COALESCE(v_insights, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;