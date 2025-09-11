-- Popular banco com dados simulados para testes (corrigido)

-- Inserir clientes simulados
INSERT INTO public.clientes (id, nome, email, telefone, cnpj_cpf, endereco, status, responsavel_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Tech Solutions Ltda', 'contato@techsolutions.com', '(11) 99999-9999', '12.345.678/0001-90', 'São Paulo, SP', 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Inovação Corp', 'comercial@inovacao.com', '(21) 88888-8888', '98.765.432/0001-10', 'Rio de Janeiro, RJ', 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Loja Virtual Plus', 'suporte@lojavirtual.com', '(31) 77777-7777', '11.222.333/0001-44', 'Belo Horizonte, MG', 'pendente', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Empresa Inativa S.A.', 'contato@empresainativa.com', '(41) 66666-6666', '55.666.777/0001-88', 'Curitiba, PR', 'inativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440005', 'StartupTech Ltda', 'hello@startuptech.com', '(51) 55555-5555', '99.888.777/0001-66', 'Porto Alegre, RS', 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Inserir projetos simulados
INSERT INTO public.projetos (id, nome, descricao, cliente_id, orcamento, data_inicio, data_fim, status, responsavel_id, created_at, updated_at)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', 'Campanha Digital Q1', 'Campanha de marketing digital para o primeiro trimestre', '550e8400-e29b-41d4-a716-446655440001', 45000.00, '2024-01-15', '2024-03-30', 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('650e8400-e29b-41d4-a716-446655440002', 'Website Institucional', 'Desenvolvimento de website institucional responsivo', '550e8400-e29b-41d4-a716-446655440001', 25000.00, '2024-02-01', NULL, 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('650e8400-e29b-41d4-a716-446655440003', 'Rebranding Completo', 'Projeto completo de rebranding da empresa', '550e8400-e29b-41d4-a716-446655440001', 80000.00, '2023-11-01', '2024-01-20', 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('650e8400-e29b-41d4-a716-446655440004', 'App Mobile', 'Desenvolvimento de aplicativo mobile nativo', '550e8400-e29b-41d4-a716-446655440002', 120000.00, '2024-01-10', NULL, 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('650e8400-e29b-41d4-a716-446655440005', 'Sistema CRM', 'Implementação de sistema CRM customizado', '550e8400-e29b-41d4-a716-446655440002', 75000.00, '2024-03-01', NULL, 'pendente', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now()),
  ('650e8400-e29b-41d4-a716-446655440006', 'MVP Development', 'Desenvolvimento do MVP da startup', '550e8400-e29b-41d4-a716-446655440005', 35000.00, '2024-02-01', NULL, 'ativo', '241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Inserir um perfil de usuário simulado se não existir
INSERT INTO public.profiles (id, nome, email, telefone, created_at, updated_at)
VALUES ('241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', 'Jefferson Silva', 'jefferson@agenciabex.com.br', '(11) 99999-9999', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Inserir papel de usuário se não existir
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('241f7ab4-1b4a-4cf7-b917-e5662f4fb76c', 'admin', now())
ON CONFLICT (user_id, role) DO NOTHING;