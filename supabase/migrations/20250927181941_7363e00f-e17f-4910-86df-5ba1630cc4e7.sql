-- Tabela para queue de posts agendados (sem cron)
CREATE TABLE IF NOT EXISTS public.social_post_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  legenda TEXT NOT NULL,
  anexo_url TEXT,
  formato TEXT NOT NULL DEFAULT 'post',
  platforms TEXT[] NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  published_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para a tabela de queue
ALTER TABLE public.social_post_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own queued posts" 
ON public.social_post_queue 
FOR ALL 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_social_post_queue_scheduled ON public.social_post_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_social_post_queue_user ON public.social_post_queue(user_id);
CREATE INDEX idx_social_post_queue_status ON public.social_post_queue(status);

-- Função para processar queue de posts
CREATE OR REPLACE FUNCTION public.process_social_post_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esta função pode ser chamada por um edge function para processar posts agendados
  UPDATE public.social_post_queue 
  SET status = 'processed', updated_at = now()
  WHERE scheduled_for <= now() 
    AND status = 'pending'
    AND attempts < max_attempts;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_social_post_queue_updated_at
    BEFORE UPDATE ON public.social_post_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();