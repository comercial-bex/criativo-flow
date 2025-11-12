-- Adicionar colunas para datas comemorativas manuais
ALTER TABLE datas_comemorativas 
ADD COLUMN IF NOT EXISTS manual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_datas_manuais ON datas_comemorativas(manual);
CREATE INDEX IF NOT EXISTS idx_datas_created_by ON datas_comemorativas(created_by);

-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE datas_comemorativas ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem visualizar todas as datas (manuais + pré-cadastradas)
DROP POLICY IF EXISTS "Todos podem visualizar datas" ON datas_comemorativas;
CREATE POLICY "Todos podem visualizar datas"
ON datas_comemorativas FOR SELECT
USING (true);

-- Policy: Usuários autenticados podem criar datas manuais
DROP POLICY IF EXISTS "Usuários podem criar datas manuais" ON datas_comemorativas;
CREATE POLICY "Usuários podem criar datas manuais"
ON datas_comemorativas FOR INSERT
TO authenticated
WITH CHECK (manual = true AND created_by = auth.uid());

-- Policy: Usuários podem editar APENAS suas datas manuais
DROP POLICY IF EXISTS "Usuários podem editar suas datas manuais" ON datas_comemorativas;
CREATE POLICY "Usuários podem editar suas datas manuais"
ON datas_comemorativas FOR UPDATE
TO authenticated
USING (manual = true AND created_by = auth.uid())
WITH CHECK (manual = true AND created_by = auth.uid());

-- Policy: Usuários podem deletar APENAS suas datas manuais
DROP POLICY IF EXISTS "Usuários podem deletar suas datas manuais" ON datas_comemorativas;
CREATE POLICY "Usuários podem deletar suas datas manuais"
ON datas_comemorativas FOR DELETE
TO authenticated
USING (manual = true AND created_by = auth.uid());