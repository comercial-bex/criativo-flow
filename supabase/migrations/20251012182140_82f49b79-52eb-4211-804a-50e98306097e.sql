-- Criar bucket para logos de roteiros
INSERT INTO storage.buckets (id, name, public) 
VALUES ('roteiros-logos', 'roteiros-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para permitir upload autenticado
CREATE POLICY "Usuários autenticados podem fazer upload de logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'roteiros-logos');

-- Policy para leitura pública dos logos
CREATE POLICY "Logos são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'roteiros-logos');

-- Policy para atualizar logos
CREATE POLICY "Usuários autenticados podem atualizar logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'roteiros-logos')
WITH CHECK (bucket_id = 'roteiros-logos');

-- Policy para deletar logos
CREATE POLICY "Usuários autenticados podem deletar logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'roteiros-logos');