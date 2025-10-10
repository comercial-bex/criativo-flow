-- ============================================================================
-- PAINEL DE HOMOLOGAÇÃO BEX 3.0 - MVP READY
-- Fase 1: Modelo de Dados Unificado (funcionarios)
-- ============================================================================

-- 1.1 Criar ENUM para tipo de vínculo
CREATE TYPE tipo_vinculo_enum AS ENUM ('clt', 'pj', 'estagio', 'freelancer');

-- 1.2 Criar ENUM para tipo de PIX
CREATE TYPE pix_tipo_enum AS ENUM ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria');

-- 1.3 Criar ENUM para status de acesso
CREATE TYPE status_acesso_enum AS ENUM ('ativo', 'suspenso', 'bloqueado');

-- 1.4 Tabela FUNCIONARIOS (fonte única)
CREATE TABLE public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome_completo TEXT NOT NULL,
  cpf_cnpj TEXT UNIQUE NOT NULL,
  rg TEXT,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Tipo de vínculo
  ativo BOOLEAN DEFAULT TRUE,
  tipo_vinculo tipo_vinculo_enum,
  papeis TEXT[] DEFAULT '{}', -- ['Colaborador', 'Especialista:GRS', 'Gestor']
  
  -- Profissional
  funcao_cargo TEXT,
  centro_custo TEXT,
  gestor_imediato UUID REFERENCES funcionarios(id),
  
  -- Remuneração
  salario_base NUMERIC(10,2),
  tabela_hora NUMERIC(10,2),
  
  -- Políticas
  banco_horas JSONB DEFAULT '{"saldo": 0, "historico": []}',
  politica_extra TEXT DEFAULT 'padrao',
  politica_faltas TEXT DEFAULT 'padrao',
  
  -- Bancários
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  pix_chave TEXT,
  pix_tipo pix_tipo_enum,
  
  -- Fiscal
  retencoes_impostos JSONB DEFAULT '{}',
  
  -- Governança
  termos_assinados JSONB DEFAULT '[]',
  perfil_acesso UUID REFERENCES profiles(id), -- link com auth
  status_acesso status_acesso_enum DEFAULT 'ativo',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_funcionarios_cpf ON funcionarios(cpf_cnpj);
CREATE INDEX idx_funcionarios_papeis ON funcionarios USING GIN(papeis);
CREATE INDEX idx_funcionarios_perfil ON funcionarios(perfil_acesso);
CREATE INDEX idx_funcionarios_ativo ON funcionarios(ativo) WHERE ativo = TRUE;

-- 1.5 View de Retrocompatibilidade (manter por 1 sprint)
CREATE OR REPLACE VIEW vw_colaboradores_especialistas AS
SELECT 
  f.id,
  f.nome_completo,
  f.cpf_cnpj,
  f.email,
  f.tipo_vinculo::TEXT AS regime,
  f.salario_base,
  f.ativo,
  CASE 
    WHEN 'Especialista:GRS' = ANY(f.papeis) THEN 'grs'
    WHEN 'Especialista:Design' = ANY(f.papeis) THEN 'designer'
    WHEN 'Especialista:Filmmaker' = ANY(f.papeis) THEN 'filmmaker'
    ELSE NULL
  END AS especialidade,
  f.perfil_acesso AS profile_id,
  f.created_at,
  f.updated_at
FROM funcionarios f
WHERE f.ativo = TRUE;

-- 1.6 Tabela de Logs de Homologação
CREATE TABLE public.homologacao_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao TEXT NOT NULL, -- 'varrer', 'executar_e2e', 'migrar_fk', 'exportar'
  modulo TEXT,
  resultado JSONB,
  evidencias JSONB DEFAULT '{}',
  executado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homologacao_logs_acao ON homologacao_logs(acao);
CREATE INDEX idx_homologacao_logs_created ON homologacao_logs(created_at DESC);

