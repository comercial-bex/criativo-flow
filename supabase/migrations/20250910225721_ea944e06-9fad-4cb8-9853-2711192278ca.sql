-- Criar tabela de categorias financeiras
CREATE TABLE public.categorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT DEFAULT '#3b82f6',
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE public.transacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pagar', 'receber')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  categoria_id UUID REFERENCES public.categorias_financeiras(id),
  cliente_id UUID REFERENCES public.clientes(id),
  projeto_id UUID REFERENCES public.projetos(id),
  responsavel_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias financeiras
CREATE POLICY "Usuários autenticados podem ver categorias" 
ON public.categorias_financeiras 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar categorias" 
ON public.categorias_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar categorias" 
ON public.categorias_financeiras 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Políticas para transações financeiras
CREATE POLICY "Usuários autenticados podem ver transações" 
ON public.transacoes_financeiras 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar transações" 
ON public.transacoes_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar transações" 
ON public.transacoes_financeiras 
FOR UPDATE 
USING ((auth.uid() = responsavel_id) OR is_admin(auth.uid()));

-- Criar trigger para update_at
CREATE TRIGGER update_categorias_financeiras_updated_at
BEFORE UPDATE ON public.categorias_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_financeiras_updated_at
BEFORE UPDATE ON public.transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas categorias padrão
INSERT INTO public.categorias_financeiras (nome, tipo, cor, descricao) VALUES
('Desenvolvimento', 'receita', '#10b981', 'Receitas de projetos de desenvolvimento'),
('Consultoria', 'receita', '#3b82f6', 'Receitas de consultoria'),
('Manutenção', 'receita', '#8b5cf6', 'Receitas de manutenção'),
('Hospedagem', 'despesa', '#ef4444', 'Custos de hospedagem e infraestrutura'),
('Software', 'despesa', '#f59e0b', 'Licenças de software'),
('Marketing', 'despesa', '#ec4899', 'Gastos com marketing e publicidade'),
('Escritório', 'despesa', '#6b7280', 'Despesas administrativas do escritório');