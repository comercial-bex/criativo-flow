-- Criar bucket para arquivos visuais dos posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-visuals', 'post-visuals', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir leitura pública dos arquivos
CREATE POLICY "Arquivos visuais são publicamente acessíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-visuals');

-- Política: Permitir upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de visuais"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-visuals' AND
  auth.role() = 'authenticated'
);

-- Política: Permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar seus visuais"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-visuals' AND
  auth.role() = 'authenticated'
);

-- Política: Permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar visuais"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-visuals' AND
  auth.role() = 'authenticated'
);