-- 1.7 Tabela de Checklist de Homologação
CREATE TABLE public.homologacao_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'nao_testado' CHECK (status IN ('passou', 'falhou', 'nao_testado')),
  impacto TEXT CHECK (impacto IN ('alto', 'medio', 'baixo')),
  prioridade TEXT CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  esforco TEXT CHECK (esforco IN ('Alto', 'Médio', 'Baixo')),
  solucao_sugerida TEXT,
  evidencia_url TEXT,
  evidencia_dados JSONB,
  testado_por UUID REFERENCES profiles(id),
  testado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_modulo ON homologacao_checklist(modulo);
CREATE INDEX idx_checklist_status ON homologacao_checklist(status);

-- 1.8 RLS para funcionarios
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor gerenciam funcionarios"
ON funcionarios
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Funcionario vê seus próprios dados"
ON funcionarios
FOR SELECT
USING (perfil_acesso = auth.uid());

-- 1.9 RLS para homologacao_logs
ALTER TABLE homologacao_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor veem logs"
ON homologacao_logs
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Sistema cria logs"
ON homologacao_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 1.10 RLS para homologacao_checklist
ALTER TABLE homologacao_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor gerenciam checklist"
ON homologacao_checklist
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 1.11 Função para popular checklist inicial
CREATE OR REPLACE FUNCTION popular_checklist_inicial()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Limpar checklist existente
  DELETE FROM homologacao_checklist;
  
  -- Financeiro (8 itens)
  INSERT INTO homologacao_checklist (modulo, item, impacto, prioridade, esforco, solucao_sugerida) VALUES
  ('Financeiro', 'Folha integra adiantamentos no fechamento', 'alto', 'Alta', 'Médio', 'Criar trigger automático adiantamento→folha'),
  ('Financeiro', 'Cartão corporativo com centro de custo obrigatório', 'alto', 'Alta', 'Baixo', 'Campo obrigatório + validação'),
  ('Financeiro', 'PJ/RPA com retenções configuráveis', 'medio', 'Média', 'Médio', 'Tabela de alíquotas + cálculo automático'),
  ('Financeiro', 'Balancete gera sem erro', 'alto', 'Alta', 'Alto', 'Corrigir query de agregação'),
  ('Financeiro', 'Balanço Patrimonial gera sem erro', 'alto', 'Alta', 'Alto', 'Revisar plano de contas'),
  ('Financeiro', 'Conciliação de cartão antes do fechamento', 'medio', 'Média', 'Médio', 'Bloqueio de fechamento se pendente'),
  ('Financeiro', 'Aprovador obrigatório em despesas', 'alto', 'Alta', 'Baixo', 'Workflow de aprovação'),
  ('Financeiro', 'Comprovantes anexados em despesas', 'medio', 'Média', 'Baixo', 'Upload obrigatório'),
  
  -- RH/DP (7 itens)
  ('RH/DP', 'Cartão de ponto aceita ajustes com motivo', 'alto', 'Alta', 'Baixo', 'Campo motivo + observação obrigatórios'),
  ('RH/DP', 'Regras de política de extra aplicadas', 'alto', 'Alta', 'Médio', 'Validar políticas no fechamento'),
  ('RH/DP', 'Regras de folga aplicadas', 'medio', 'Média', 'Médio', 'Banco de horas automático'),
  ('RH/DP', 'Regras de falta aplicadas', 'alto', 'Alta', 'Médio', 'Desconto proporcional + justificativa'),
  ('RH/DP', 'Adiantamentos integram no fechamento', 'alto', 'Alta', 'Médio', 'Trigger de desconto automático'),
  ('RH/DP', 'Termos anexados ao perfil', 'medio', 'Média', 'Baixo', 'Upload obrigatório na admissão'),
  ('RH/DP', 'Holerite gerado corretamente', 'alto', 'Alta', 'Alto', 'Template PDF + cálculos validados'),
  
  -- GRS/Tarefas (6 itens)
  ('GRS/Tarefas', 'Apenas GRS cria tarefas', 'alto', 'Alta', 'Baixo', 'Validação de role na criação'),
  ('GRS/Tarefas', 'Executores notificados ao serem designados', 'medio', 'Média', 'Baixo', 'Trigger de notificação'),
  ('GRS/Tarefas', 'Tarefas vinculadas a projetos', 'medio', 'Média', 'Baixo', 'FK obrigatória'),
  ('GRS/Tarefas', 'Briefings anexados a tarefas', 'medio', 'Média', 'Baixo', 'Relação 1:1'),
  ('GRS/Tarefas', 'Visões de execução por módulo', 'baixo', 'Baixa', 'Médio', 'Filtros e dashboards'),
  ('GRS/Tarefas', 'Aprovações de cliente registradas', 'alto', 'Alta', 'Baixo', 'Tabela aprovacoes_cliente'),
  
  -- Audiovisual/Arsenal (7 itens)
  ('Audiovisual/Arsenal', 'Inventário com check-in/out', 'alto', 'Alta', 'Médio', 'Sistema de reservas'),
  ('Audiovisual/Arsenal', 'Bloqueio de item não devolvido', 'alto', 'Alta', 'Baixo', 'Status de disponibilidade'),
  ('Audiovisual/Arsenal', 'Termo obrigatório no check-out', 'alto', 'Alta', 'Baixo', 'Upload obrigatório'),
  ('Audiovisual/Arsenal', 'Agendar captação reserva arsenal', 'medio', 'Média', 'Médio', 'Integração GRS→Arsenal'),
  ('Audiovisual/Arsenal', 'Notificação ao filmmaker designado', 'medio', 'Média', 'Baixo', 'Trigger de notificação'),
  ('Audiovisual/Arsenal', 'Devolução atrasada gera multa', 'medio', 'Média', 'Médio', 'Job diário + lançamento financeiro'),
  ('Audiovisual/Arsenal', 'Histórico de uso por equipamento', 'baixo', 'Baixa', 'Baixo', 'Auditoria de reservas'),
  
  -- Administrativo/Contratos (7 itens)
  ('Administrativo/Contratos', 'Modelos com placeholders', 'alto', 'Alta', 'Médio', 'Template engine'),
  ('Administrativo/Contratos', 'Preview em tempo real', 'medio', 'Média', 'Médio', 'Renderer de variáveis'),
  ('Administrativo/Contratos', 'Versionamento de contratos', 'medio', 'Média', 'Baixo', 'Campo versao + histórico'),
  ('Administrativo/Contratos', 'Download PDF funcional', 'alto', 'Alta', 'Médio', 'Gerador PDF server-side'),
  ('Administrativo/Contratos', 'Validação de placeholders', 'alto', 'Alta', 'Baixo', 'Parser de {{chaves}}'),
  ('Administrativo/Contratos', 'Assinatura digital registrada', 'medio', 'Média', 'Alto', 'Integração assinatura eletrônica'),
  ('Administrativo/Contratos', 'Histórico de alterações', 'baixo', 'Baixa', 'Baixo', 'Auditoria de mudanças'),
  
  -- Unificação Funcionario (5 itens)
  ('Unificação', 'Tabela funcionarios criada', 'alto', 'Alta', 'Alto', 'Migração SQL executada'),
  ('Unificação', 'View retrocompatível ativa', 'alto', 'Alta', 'Baixo', 'vw_colaboradores_especialistas'),
  ('Unificação', 'FKs migradas para funcionario_id', 'alto', 'Alta', 'Alto', 'Job de migração gradual'),
  ('Unificação', 'Papeis unificados (Colaborador + Especialista)', 'alto', 'Alta', 'Médio', 'Array de papeis'),
  ('Unificação', 'Perfil de acesso vinculado', 'alto', 'Alta', 'Baixo', 'FK perfil_acesso');
  
END;
$$;

-- Popular checklist inicial
SELECT popular_checklist_inicial();