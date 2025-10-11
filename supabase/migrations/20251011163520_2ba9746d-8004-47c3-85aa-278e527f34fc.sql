-- Remover submódulo redundante "Especialistas" do módulo Clientes
DELETE FROM submodulos 
WHERE modulo_id = (SELECT id FROM modulos WHERE slug = 'clientes')
AND slug = 'especialistas';