-- Garantir que a FK de captacoes_agenda.especialista_id aponta para pessoas.profile_id
ALTER TABLE captacoes_agenda
DROP CONSTRAINT IF EXISTS fk_captacoes_especialista;

ALTER TABLE captacoes_agenda
ADD CONSTRAINT fk_captacoes_especialista
FOREIGN KEY (especialista_id) REFERENCES pessoas(profile_id)
ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_captacoes_especialista 
ON captacoes_agenda(especialista_id);