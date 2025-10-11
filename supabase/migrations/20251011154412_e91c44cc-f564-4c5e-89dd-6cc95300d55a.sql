-- ============================================
-- SISTEMA DE MÓDULOS DINÂMICOS
-- ============================================

-- Tabela de módulos principais
CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icone TEXT NOT NULL DEFAULT 'LayoutDashboard',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  roles_permitidos user_role[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de submódulos
CREATE TABLE IF NOT EXISTS public.submodulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  rota TEXT NOT NULL,
  icone TEXT NOT NULL DEFAULT 'Circle',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(modulo_id, slug)
);

-- Tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS public.permissoes_modulo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_slug TEXT NOT NULL,
  role user_role NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(modulo_slug, role)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_modulos_slug ON public.modulos(slug);
CREATE INDEX IF NOT EXISTS idx_modulos_ordem ON public.modulos(ordem);
CREATE INDEX IF NOT EXISTS idx_submodulos_modulo_id ON public.submodulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_submodulos_ordem ON public.submodulos(ordem);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo_slug ON public.permissoes_modulo(modulo_slug);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo_role ON public.permissoes_modulo(role);

-- RLS Policies
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submodulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_modulo ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar módulos e submódulos ativos
CREATE POLICY "Todos podem ver módulos ativos"
  ON public.modulos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Todos podem ver submódulos ativos"
  ON public.submodulos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Todos podem ver permissões"
  ON public.permissoes_modulo FOR SELECT
  USING (true);

-- Apenas admin pode gerenciar
CREATE POLICY "Admin gerencia módulos"
  ON public.modulos FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin gerencia submódulos"
  ON public.submodulos FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin gerencia permissões"
  ON public.permissoes_modulo FOR ALL
  USING (is_admin(auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_modulos_updated_at
  BEFORE UPDATE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION update_tarefa_updated_at();

CREATE TRIGGER update_submodulos_updated_at
  BEFORE UPDATE ON public.submodulos
  FOR EACH ROW
  EXECUTE FUNCTION update_tarefa_updated_at();

CREATE TRIGGER update_permissoes_modulo_updated_at
  BEFORE UPDATE ON public.permissoes_modulo
  FOR EACH ROW
  EXECUTE FUNCTION update_tarefa_updated_at();

-- Popular com dados iniciais (módulos principais do sistema)
INSERT INTO public.modulos (nome, slug, icone, ordem, roles_permitidos) VALUES
  ('Início', 'inicio', 'Home', 1, ARRAY['admin', 'grs', 'atendimento', 'designer', 'filmmaker', 'gestor', 'financeiro', 'cliente', 'trafego', 'fornecedor']::user_role[]),
  ('Clientes', 'clientes', 'Users', 2, ARRAY['admin', 'grs', 'atendimento', 'gestor']::user_role[]),
  ('Projetos', 'projetos', 'FolderKanban', 3, ARRAY['admin', 'grs', 'atendimento', 'designer', 'filmmaker', 'gestor']::user_role[]),
  ('GRS', 'grs', 'Target', 4, ARRAY['admin', 'grs', 'gestor']::user_role[]),
  ('Design', 'design', 'Palette', 5, ARRAY['admin', 'designer', 'gestor', 'grs']::user_role[]),
  ('Audiovisual', 'audiovisual', 'Video', 6, ARRAY['admin', 'filmmaker', 'gestor', 'grs']::user_role[]),
  ('Tráfego', 'trafego', 'TrendingUp', 7, ARRAY['admin', 'trafego', 'gestor']::user_role[]),
  ('Financeiro', 'financeiro', 'DollarSign', 8, ARRAY['admin', 'financeiro', 'gestor']::user_role[]),
  ('RH', 'rh', 'UserCog', 9, ARRAY['admin', 'gestor']::user_role[]),
  ('Administrativo', 'administrativo', 'FileText', 10, ARRAY['admin', 'atendimento', 'gestor']::user_role[]),
  ('Inteligência', 'inteligencia', 'Brain', 11, ARRAY['admin', 'gestor', 'grs']::user_role[]),
  ('Configurações', 'configuracoes', 'Settings', 99, ARRAY['admin', 'gestor']::user_role[])
ON CONFLICT (slug) DO NOTHING;

-- Popular submódulos do módulo Início
INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Favoritos', 'favoritos', '/inicio/favoritos', 'Star', 1
FROM public.modulos m WHERE m.slug = 'inicio'
ON CONFLICT (modulo_id, slug) DO NOTHING;

INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Recentes', 'recentes', '/inicio/recentes', 'Clock', 2
FROM public.modulos m WHERE m.slug = 'inicio'
ON CONFLICT (modulo_id, slug) DO NOTHING;

-- Popular submódulos do módulo Inteligência
INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Métricas', 'metricas', '/inteligencia/metricas', 'BarChart3', 1
FROM public.modulos m WHERE m.slug = 'inteligencia'
ON CONFLICT (modulo_id, slug) DO NOTHING;

INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Análises', 'analises', '/inteligencia/analises', 'PieChart', 2
FROM public.modulos m WHERE m.slug = 'inteligencia'
ON CONFLICT (modulo_id, slug) DO NOTHING;

INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Insights', 'insights', '/inteligencia/insights', 'Lightbulb', 3
FROM public.modulos m WHERE m.slug = 'inteligencia'
ON CONFLICT (modulo_id, slug) DO NOTHING;

INSERT INTO public.submodulos (modulo_id, nome, slug, rota, icone, ordem)
SELECT m.id, 'Previsões', 'previsoes', '/inteligencia/previsoes', 'TrendingUp', 4
FROM public.modulos m WHERE m.slug = 'inteligencia'
ON CONFLICT (modulo_id, slug) DO NOTHING;

COMMENT ON TABLE public.modulos IS 'Módulos principais do sistema com controle de acesso por role';
COMMENT ON TABLE public.submodulos IS 'Submódulos/rotas de cada módulo principal';
COMMENT ON TABLE public.permissoes_modulo IS 'Permissões detalhadas por módulo e role';