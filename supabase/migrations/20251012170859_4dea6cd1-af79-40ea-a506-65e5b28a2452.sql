-- Criar bucket de storage para roteiros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'roteiros',
  'roteiros',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admin e Gestor podem fazer upload
CREATE POLICY "Admin e Gestor podem fazer upload de roteiros"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'roteiros' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'gestor', 'grs')
    )
  )
);

-- Policy: Admin, Gestor e GRS podem ver roteiros
CREATE POLICY "Equipe pode ver roteiros"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'roteiros'
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'gestor', 'grs', 'designer', 'filmmaker')
    )
  )
);

-- Policy: Admin e Gestor podem atualizar roteiros
CREATE POLICY "Admin e Gestor podem atualizar roteiros"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'roteiros'
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'gestor')
    )
  )
);

-- Policy: Admin pode deletar roteiros
CREATE POLICY "Admin pode deletar roteiros"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'roteiros'
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);