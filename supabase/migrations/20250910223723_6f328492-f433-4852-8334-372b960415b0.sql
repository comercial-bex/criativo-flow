-- Desabilitar confirmação de email
UPDATE auth.config 
SET email_confirm = false
WHERE id = 1;