-- Criar bucket de storage para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-pagamento', 'comprovantes-pagamento', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para o bucket
CREATE POLICY "Admin/Financeiro podem fazer upload de comprovantes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'comprovantes-pagamento' AND
    (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
  );

CREATE POLICY "Admin/Financeiro podem ver comprovantes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'comprovantes-pagamento' AND
    (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
  );

CREATE POLICY "Admin/Financeiro podem deletar comprovantes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'comprovantes-pagamento' AND
    (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
  );