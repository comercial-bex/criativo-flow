-- Desabilitar triggers temporariamente
ALTER TABLE pessoas DISABLE TRIGGER trg_sync_papeis;
ALTER TABLE user_roles DISABLE TRIGGER trg_sync_user_roles;

-- Atualizar jefferson@agenciabex.com.br para Modo Deus
UPDATE pessoas 
SET papeis = ARRAY['admin', 'gestor', 'colaborador']::text[]
WHERE email = 'jefferson@agenciabex.com.br';

-- Reativar triggers
ALTER TABLE pessoas ENABLE TRIGGER trg_sync_papeis;
ALTER TABLE user_roles ENABLE TRIGGER trg_sync_user_roles;