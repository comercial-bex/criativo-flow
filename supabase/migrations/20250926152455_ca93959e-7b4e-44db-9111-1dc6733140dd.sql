-- Criar tabelas para módulo administrativo

-- Tabela de orçamentos
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_final NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_validade DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado', 'expirado')),
  observacoes TEXT,
  responsavel_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens do orçamento
CREATE TABLE public.orcamento_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_servico TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propostas comerciais
CREATE TABLE public.propostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  pdf_path TEXT,
  pdf_assinado_path TEXT,
  assinatura_status TEXT NOT NULL DEFAULT 'pendente' CHECK (assinatura_status IN ('pendente', 'enviado', 'assinado', 'recusado', 'expirado')),
  assinatura_url TEXT,
  assinatura_data TIMESTAMP WITH TIME ZONE,
  data_envio TIMESTAMP WITH TIME ZONE,
  link_publico UUID DEFAULT gen_random_uuid(),
  visualizado_em TIMESTAMP WITH TIME ZONE,
  responsavel_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de previsão financeira
CREATE TABLE public.financeiro_previsao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  valor_mensal NUMERIC(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  parcelas INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'previsto' CHECK (status IN ('previsto', 'confirmado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de assinatura
CREATE TABLE public.assinatura_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  dados_gov_br JSONB,
  ip_usuario INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_previsao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinatura_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orçamentos
CREATE POLICY "Usuários autenticados podem ver orçamentos" 
ON public.orcamentos FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar orçamentos" 
ON public.orcamentos FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar orçamentos" 
ON public.orcamentos FOR UPDATE 
USING (auth.uid() = responsavel_id OR is_admin(auth.uid()));

-- Políticas RLS para itens de orçamento
CREATE POLICY "Usuários podem ver itens de orçamentos acessíveis" 
ON public.orcamento_itens FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orcamentos o 
  WHERE o.id = orcamento_itens.orcamento_id 
  AND auth.uid() IS NOT NULL
));

CREATE POLICY "Usuários podem criar itens de orçamento" 
ON public.orcamento_itens FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orcamentos o 
  WHERE o.id = orcamento_itens.orcamento_id 
  AND auth.uid() IS NOT NULL
));

CREATE POLICY "Usuários podem atualizar itens de orçamento" 
ON public.orcamento_itens FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.orcamentos o 
  WHERE o.id = orcamento_itens.orcamento_id 
  AND (auth.uid() = o.responsavel_id OR is_admin(auth.uid()))
));

CREATE POLICY "Usuários podem deletar itens de orçamento" 
ON public.orcamento_itens FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.orcamentos o 
  WHERE o.id = orcamento_itens.orcamento_id 
  AND (auth.uid() = o.responsavel_id OR is_admin(auth.uid()))
));

-- Políticas RLS para propostas
CREATE POLICY "Usuários autenticados podem ver propostas" 
ON public.propostas FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar propostas" 
ON public.propostas FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar propostas" 
ON public.propostas FOR UPDATE 
USING (auth.uid() = responsavel_id OR is_admin(auth.uid()));

-- Políticas RLS para previsão financeira
CREATE POLICY "Usuários autenticados podem ver previsões" 
ON public.financeiro_previsao FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar previsões" 
ON public.financeiro_previsao FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar previsões" 
ON public.financeiro_previsao FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para logs de assinatura
CREATE POLICY "Usuários podem ver logs de assinatura" 
ON public.assinatura_logs FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode criar logs" 
ON public.assinatura_logs FOR INSERT 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_orcamentos_updated_at
BEFORE UPDATE ON public.orcamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orcamento_itens_updated_at
BEFORE UPDATE ON public.orcamento_itens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propostas_updated_at
BEFORE UPDATE ON public.propostas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_previsao_updated_at
BEFORE UPDATE ON public.financeiro_previsao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();