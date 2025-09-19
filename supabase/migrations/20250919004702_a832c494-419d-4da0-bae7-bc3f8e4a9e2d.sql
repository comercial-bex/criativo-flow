-- Adicionar foreign key para projeto_especialistas -> profiles
ALTER TABLE public.projeto_especialistas 
ADD CONSTRAINT projeto_especialistas_especialista_id_fkey 
FOREIGN KEY (especialista_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Remover enum copywriter da especialidade_type
-- Primeiro, vamos ver se há dados usando copywriter
DO $$
BEGIN
    -- Verificar se há registros usando copywriter
    IF EXISTS (SELECT 1 FROM profiles WHERE especialidade = 'copywriter') THEN
        -- Atualizar registros existentes para design (ou outra especialidade apropriada)
        UPDATE profiles SET especialidade = 'design' WHERE especialidade = 'copywriter';
    END IF;
    
    IF EXISTS (SELECT 1 FROM projeto_especialistas WHERE especialidade = 'copywriter') THEN
        -- Atualizar registros existentes para design
        UPDATE projeto_especialistas SET especialidade = 'design' WHERE especialidade = 'copywriter';
    END IF;
END
$$;

-- Criar novo enum sem copywriter
CREATE TYPE public.especialidade_type_new AS ENUM (
  'videomaker',
  'filmmaker', 
  'design',
  'gerente_redes_sociais'
);

-- Atualizar colunas para usar o novo enum
ALTER TABLE public.profiles 
ALTER COLUMN especialidade TYPE public.especialidade_type_new USING especialidade::text::public.especialidade_type_new;

ALTER TABLE public.projeto_especialistas 
ALTER COLUMN especialidade TYPE public.especialidade_type_new USING especialidade::text::public.especialidade_type_new;

-- Remover o enum antigo e renomear o novo
DROP TYPE public.especialidade_type;
ALTER TYPE public.especialidade_type_new RENAME TO especialidade_type;