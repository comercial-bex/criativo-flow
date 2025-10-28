-- ============================================
-- FASE 1: FERIADOS REGIONAIS + COMEMORATIVOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. FERIADOS ESTADUAIS DO AMAPÁ (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Dia de São José', '2025-03-19', 'estadual', 'Padroeiro do Amapá', false, 'Amapá'),
  ('Cabralzinho', '2025-05-15', 'estadual', 'Dia de Cabralzinho', false, 'Amapá'),
  ('Data Magna do Estado', '2025-09-13', 'estadual', 'Criação do Ex-Território do Amapá', false, 'Amapá')
ON CONFLICT (data) DO NOTHING;

-- 2. FERIADOS MUNICIPAIS DE MACAPÁ (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Macapá', '2025-02-04', 'municipal', 'Aniversário da cidade de Macapá', false, 'Amapá', 'Macapá'),
  ('Nossa Senhora da Conceição', '2025-12-08', 'municipal', 'Padroeira de Macapá', false, 'Amapá', 'Macapá')
ON CONFLICT (data) DO NOTHING;

-- 3. FERIADOS MUNICIPAIS DE SANTANA (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Santana', '2025-07-26', 'municipal', 'Aniversário do município de Santana', false, 'Amapá', 'Santana'),
  ('Aniversário de Santana', '2025-12-17', 'municipal', 'Aniversário do município de Santana (data alternativa)', false, 'Amapá', 'Santana')
ON CONFLICT (data) DO NOTHING;

-- 4. FERIADOS MUNICIPAIS DE OIAPOQUE (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Oiapoque', '2025-05-23', 'municipal', 'Aniversário do município de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Santo Antônio', '2025-06-13', 'municipal', 'Santo Antônio - Padroeiro de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Nossa Senhora das Graças', '2025-08-15', 'municipal', 'Padroeira de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Laudo Suíço', '2025-12-01', 'municipal', 'Feriado municipal de Oiapoque', false, 'Amapá', 'Oiapoque')
ON CONFLICT (data) DO NOTHING;

-- 5. FERIADOS MUNICIPAIS DE LARANJAL DO JARI (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Santo Antônio', '2025-06-13', 'municipal', 'Santo Antônio - Padroeiro de Laranjal do Jari', false, 'Amapá', 'Laranjal do Jari'),
  ('Aniversário de Laranjal do Jari', '2025-12-17', 'municipal', 'Aniversário do município', false, 'Amapá', 'Laranjal do Jari')
ON CONFLICT (data) DO NOTHING;

-- 6. FERIADO MUNICIPAL GERAL (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Feriado Municipal', '2025-07-25', 'municipal', 'Dia de São Tiago (observado como feriado)', false, 'Amapá', NULL)
ON CONFLICT (data) DO NOTHING;

-- 7. PONTOS FACULTATIVOS (2025)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Carnaval', '2025-03-03', 'facultativo', 'Carnaval', true, 'Amapá'),
  ('Carnaval', '2025-03-04', 'facultativo', 'Carnaval', true, 'Amapá'),
  ('Carnaval até 14h', '2025-03-05', 'facultativo', 'Quarta-feira de Cinzas (ponto facultativo até 14h)', true, 'Amapá'),
  ('Corpus Christi', '2025-06-19', 'facultativo', 'Corpus Christi', true, 'Amapá'),
  ('Dia do Professor', '2025-10-15', 'facultativo', 'Dia do Professor', true, 'Amapá'),
  ('Dia do Servidor Público', '2025-10-28', 'facultativo', 'Dia do Servidor Público', true, 'Amapá')
ON CONFLICT (data) DO NOTHING;

-- 8. DATAS COMEMORATIVAS (2025) - Não bloqueantes, apenas informativas
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Dia da Mentira', '2025-04-01', 'comemorativo', 'Dia da Mentira', false, 'Amapá'),
  ('Páscoa', '2025-04-20', 'comemorativo', 'Páscoa', false, 'Amapá'),
  ('Dia das Mães', '2025-05-11', 'comemorativo', 'Dia das Mães', false, 'Amapá'),
  ('Dia dos Namorados', '2025-06-12', 'comemorativo', 'Dia dos Namorados', false, 'Amapá'),
  ('Dia dos Pais', '2025-08-10', 'comemorativo', 'Dia dos Pais', false, 'Amapá'),
  ('Criação do Estado', '2025-10-05', 'comemorativo', 'Criação do Estado do Amapá', false, 'Amapá'),
  ('Dia do Comércio', '2025-10-17', 'comemorativo', 'Dia do Comércio', false, 'Amapá'),
  ('Dia do Evangélico', '2025-11-30', 'comemorativo', 'Dia do Evangélico', false, 'Amapá')
ON CONFLICT (data) DO NOTHING;

-- ============================================
-- FERIADOS 2026 (Repetir estrutura)
-- ============================================

-- 1. FERIADOS ESTADUAIS DO AMAPÁ (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Dia de São José', '2026-03-19', 'estadual', 'Padroeiro do Amapá', false, 'Amapá'),
  ('Cabralzinho', '2026-05-15', 'estadual', 'Dia de Cabralzinho', false, 'Amapá'),
  ('Data Magna do Estado', '2026-09-13', 'estadual', 'Criação do Ex-Território do Amapá', false, 'Amapá')
ON CONFLICT (data) DO NOTHING;

-- 2. FERIADOS MUNICIPAIS DE MACAPÁ (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Macapá', '2026-02-04', 'municipal', 'Aniversário da cidade de Macapá', false, 'Amapá', 'Macapá'),
  ('Nossa Senhora da Conceição', '2026-12-08', 'municipal', 'Padroeira de Macapá', false, 'Amapá', 'Macapá')
ON CONFLICT (data) DO NOTHING;

-- 3. FERIADOS MUNICIPAIS DE SANTANA (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Santana', '2026-07-26', 'municipal', 'Aniversário do município de Santana', false, 'Amapá', 'Santana'),
  ('Aniversário de Santana', '2026-12-17', 'municipal', 'Aniversário do município de Santana', false, 'Amapá', 'Santana')
ON CONFLICT (data) DO NOTHING;

-- 4. FERIADOS MUNICIPAIS DE OIAPOQUE (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Aniversário de Oiapoque', '2026-05-23', 'municipal', 'Aniversário do município de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Santo Antônio', '2026-06-13', 'municipal', 'Santo Antônio - Padroeiro de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Nossa Senhora das Graças', '2026-08-15', 'municipal', 'Padroeira de Oiapoque', false, 'Amapá', 'Oiapoque'),
  ('Laudo Suíço', '2026-12-01', 'municipal', 'Feriado municipal de Oiapoque', false, 'Amapá', 'Oiapoque')
ON CONFLICT (data) DO NOTHING;

-- 5. FERIADOS MUNICIPAIS DE LARANJAL DO JARI (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Santo Antônio', '2026-06-13', 'municipal', 'Santo Antônio - Padroeiro de Laranjal do Jari', false, 'Amapá', 'Laranjal do Jari'),
  ('Aniversário de Laranjal do Jari', '2026-12-17', 'municipal', 'Aniversário do município', false, 'Amapá', 'Laranjal do Jari')
ON CONFLICT (data) DO NOTHING;

-- 6. FERIADO MUNICIPAL GERAL (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado, cidade) VALUES
  ('Feriado Municipal', '2026-07-25', 'municipal', 'Dia de São Tiago (observado como feriado)', false, 'Amapá', NULL)
ON CONFLICT (data) DO NOTHING;

-- 7. PONTOS FACULTATIVOS (2026 - Datas móveis precisam ser ajustadas)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Carnaval', '2026-02-16', 'facultativo', 'Carnaval', true, 'Amapá'),
  ('Carnaval', '2026-02-17', 'facultativo', 'Carnaval', true, 'Amapá'),
  ('Carnaval até 14h', '2026-02-18', 'facultativo', 'Quarta-feira de Cinzas (ponto facultativo até 14h)', true, 'Amapá'),
  ('Corpus Christi', '2026-06-04', 'facultativo', 'Corpus Christi', true, 'Amapá'),
  ('Dia do Professor', '2026-10-15', 'facultativo', 'Dia do Professor', true, 'Amapá'),
  ('Dia do Servidor Público', '2026-10-28', 'facultativo', 'Dia do Servidor Público', true, 'Amapá')
ON CONFLICT (data) DO NOTHING;

-- 8. DATAS COMEMORATIVAS (2026)
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo, estado) VALUES
  ('Dia da Mentira', '2026-04-01', 'comemorativo', 'Dia da Mentira', false, 'Amapá'),
  ('Páscoa', '2026-04-05', 'comemorativo', 'Páscoa', false, 'Amapá'),
  ('Dia das Mães', '2026-05-10', 'comemorativo', 'Dia das Mães', false, 'Amapá'),
  ('Dia dos Namorados', '2026-06-12', 'comemorativo', 'Dia dos Namorados', false, 'Amapá'),
  ('Dia dos Pais', '2026-08-09', 'comemorativo', 'Dia dos Pais', false, 'Amapá'),
  ('Criação do Estado', '2026-10-05', 'comemorativo', 'Criação do Estado do Amapá', false, 'Amapá'),
  ('Dia do Comércio', '2026-10-17', 'comemorativo', 'Dia do Comércio', false, 'Amapá'),
  ('Dia do Evangélico', '2026-11-30', 'comemorativo', 'Dia do Evangélico', false, 'Amapá')
ON CONFLICT (data) DO NOTHING;
