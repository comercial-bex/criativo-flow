-- ============================================
-- PACOTES BEX: Estrutura de Dados Completa
-- ============================================

-- 1. TABELA: pacotes (catálogo de planos)
CREATE TABLE IF NOT EXISTS public.pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('social', 'audiovisual', 'premium', 'avulso')),
  ativo BOOLEAN DEFAULT true,
  preco_base NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA: pacote_itens (itens/escopo de cada pacote)
CREATE TABLE IF NOT EXISTS public.pacote_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_id UUID REFERENCES public.pacotes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  skill TEXT NOT NULL CHECK (skill IN ('design', 'filmmaker', 'editor', 'motion', 'audio', 'social')),
  duracao_padrao_min INTEGER DEFAULT 60,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA: pacote_task_templates (templates de tarefas por item)
CREATE TABLE IF NOT EXISTS public.pacote_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_item_id UUID REFERENCES public.pacote_itens(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  skill TEXT NOT NULL CHECK (skill IN ('design', 'filmmaker', 'editor', 'motion', 'audio', 'social')),
  prazo_offset_dias INTEGER DEFAULT 3,
  depende_de TEXT[],
  anexos_obrigatorios TEXT[],
  checklist_items TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ALTERAR TABELA briefings para novos campos
ALTER TABLE public.briefings 
  ADD COLUMN IF NOT EXISTS pacote_id UUID REFERENCES public.pacotes(id),
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS tom TEXT,
  ADD COLUMN IF NOT EXISTS data_entrega DATE,
  ADD COLUMN IF NOT EXISTS veiculacao TEXT[],
  ADD COLUMN IF NOT EXISTS mensagem_chave TEXT,
  ADD COLUMN IF NOT EXISTS beneficios TEXT[],
  ADD COLUMN IF NOT EXISTS provas_sociais TEXT,
  ADD COLUMN IF NOT EXISTS cta TEXT,
  ADD COLUMN IF NOT EXISTS referencias_visuais JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS locucao TEXT,
  ADD COLUMN IF NOT EXISTS captacao TEXT[],
  ADD COLUMN IF NOT EXISTS ambiente TEXT,
  ADD COLUMN IF NOT EXISTS restricoes TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS paleta_fontes_url TEXT,
  ADD COLUMN IF NOT EXISTS manual_marca_url TEXT,
  ADD COLUMN IF NOT EXISTS status_briefing TEXT DEFAULT 'rascunho' CHECK (status_briefing IN ('rascunho', 'completo', 'aprovado')),
  ADD COLUMN IF NOT EXISTS projeto_gerado_id UUID REFERENCES public.projetos(id);

-- 5. SEEDS: Pacotes padrão
INSERT INTO public.pacotes (nome, slug, descricao, tipo, preco_base) VALUES
  ('Plano Social', 'plano-social', 'Pacote completo para gestão de redes sociais', 'social', 2500.00),
  ('Plano Audiovisual', 'plano-audiovisual', 'Produção audiovisual profissional', 'audiovisual', 5000.00),
  ('Plano Premium', 'plano-premium', 'Solução completa com estratégia + social + audiovisual', 'premium', 8500.00),
  ('Serviços Avulsos', 'servicos-avulsos', 'Serviços pontuais sob demanda', 'avulso', 0.00)
ON CONFLICT (slug) DO NOTHING;

-- 6. SEEDS: Itens do Plano Social
INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Cards Feed', 8, 'design', 30, 1
FROM public.pacotes p WHERE p.slug = 'plano-social'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Reels Curtos', 4, 'editor', 120, 2
FROM public.pacotes p WHERE p.slug = 'plano-social'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Copys Criativos', 8, 'social', 20, 3
FROM public.pacotes p WHERE p.slug = 'plano-social'
ON CONFLICT DO NOTHING;

-- 7. SEEDS: Itens do Plano Audiovisual
INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Roteiro Audiovisual', 1, 'social', 90, 1
FROM public.pacotes p WHERE p.slug = 'plano-audiovisual'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Captação Externa', 1, 'filmmaker', 240, 2
FROM public.pacotes p WHERE p.slug = 'plano-audiovisual'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Captação com Drone', 1, 'filmmaker', 120, 3
FROM public.pacotes p WHERE p.slug = 'plano-audiovisual'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Edição VT 30s', 1, 'editor', 180, 4
FROM public.pacotes p WHERE p.slug = 'plano-audiovisual'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_itens (pacote_id, nome, quantidade, skill, duracao_padrao_min, ordem)
SELECT p.id, 'Reels Tráfego', 2, 'motion', 90, 5
FROM public.pacotes p WHERE p.slug = 'plano-audiovisual'
ON CONFLICT DO NOTHING;

-- 8. SEEDS: Templates de tarefas (exemplo para audiovisual)
INSERT INTO public.pacote_task_templates (pacote_item_id, titulo, descricao, skill, prazo_offset_dias, depende_de, anexos_obrigatorios, checklist_items)
SELECT 
  pi.id,
  'Elaborar Roteiro',
  'Criar roteiro detalhado com base no briefing aprovado',
  'social',
  2,
  ARRAY[]::TEXT[],
  ARRAY['briefing.json']::TEXT[],
  ARRAY['Revisar objetivo', 'Definir blocos', 'Validar tom', 'Incluir CTA']::TEXT[]
FROM public.pacote_itens pi
JOIN public.pacotes p ON pi.pacote_id = p.id
WHERE p.slug = 'plano-audiovisual' AND pi.nome = 'Roteiro Audiovisual'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_task_templates (pacote_item_id, titulo, descricao, skill, prazo_offset_dias, depende_de, anexos_obrigatorios, checklist_items)
SELECT 
  pi.id,
  'Realizar Captação Externa',
  'Executar captação conforme roteiro e briefing',
  'filmmaker',
  5,
  ARRAY['Elaborar Roteiro']::TEXT[],
  ARRAY['roteiro.pdf', 'autorizacoes.pdf']::TEXT[],
  ARRAY['Conferir equipamentos', 'Validar locação', 'Gravar takes', 'Backup arquivos']::TEXT[]
FROM public.pacote_itens pi
JOIN public.pacotes p ON pi.pacote_id = p.id
WHERE p.slug = 'plano-audiovisual' AND pi.nome = 'Captação Externa'
ON CONFLICT DO NOTHING;

INSERT INTO public.pacote_task_templates (pacote_item_id, titulo, descricao, skill, prazo_offset_dias, depende_de, anexos_obrigatorios, checklist_items)
SELECT 
  pi.id,
  'Editar VT 30s',
  'Edição final do vídeo com correção de cor e áudio',
  'editor',
  8,
  ARRAY['Realizar Captação Externa', 'Elaborar Roteiro']::TEXT[],
  ARRAY['logo.zip', 'manual_marca.pdf']::TEXT[],
  ARRAY['Sincronizar áudio', 'Aplicar LUT', 'Inserir legendas', 'Adicionar CTA', 'Exportar versões']::TEXT[]
FROM public.pacote_itens pi
JOIN public.pacotes p ON pi.pacote_id = p.id
WHERE p.slug = 'plano-audiovisual' AND pi.nome = 'Edição VT 30s'
ON CONFLICT DO NOTHING;

-- 9. RLS POLICIES
ALTER TABLE public.pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacote_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacote_task_templates ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver pacotes
CREATE POLICY "Usuários autenticados podem ver pacotes"
  ON public.pacotes FOR SELECT
  TO authenticated
  USING (ativo = true);

-- Admin pode gerenciar pacotes
CREATE POLICY "Admin pode gerenciar pacotes"
  ON public.pacotes FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Todos autenticados podem ver itens de pacotes
CREATE POLICY "Usuários autenticados podem ver itens de pacotes"
  ON public.pacote_itens FOR SELECT
  TO authenticated
  USING (true);

-- Admin pode gerenciar itens
CREATE POLICY "Admin pode gerenciar itens de pacotes"
  ON public.pacote_itens FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Todos autenticados podem ver templates
CREATE POLICY "Usuários autenticados podem ver templates"
  ON public.pacote_task_templates FOR SELECT
  TO authenticated
  USING (true);

-- Admin pode gerenciar templates
CREATE POLICY "Admin pode gerenciar templates"
  ON public.pacote_task_templates FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 10. ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_pacote_itens_pacote_id ON public.pacote_itens(pacote_id);
CREATE INDEX IF NOT EXISTS idx_pacote_task_templates_item_id ON public.pacote_task_templates(pacote_item_id);
CREATE INDEX IF NOT EXISTS idx_briefings_pacote_id ON public.briefings(pacote_id);
CREATE INDEX IF NOT EXISTS idx_briefings_status ON public.briefings(status_briefing);