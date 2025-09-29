-- Adicionar campo logo_url na tabela clientes
ALTER TABLE public.clientes ADD COLUMN logo_url text;

-- Criar bucket para logos de clientes
INSERT INTO storage.buckets (id, name, public) VALUES ('client-logos', 'client-logos', true);

-- Criar políticas RLS para o bucket de logos de clientes
CREATE POLICY "Users can view client logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

CREATE POLICY "Users can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update client logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete client logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);