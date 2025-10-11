-- Criar módulo CRM
INSERT INTO modulos (nome, slug, icone, ordem, roles_permitidos, ativo) 
VALUES ('CRM', 'crm', 'Users', 4, ARRAY['admin','grs','atendimento','gestor']::user_role[], true)
ON CONFLICT (slug) DO NOTHING;

-- Criar submódulos CRM
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'crm'), 'Funil de Vendas', 'funil', '/crm', 'Target', 1, true),
((SELECT id FROM modulos WHERE slug = 'crm'), 'Contatos', 'contatos', '/crm/contatos', 'Phone', 2, true),
((SELECT id FROM modulos WHERE slug = 'crm'), 'Histórico', 'historico', '/crm/historico', 'History', 3, true)
ON CONFLICT (modulo_id, slug) DO NOTHING;

-- Adicionar submódulo Especialistas ao módulo Clientes
INSERT INTO submodulos (modulo_id, nome, slug, rota, icone, ordem, ativo) VALUES
((SELECT id FROM modulos WHERE slug = 'clientes'), 'Especialistas', 'especialistas', '/especialistas', 'UserCheck', 3, true)
ON CONFLICT (modulo_id, slug) DO NOTHING;

-- Reorganizar ordem dos módulos para CRM aparecer após Clientes
UPDATE modulos SET ordem = 4 WHERE slug = 'crm';
UPDATE modulos SET ordem = 5 WHERE slug = 'projetos';
UPDATE modulos SET ordem = 6 WHERE slug = 'grs';
UPDATE modulos SET ordem = 7 WHERE slug = 'design';
UPDATE modulos SET ordem = 8 WHERE slug = 'audiovisual';
UPDATE modulos SET ordem = 9 WHERE slug = 'trafego';
UPDATE modulos SET ordem = 10 WHERE slug = 'financeiro';
UPDATE modulos SET ordem = 11 WHERE slug = 'rh';
UPDATE modulos SET ordem = 12 WHERE slug = 'administrativo';
UPDATE modulos SET ordem = 13 WHERE slug = 'admin';
UPDATE modulos SET ordem = 14 WHERE slug = 'calendario';
UPDATE modulos SET ordem = 15 WHERE slug = 'configuracoes';