-- Adicionar campo veiculo_id na tabela pessoas
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS veiculo_id UUID REFERENCES inventario_itens(id);

COMMENT ON COLUMN pessoas.veiculo_id IS 'Veículo corporativo vinculado ao colaborador';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pessoas_veiculo_id ON pessoas(veiculo_id);