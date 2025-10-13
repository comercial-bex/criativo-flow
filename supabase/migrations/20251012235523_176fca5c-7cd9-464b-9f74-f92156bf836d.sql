-- Criar bucket de storage para anexos de tarefas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos-tarefas',
  'anexos-tarefas',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.adobe.photoshop', 'application/postscript'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Upload apenas para usuários relacionados à tarefa
CREATE POLICY "Users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'anexos-tarefas' AND
  EXISTS (
    SELECT 1 FROM tarefa
    WHERE id = ((storage.foldername(name))[1])::uuid
    AND (
      responsavel_id = auth.uid() OR
      executor_id = auth.uid() OR
      created_by = auth.uid()
    )
  )
);

-- Policy: Download para usuários autenticados
CREATE POLICY "Users can view task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'anexos-tarefas');

-- Policy: Delete apenas quem criou
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'anexos-tarefas' AND
  owner_id::text = auth.uid()::text
);

-- Adicionar índices para performance na tabela anexo
CREATE INDEX IF NOT EXISTS idx_anexo_tarefa_id ON anexo(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_anexo_tipo ON anexo(tipo);
CREATE INDEX IF NOT EXISTS idx_anexo_created_at ON anexo(created_at DESC);