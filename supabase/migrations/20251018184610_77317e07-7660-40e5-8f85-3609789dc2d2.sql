-- Adicionar FK faltante em financeiro_folha_itens
ALTER TABLE financeiro_folha_itens DROP CONSTRAINT IF EXISTS fk_folha_itens_colaborador;
ALTER TABLE financeiro_folha_itens 
ADD CONSTRAINT fk_folha_itens_colaborador
FOREIGN KEY (colaborador_id) REFERENCES pessoas(id) ON DELETE SET NULL;