-- Adicionar campos para frameworks e especialistas selecionados na tabela conteudo_editorial
ALTER TABLE public.conteudo_editorial 
ADD COLUMN frameworks_selecionados TEXT[],
ADD COLUMN especialistas_selecionados TEXT[];