-- Limpar dados antigos de frameworks para migrar para o novo formato de componentes
UPDATE conteudo_editorial 
SET frameworks_selecionados = NULL 
WHERE frameworks_selecionados IS NOT NULL;