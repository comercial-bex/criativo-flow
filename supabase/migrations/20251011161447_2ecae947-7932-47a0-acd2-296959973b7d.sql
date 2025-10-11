-- FASE 1: Popular todos os submódulos faltantes (SEM roles_permitidos)

-- 1.1 Módulo "Clientes"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'clientes'), 'Listagem', 'listagem', '/clientes', 'Users', 1, true),
((SELECT id FROM modulos WHERE slug = 'clientes'), 'CRM', 'crm', '/crm', 'Target', 2, true);

-- 1.2 Módulo "Projetos"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'projetos'), 'Todos', 'todos', '/cliente/projetos', 'FolderKanban', 1, true),
((SELECT id FROM modulos WHERE slug = 'projetos'), 'Audiovisual', 'audiovisual', '/audiovisual/projetos', 'Video', 2, true);

-- 1.3 Módulo "GRS"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'grs'), 'Dashboard', 'dashboard', '/grs/dashboard', 'LayoutDashboard', 1, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Planejamentos', 'planejamentos', '/grs/planejamentos', 'Calendar', 2, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Tarefas', 'tarefas', '/grs/tarefas-unificadas', 'CheckSquare', 3, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Calendário', 'calendario', '/grs/calendario-editorial', 'CalendarDays', 4, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Aprovações', 'aprovacoes', '/grs/aprovacoes', 'ThumbsUp', 5, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Relatórios', 'relatorios', '/grs/relatorios', 'FileText', 6, true),
((SELECT id FROM modulos WHERE slug = 'grs'), 'Projetos', 'projetos', '/grs/projetos', 'Briefcase', 7, true);

-- 1.4 Módulo "Design"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'design'), 'Dashboard', 'dashboard', '/design/dashboard', 'LayoutDashboard', 1, true),
((SELECT id FROM modulos WHERE slug = 'design'), 'Minhas Tarefas', 'tarefas', '/design/minhas-tarefas', 'CheckSquare', 2, true),
((SELECT id FROM modulos WHERE slug = 'design'), 'Biblioteca', 'biblioteca', '/design/biblioteca', 'BookOpen', 3, true),
((SELECT id FROM modulos WHERE slug = 'design'), 'Calendário', 'calendario', '/design/calendario', 'Calendar', 4, true),
((SELECT id FROM modulos WHERE slug = 'design'), 'Metas', 'metas', '/design/metas', 'Target', 5, true),
((SELECT id FROM modulos WHERE slug = 'design'), 'Aprovações', 'aprovacoes', '/design/aprovacoes', 'ThumbsUp', 6, true);

-- 1.5 Módulo "Audiovisual"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'audiovisual'), 'Dashboard', 'dashboard', '/audiovisual/dashboard', 'Video', 1, true),
((SELECT id FROM modulos WHERE slug = 'audiovisual'), 'Minhas Tarefas', 'tarefas', '/audiovisual/minhas-tarefas', 'CheckSquare', 2, true),
((SELECT id FROM modulos WHERE slug = 'audiovisual'), 'Captações', 'captacoes', '/audiovisual/captacoes', 'Camera', 3, true),
((SELECT id FROM modulos WHERE slug = 'audiovisual'), 'Projetos', 'projetos', '/audiovisual/projetos', 'Film', 4, true),
((SELECT id FROM modulos WHERE slug = 'audiovisual'), 'Equipamentos', 'equipamentos', '/audiovisual/equipamentos', 'Package', 5, true);

-- 1.6 Módulo "Tráfego"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'trafego'), 'Dashboard', 'dashboard', '/trafego/dashboard', 'TrendingUp', 1, true);

