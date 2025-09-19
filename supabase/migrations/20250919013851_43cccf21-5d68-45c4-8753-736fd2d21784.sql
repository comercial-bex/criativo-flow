-- Atualizar especialidades dos usuários existentes baseado em seus nomes/emails
UPDATE profiles 
SET especialidade = 'filmmaker' 
WHERE email = 'filmmaker@gmail.com' OR nome = 'filmmaker';

UPDATE profiles 
SET especialidade = 'gerente_redes_sociais' 
WHERE email = 'gerente@gmail.com.br' OR nome = 'gerente';

-- Para os outros usuários, vamos definir especialidades variadas
UPDATE profiles 
SET especialidade = 'design' 
WHERE email = 'debora123thauany@gmail.com';

UPDATE profiles 
SET especialidade = 'videomaker' 
WHERE email = 'teste@gmail.com';