-- Adicionar campo capa_anexo_id à tabela tarefa
ALTER TABLE public.tarefa 
ADD COLUMN capa_anexo_id UUID REFERENCES public.anexo(id) ON DELETE SET NULL;

CREATE INDEX idx_tarefa_capa_anexo ON public.tarefa(capa_anexo_id);

COMMENT ON COLUMN public.tarefa.capa_anexo_id IS 'ID do anexo usado como capa visual do cartão';