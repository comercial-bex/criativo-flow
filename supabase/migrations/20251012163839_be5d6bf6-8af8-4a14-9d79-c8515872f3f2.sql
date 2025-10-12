-- ============================================
-- TABELA: roteiros
-- ============================================
CREATE TYPE plataforma_roteiro AS ENUM (
  'reels',
  'tiktok',
  'short',
  'vt',
  'institucional',
  'spot_radio',
  'doc',
  'outro'
);

CREATE TYPE status_roteiro AS ENUM (
  'rascunho',
  'em_revisao',
  'aprovado',
  'publicado'
);

CREATE TYPE provedor_ia_roteiro AS ENUM (
  'openai',
  'google',
  'azure_openai',
  'lovable_ai',
  'outro'
);

CREATE TABLE public.roteiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Vínculos
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE NOT NULL,
  tarefa_id UUID REFERENCES public.tarefa(id) ON DELETE SET NULL,
  
  -- Metadados principais
  titulo TEXT NOT NULL,
  plataforma plataforma_roteiro NOT NULL DEFAULT 'reels',
  objetivo TEXT,
  duracao_prevista_seg INTEGER NOT NULL DEFAULT 60,
  
  -- Tom & Estilo (arrays JSON)
  tom JSONB DEFAULT '["humanizado"]'::jsonb,
  estilo JSONB DEFAULT '["narrativo"]'::jsonb,
  persona_voz TEXT DEFAULT 'Guilherme – social media, meigo, PT-BR padrão, toques regionais do Norte',
  
  -- Conteúdo
  pilares_mensagem JSONB DEFAULT '[]'::jsonb,
  publico_alvo JSONB DEFAULT '[]'::jsonb,
  cta TEXT,
  hashtags TEXT,
  referencias JSONB DEFAULT '[]'::jsonb,
  
  -- Roteiro em si
  roteiro_markdown TEXT,
  roteiro_struct JSONB,
  
  -- Controle de versão
  status status_roteiro NOT NULL DEFAULT 'rascunho',
  versao INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES public.roteiros(id) ON DELETE SET NULL,
  
  -- Storage
  storage_pdf_path TEXT,
  hash_publico TEXT UNIQUE,
  
  -- IA metadata
  provedor_ia provedor_ia_roteiro DEFAULT 'lovable_ai',
  prompt_usado TEXT,
  tokens_custos JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_roteiros_cliente ON public.roteiros(cliente_id);
CREATE INDEX idx_roteiros_projeto ON public.roteiros(projeto_id);
CREATE INDEX idx_roteiros_tarefa ON public.roteiros(tarefa_id);
CREATE INDEX idx_roteiros_status ON public.roteiros(status);
CREATE INDEX idx_roteiros_created_by ON public.roteiros(created_by);
CREATE INDEX idx_roteiros_parent ON public.roteiros(parent_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.roteiros ENABLE ROW LEVEL SECURITY;

-- Admin vê tudo
CREATE POLICY "Admins gerenciam roteiros"
ON public.roteiros FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- GRS vê roteiros dos seus clientes
CREATE POLICY "GRS vê roteiros dos seus clientes"
ON public.roteiros FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'grs' AND
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.responsavel_id = auth.uid()
  )
);

-- GRS cria roteiros
CREATE POLICY "GRS cria roteiros"
ON public.roteiros FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'grs');

-- GRS atualiza seus roteiros
CREATE POLICY "GRS atualiza roteiros"
ON public.roteiros FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'gestor'
);

-- Executores visualizam roteiros das suas tarefas
CREATE POLICY "Executores veem roteiros vinculados"
ON public.roteiros FOR SELECT
TO authenticated
USING (
  tarefa_id IN (
    SELECT t.id FROM public.tarefa t
    WHERE t.executor_id = auth.uid()
  )
);

-- Clientes veem roteiros aprovados
CREATE POLICY "Clientes veem roteiros aprovados"
ON public.roteiros FOR SELECT
TO authenticated
USING (
  status IN ('aprovado', 'publicado') AND
  cliente_id IN (
    SELECT p.cliente_id FROM public.profiles p
    WHERE p.id = auth.uid()
  )
);

-- ============================================
-- TABELA: comentarios_roteiro
-- ============================================
CREATE TABLE public.comentarios_roteiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roteiro_id UUID REFERENCES public.roteiros(id) ON DELETE CASCADE NOT NULL,
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comentarios_roteiro ON public.comentarios_roteiro(roteiro_id);

ALTER TABLE public.comentarios_roteiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem comentários de roteiros que acessam"
ON public.comentarios_roteiro FOR SELECT
TO authenticated
USING (
  roteiro_id IN (SELECT id FROM public.roteiros)
);

CREATE POLICY "Usuários criam comentários"
ON public.comentarios_roteiro FOR INSERT
TO authenticated
WITH CHECK (autor_id = auth.uid());

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('roteiros', 'roteiros', false)
ON CONFLICT DO NOTHING;

-- RLS para storage (Admin e GRS upload)
CREATE POLICY "GRS e Admin fazem upload de PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'roteiros' AND
  (
    is_admin(auth.uid()) OR
    get_user_role(auth.uid()) = 'grs'
  )
);

CREATE POLICY "Usuários baixam PDFs de roteiros que acessam"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'roteiros' AND
  name IN (
    SELECT storage_pdf_path FROM public.roteiros
  )
);

-- Trigger de updated_at
CREATE TRIGGER update_roteiros_updated_at
BEFORE UPDATE ON public.roteiros
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comentarios_roteiro_updated_at
BEFORE UPDATE ON public.comentarios_roteiro
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();