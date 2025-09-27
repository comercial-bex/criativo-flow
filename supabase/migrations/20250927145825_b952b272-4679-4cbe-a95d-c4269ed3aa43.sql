-- Expandir o enum especialidade_type para incluir todos os valores necessários
ALTER TYPE especialidade_type ADD VALUE IF NOT EXISTS 'grs';
ALTER TYPE especialidade_type ADD VALUE IF NOT EXISTS 'atendimento';
ALTER TYPE especialidade_type ADD VALUE IF NOT EXISTS 'audiovisual';
ALTER TYPE especialidade_type ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE especialidade_type ADD VALUE IF NOT EXISTS 'gestor';