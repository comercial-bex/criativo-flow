-- Adicionar valores ao ENUM pessoa_status
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'inativo';
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'ferias';
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'aprovado';
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'pendente_aprovacao';
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'rejeitado';
ALTER TYPE pessoa_status ADD VALUE IF NOT EXISTS 'suspenso';