-- 1.7 Módulo "Financeiro"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'financeiro'), 'Dashboard', 'dashboard', '/financeiro/dashboard', 'TrendingUp', 1, true),
((SELECT id FROM modulos WHERE slug = 'financeiro'), 'Produtos', 'produtos', '/financeiro/produtos', 'Package', 2, true),
((SELECT id FROM modulos WHERE slug = 'financeiro'), 'Balancete', 'balancete', '/financeiro/balancete-contabil', 'FileSpreadsheet', 3, true),
((SELECT id FROM modulos WHERE slug = 'financeiro'), 'Balanço', 'balanco', '/financeiro/balanco-patrimonial', 'Scale', 4, true),
((SELECT id FROM modulos WHERE slug = 'financeiro'), 'Folha', 'folha', '/financeiro/folha-pagamento', 'Users2', 5, true);

-- 1.8 Módulo "RH"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'rh'), 'Pessoas', 'pessoas', '/rh/pessoas', 'Users', 1, true),
((SELECT id FROM modulos WHERE slug = 'rh'), 'Colaboradores', 'colaboradores', '/rh/colaboradores', 'UserCheck', 2, true),
((SELECT id FROM modulos WHERE slug = 'rh'), 'Ponto', 'ponto', '/rh/ponto', 'Clock', 3, true),
((SELECT id FROM modulos WHERE slug = 'rh'), 'Folha Ponto', 'folha-ponto', '/rh/folha-ponto', 'ClipboardList', 4, true);

-- 1.9 Módulo "Administrativo"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'administrativo'), 'Dashboard', 'dashboard', '/administrativo/dashboard', 'LayoutDashboard', 1, true),
((SELECT id FROM modulos WHERE slug = 'administrativo'), 'Orçamentos', 'orcamentos', '/administrativo/orcamentos', 'Calculator', 2, true),
((SELECT id FROM modulos WHERE slug = 'administrativo'), 'Propostas', 'propostas', '/administrativo/propostas', 'FileText', 3, true),
((SELECT id FROM modulos WHERE slug = 'administrativo'), 'Contratos', 'contratos', '/admin/contratos', 'FileSignature', 4, true),
((SELECT id FROM modulos WHERE slug = 'administrativo'), 'Templates', 'templates', '/admin/contract-templates', 'FileCode', 5, true);

-- 1.10 Módulo "Configurações"
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'configuracoes'), 'Geral', 'geral', '/configuracoes', 'Settings', 1, true),
((SELECT id FROM modulos WHERE slug = 'configuracoes'), 'Funções', 'funcoes', '/configuracoes/funcoes', 'Users', 2, true);

-- 1.11 Criar Módulo "Admin" + Submódulos
INSERT INTO modulos (nome, slug, icone, ordem, roles_permitidos, ativo) VALUES
('Admin', 'admin', 'Shield', 12, ARRAY['admin']::user_role[], true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'admin'), 'Painel', 'painel', '/admin/painel', 'Shield', 1, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Notificações', 'notificacoes', '/admin/central-notificacoes', 'Bell', 2, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Tarefas', 'tarefas', '/admin/tarefas', 'ClipboardCheck', 3, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Usuários', 'usuarios', '/usuarios', 'Users2', 4, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Especialistas', 'especialistas', '/especialistas', 'UserCog', 5, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Equipamentos', 'equipamentos', '/inventario', 'Package', 6, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Sistema', 'sistema', '/admin/system-health', 'Settings', 7, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Homologação', 'homologacao', '/admin/homologacao-mvp', 'ClipboardList', 8, true),
((SELECT id FROM modulos WHERE slug = 'admin'), 'Logs', 'logs', '/admin/logs', 'Activity', 9, true);

-- 1.12 Criar Módulo "Calendário"
INSERT INTO modulos (nome, slug, icone, ordem, roles_permitidos, ativo) VALUES
('Calendário', 'calendario', 'CalendarDays', 2, ARRAY['admin','grs','designer','filmmaker','gestor','atendimento']::user_role[], true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'calendario'), 'Multidisciplinar', 'multidisciplinar', '/calendario', 'Calendar', 1, true);