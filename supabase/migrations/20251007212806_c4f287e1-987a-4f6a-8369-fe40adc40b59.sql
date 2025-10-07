-- Criar tabela contratos
CREATE TABLE public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('servico', 'confidencialidade', 'termo_uso')),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'assinado', 'cancelado')),
  valor_mensal numeric,
  data_inicio date,
  data_fim date,
  arquivo_url text,
  arquivo_assinado_url text,
  assinado_em timestamp with time zone,
  assinado_por uuid REFERENCES public.profiles(id),
  criado_por uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_contratos_cliente_id ON public.contratos(cliente_id);
CREATE INDEX idx_contratos_status ON public.contratos(status);
CREATE INDEX idx_contratos_tipo ON public.contratos(tipo);

-- RLS
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/Gestor podem gerenciar contratos"
ON public.contratos FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

CREATE POLICY "Clientes podem ver seus contratos"
ON public.contratos FOR SELECT
USING (cliente_id IN (
  SELECT id FROM clientes WHERE id = (
    SELECT cliente_id FROM profiles WHERE id = auth.uid()
  )
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contratos_updated_at
BEFORE UPDATE ON public.contratos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket para contratos
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para storage de contratos
CREATE POLICY "Admin/Gestor podem ver contratos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contracts' AND 
  (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role)
);

CREATE POLICY "Admin/Gestor podem upload contratos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts' AND 
  (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role)
);

CREATE POLICY "Admin/Gestor podem deletar contratos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contracts' AND 
  (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role)
);