-- =============================================
-- MIGRAÇÃO: Sistema Completo de Plano Editorial
-- =============================================

-- 1️⃣ CRIAR TABELA DE PERSONAS
CREATE TABLE IF NOT EXISTS public.clientes_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  idade_faixa TEXT,
  ocupacao TEXT,
  caracteristicas TEXT[],
  necessidades TEXT[],
  dores TEXT[],
  objetivos TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca por cliente
CREATE INDEX IF NOT EXISTS idx_personas_cliente ON public.clientes_personas(cliente_id);

-- RLS para personas
ALTER TABLE public.clientes_personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver personas de seus clientes" ON public.clientes_personas;
CREATE POLICY "Usuários podem ver personas de seus clientes"
  ON public.clientes_personas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuários podem criar personas" ON public.clientes_personas;
CREATE POLICY "Usuários podem criar personas"
  ON public.clientes_personas FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar personas" ON public.clientes_personas;
CREATE POLICY "Usuários podem atualizar personas"
  ON public.clientes_personas FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Usuários podem deletar personas" ON public.clientes_personas;
CREATE POLICY "Usuários podem deletar personas"
  ON public.clientes_personas FOR DELETE
  USING (true);

-- 2️⃣ ADICIONAR CAMPOS DE MISSÃO E POSICIONAMENTO
ALTER TABLE public.cliente_onboarding 
ADD COLUMN IF NOT EXISTS missao TEXT,
ADD COLUMN IF NOT EXISTS posicionamento TEXT,
ADD COLUMN IF NOT EXISTS objetivos_comunicacao TEXT[];

-- 3️⃣ CRIAR ENUM PARA STATUS DE POSTS
DO $$ BEGIN
  CREATE TYPE post_status_type AS ENUM ('a_fazer', 'em_producao', 'pronto', 'publicado', 'temporario');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4️⃣ ADICIONAR CAMPOS DE ARQUIVO VISUAL E ATUALIZAR STATUS
ALTER TABLE public.posts_planejamento 
ADD COLUMN IF NOT EXISTS arquivo_visual_url TEXT,
ADD COLUMN IF NOT EXISTS arquivo_visual_tipo TEXT,
ADD COLUMN IF NOT EXISTS arquivo_visual_nome TEXT,
ADD COLUMN IF NOT EXISTS status_post post_status_type DEFAULT 'a_fazer';

-- 5️⃣ CRIAR BUCKET DE STORAGE PARA ARQUIVOS VISUAIS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-visuals',
  'post-visuals',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 6️⃣ POLÍTICAS DE STORAGE PARA ARQUIVOS VISUAIS (só cria se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Arquivos visuais post são públicos'
  ) THEN
    CREATE POLICY "Arquivos visuais post são públicos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'post-visuals');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Upload de arquivos post autenticado'
  ) THEN
    CREATE POLICY "Upload de arquivos post autenticado"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'post-visuals' AND
        auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Atualizar arquivos post autenticado'
  ) THEN
    CREATE POLICY "Atualizar arquivos post autenticado"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'post-visuals' AND
        auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Deletar arquivos post autenticado'
  ) THEN
    CREATE POLICY "Deletar arquivos post autenticado"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'post-visuals' AND
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 7️⃣ TRIGGER PARA UPDATED_AT EM PERSONAS
CREATE OR REPLACE FUNCTION update_personas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_personas_updated_at ON public.clientes_personas;
CREATE TRIGGER trigger_update_personas_updated_at
  BEFORE UPDATE ON public.clientes_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_personas_updated_at();