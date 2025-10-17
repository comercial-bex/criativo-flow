-- FASE 1: POPULAÇÃO DE DADOS AUDIOVISUAL (ESTRUTURA CORRETA)

-- 1.1 Criar 3 Clientes de Teste
INSERT INTO public.clientes (id, nome, email, telefone, cnpj_cpf, status, responsavel_id, created_at)
SELECT 
  gen_random_uuid(),
  'Cliente ' || serie || ' Audiovisual',
  'cliente' || serie || '@audiovisualtest.com',
  '11987654' || LPAD(serie::text, 3, '0'),
  LPAD((serie * 11111111111)::text, 14, '0'),
  'ativo',
  (SELECT id FROM profiles WHERE especialidade = 'audiovisual' LIMIT 1),
  NOW() - INTERVAL '30 days' * serie
FROM generate_series(1, 3) AS serie
WHERE NOT EXISTS (
  SELECT 1 FROM clientes WHERE nome LIKE 'Cliente % Audiovisual'
);

-- 1.2 Popular 5 Projetos Audiovisual
WITH clientes_test AS (
  SELECT id, nome FROM clientes WHERE nome LIKE 'Cliente % Audiovisual' ORDER BY created_at DESC LIMIT 3
),
especialista_av AS (
  SELECT id FROM profiles WHERE especialidade = 'audiovisual' LIMIT 1
)
INSERT INTO public.projetos_audiovisual (
  id, titulo, tipo_projeto, planejamento_id, deadline, status_review, 
  feedback_cliente, especialista_id, created_at
)
SELECT
  gen_random_uuid(),
  CASE 
    WHEN serie = 1 THEN 'Vídeo Institucional - ' || c.nome
    WHEN serie = 2 THEN 'Motion Graphics - Campanha Q1 - ' || c.nome
    WHEN serie = 3 THEN 'Edição de Reel - ' || c.nome
    WHEN serie = 4 THEN 'Fotografia Corporativa - ' || c.nome
    WHEN serie = 5 THEN 'Animação 3D - Produto - ' || c.nome
  END,
  CASE 
    WHEN serie IN (1, 3) THEN 'video'
    WHEN serie = 2 THEN 'motion'
    WHEN serie = 4 THEN 'foto'
    WHEN serie = 5 THEN 'animacao'
  END,
  NULL,
  CURRENT_DATE + INTERVAL '7 days' * serie,
  CASE 
    WHEN serie = 1 THEN 'aguardando'
    WHEN serie = 2 THEN 'em_andamento'
    WHEN serie = 3 THEN 'review'
    WHEN serie = 4 THEN 'revisao'
    WHEN serie = 5 THEN 'aprovado'
  END,
  CASE 
    WHEN serie = 3 THEN 'Excelente trabalho! Pode prosseguir.'
    WHEN serie = 4 THEN 'Ajustar cores na abertura.'
    ELSE NULL
  END,
  (SELECT id FROM especialista_av),
  NOW() - INTERVAL '5 days' * serie
FROM generate_series(1, 5) AS serie
CROSS JOIN clientes_test c
WHERE serie <= 5
LIMIT 5;

-- 1.3 Popular 4 Captações Agenda
WITH clientes_test AS (
  SELECT id FROM clientes WHERE nome LIKE 'Cliente % Audiovisual' ORDER BY created_at DESC LIMIT 3
),
especialista_av AS (
  SELECT id FROM profiles WHERE especialidade = 'audiovisual' LIMIT 1
)
INSERT INTO public.captacoes_agenda (
  id, titulo, cliente_id, especialista_id, data_captacao, local, 
  equipamentos, status, observacoes, created_at
)
SELECT
  gen_random_uuid(),
  CASE 
    WHEN serie = 1 THEN 'Captação Externa - Escritório'
    WHEN serie = 2 THEN 'Gravação Interna - Estúdio'
    WHEN serie = 3 THEN 'Captação Evento - Feira'
    WHEN serie = 4 THEN 'Gravação Depoimento'
  END,
  (SELECT id FROM clientes_test ORDER BY random() LIMIT 1),
  (SELECT id FROM especialista_av),
  CASE 
    WHEN serie = 1 THEN CURRENT_TIMESTAMP + INTERVAL '2 days'
    WHEN serie = 2 THEN CURRENT_TIMESTAMP + INTERVAL '5 days'
    WHEN serie = 3 THEN CURRENT_TIMESTAMP + INTERVAL '10 days'
    WHEN serie = 4 THEN CURRENT_TIMESTAMP + INTERVAL '15 days'
  END,
  CASE 
    WHEN serie = 1 THEN 'Av. Paulista, 1000 - São Paulo/SP'
    WHEN serie = 2 THEN 'Estúdio A - Sede'
    WHEN serie = 3 THEN 'Expo Center Norte - São Paulo/SP'
    WHEN serie = 4 THEN 'Online (Zoom)'
  END,
  CASE 
    WHEN serie IN (1, 3) THEN ARRAY['Câmera 4K', 'Drone', 'Estabilizador']
    WHEN serie = 2 THEN ARRAY['Câmera Cinema', 'Iluminação LED', 'Microfone Boom']
    WHEN serie = 4 THEN ARRAY['Webcam 4K', 'Ring Light']
  END,
  CASE 
    WHEN serie <= 2 THEN 'agendado'
    WHEN serie = 3 THEN 'em_andamento'
    WHEN serie = 4 THEN 'concluido'
  END,
  CASE 
    WHEN serie = 1 THEN 'Captação externa - confirmar condições climáticas'
    WHEN serie = 3 THEN 'Feira de tecnologia - muita gente esperada'
    ELSE NULL
  END,
  NOW() - INTERVAL '2 days' * serie
FROM generate_series(1, 4) AS serie;

-- 1.4 Popular Gamificação com estrutura CORRETA
WITH especialistas_av AS (
  SELECT id FROM profiles WHERE especialidade = 'audiovisual' LIMIT 5
)
INSERT INTO public.gamificacao_usuarios (
  user_id, setor, pontos_totais, pontos_mes_atual, posicao_ranking, 
  selos_conquistados, created_at
)
SELECT
  id,
  'audiovisual',
  FLOOR(random() * 1000 + 500)::INTEGER,
  FLOOR(random() * 200 + 50)::INTEGER,
  FLOOR(random() * 10 + 1)::INTEGER,
  jsonb_build_object(
    'tarefas_concluidas', FLOOR(random() * 20 + 5),
    'horas_trabalhadas', FLOOR(random() * 80 + 20),
    'captacoes_realizadas', FLOOR(random() * 10 + 2),
    'projetos_entregues', FLOOR(random() * 5 + 1)
  ),
  NOW() - INTERVAL '60 days'
FROM especialistas_av
ON CONFLICT (user_id) DO UPDATE SET
  pontos_totais = EXCLUDED.pontos_totais,
  pontos_mes_atual = EXCLUDED.pontos_mes_atual,
  selos_conquistados = EXCLUDED.selos_conquistados;