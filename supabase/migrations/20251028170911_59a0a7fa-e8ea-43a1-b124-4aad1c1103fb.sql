-- Inserção de todos os feriados regionais e comemorativos
-- Agora com constraint correta (data, tipo, estado, cidade)

INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Dia de São José', '2025-03-19', 'estadual', 'Padroeiro do Amapá', false, 'AP'),
  ('Cabralzinho', '2025-05-15', 'estadual', 'Dia de Cabralzinho', false, 'AP'),
  ('Data Magna do Estado', '2025-09-13', 'estadual', 'Criação do Ex-Território do Amapá', false, 'AP'),
  ('Dia da Consciência Negra', '2025-11-20', 'estadual', 'Consciência Negra - Feriado Estadual', false, 'AP'),
  ('Dia de São José', '2026-03-19', 'estadual', 'Padroeiro do Amapá', false, 'AP'),
  ('Cabralzinho', '2026-05-15', 'estadual', 'Dia de Cabralzinho', false, 'AP'),
  ('Data Magna do Estado', '2026-09-13', 'estadual', 'Criação do Ex-Território do Amapá', false, 'AP'),
  ('Dia da Consciência Negra', '2026-11-20', 'estadual', 'Consciência Negra - Feriado Estadual', false, 'AP');

INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Macapá', '2025-02-04', 'municipal', 'Aniversário da cidade de Macapá', false, 'AP', 'Macapá'),
  ('Nossa Senhora da Conceição', '2025-12-08', 'municipal', 'Padroeira de Macapá', false, 'AP', 'Macapá'),
  ('Aniversário de Macapá', '2026-02-04', 'municipal', 'Aniversário da cidade de Macapá', false, 'AP', 'Macapá'),
  ('Nossa Senhora da Conceição', '2026-12-08', 'municipal', 'Padroeira de Macapá', false, 'AP', 'Macapá');

INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Carnaval', '2025-03-03', 'facultativo', 'Segunda-feira de Carnaval', true, 'AP'),
  ('Carnaval', '2025-03-04', 'facultativo', 'Terça-feira de Carnaval', true, 'AP'),
  ('Quarta-feira de Cinzas', '2025-03-05', 'facultativo', 'Expediente até 14h', true, 'AP'),
  ('Corpus Christi', '2025-06-19', 'facultativo', 'Corpus Christi', true, 'AP'),
  ('Dia do Professor', '2025-10-15', 'facultativo', 'Dia do Professor', true, 'AP'),
  ('Dia do Servidor Público', '2025-10-28', 'facultativo', 'Dia do Servidor Público', true, 'AP'),
  ('Carnaval', '2026-02-16', 'facultativo', 'Segunda-feira de Carnaval', true, 'AP'),
  ('Carnaval', '2026-02-17', 'facultativo', 'Terça-feira de Carnaval', true, 'AP'),
  ('Quarta-feira de Cinzas', '2026-02-18', 'facultativo', 'Expediente até 14h', true, 'AP'),
  ('Corpus Christi', '2026-06-04', 'facultativo', 'Corpus Christi', true, 'AP'),
  ('Dia do Professor', '2026-10-15', 'facultativo', 'Dia do Professor', true, 'AP'),
  ('Dia do Servidor Público', '2026-10-28', 'facultativo', 'Dia do Servidor Público', true, 'AP');

INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo) VALUES
  ('Dia da Mentira', '2025-04-01', 'comemorativo', 'Dia da Mentira', false),
  ('Páscoa', '2025-04-20', 'comemorativo', 'Domingo de Páscoa', false),
  ('Dia das Mães', '2025-05-11', 'comemorativo', 'Segundo domingo de maio', false),
  ('Dia dos Namorados', '2025-06-12', 'comemorativo', 'Dia dos Namorados', false),
  ('Dia dos Pais', '2025-08-10', 'comemorativo', 'Segundo domingo de agosto', false),
  ('Dia da Mentira', '2026-04-01', 'comemorativo', 'Dia da Mentira', false),
  ('Páscoa', '2026-04-05', 'comemorativo', 'Domingo de Páscoa', false),
  ('Dia das Mães', '2026-05-10', 'comemorativo', 'Segundo domingo de maio', false),
  ('Dia dos Namorados', '2026-06-12', 'comemorativo', 'Dia dos Namorados', false),
  ('Dia dos Pais', '2026-08-09', 'comemorativo', 'Segundo domingo de agosto', false);

INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Criação do Estado do Amapá', '2025-10-05', 'comemorativo', 'Criação do Estado (não é feriado)', false, 'AP'),
  ('Dia do Comércio', '2025-10-17', 'comemorativo', 'Dia do Comércio', false, 'AP'),
  ('Dia do Evangélico', '2025-11-30', 'comemorativo', 'Dia do Evangélico', false, 'AP'),
  ('Criação do Estado do Amapá', '2026-10-05', 'comemorativo', 'Criação do Estado (não é feriado)', false, 'AP'),
  ('Dia do Comércio', '2026-10-17', 'comemorativo', 'Dia do Comércio', false, 'AP'),
  ('Dia do Evangélico', '2026-11-30', 'comemorativo', 'Dia do Evangélico', false, 'AP');