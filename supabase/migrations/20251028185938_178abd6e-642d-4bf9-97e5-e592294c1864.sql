-- Criar bucket para extratos bancários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'extratos_bancarios',
  'extratos_bancarios',
  false,
  10485760,
  ARRAY['text/csv', 'application/x-ofx', 'application/vnd.intu.qfx', 'application/pdf', 'image/png', 'image/jpeg']
);

-- Política: Upload de arquivos (extratos e comprovantes)
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'extratos_bancarios'
  AND (storage.foldername(name))[1] IN ('extratos', 'comprovantes')
);

-- Política: Visualizar próprios arquivos
CREATE POLICY "Usuários podem ver próprios arquivos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'extratos_bancarios'
);

-- Política: Atualizar metadados
CREATE POLICY "Usuários podem atualizar próprios arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'extratos_bancarios')
WITH CHECK (bucket_id = 'extratos_bancarios');

-- Política: Deletar próprios arquivos
CREATE POLICY "Usuários podem deletar próprios arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'extratos_bancarios');