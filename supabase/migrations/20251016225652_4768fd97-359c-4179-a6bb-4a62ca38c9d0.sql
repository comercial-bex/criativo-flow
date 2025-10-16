-- Criar bucket brand-assets para biblioteca de assets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('brand-assets', 'brand-assets', true, 52428800); -- 50MB limit

-- Política: Equipe autenticada pode ver assets
CREATE POLICY "Equipe pode ver assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'brand-assets');

-- Política: Admin/Gestor/GRS/Designer podem fazer upload
CREATE POLICY "Equipe pode fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' AND
  (is_admin(auth.uid()) OR 
   get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'designer'::user_role))
);

-- Política: Admin/Gestor podem deletar assets
CREATE POLICY "Admin/Gestor podem deletar assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role)
);

-- Política: Admin/Gestor/GRS/Designer podem atualizar assets
CREATE POLICY "Equipe pode atualizar assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (is_admin(auth.uid()) OR 
   get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'designer'::user_role))
);