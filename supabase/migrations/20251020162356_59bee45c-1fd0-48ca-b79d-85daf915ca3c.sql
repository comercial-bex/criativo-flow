-- Add default "Não Definido" specialty using 'cliente' role
INSERT INTO public.especialidades (nome, role_sistema, cor, icone, categoria, ativo)
VALUES ('Não Definido', 'cliente', '#9CA3AF', '❓', 'geral', true)
ON CONFLICT DO NOTHING;