-- Criar nova tabela de integrações sociais vinculada ao cliente
CREATE TABLE public.social_integrations_cliente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  account_id TEXT NOT NULL, -- Para permitir múltiplas contas do mesmo provider
  account_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_by UUID REFERENCES auth.users(id), -- Quem conectou a conta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, provider, account_id)
);

-- Habilitar RLS
ALTER TABLE public.social_integrations_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS baseadas em acesso ao cliente
CREATE POLICY "Users can view client social integrations" ON public.social_integrations_cliente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_id 
    AND (is_admin(auth.uid()) OR auth.uid() = c.responsavel_id OR auth.uid() IS NOT NULL)
  )
);

CREATE POLICY "Users can manage client social integrations" ON public.social_integrations_cliente
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_id 
    AND (is_admin(auth.uid()) OR auth.uid() = c.responsavel_id)
  )
);

-- Criar nova tabela de métricas sociais vinculada ao cliente
CREATE TABLE public.social_metrics_cliente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.social_integrations_cliente(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para métricas
ALTER TABLE public.social_metrics_cliente ENABLE ROW LEVEL SECURITY;

-- Política RLS para métricas
CREATE POLICY "Users can view client social metrics" ON public.social_metrics_cliente
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_id 
    AND (is_admin(auth.uid()) OR auth.uid() = c.responsavel_id OR auth.uid() IS NOT NULL)
  )
);

-- Criar índices para performance
CREATE INDEX idx_social_integrations_cliente_id ON public.social_integrations_cliente(cliente_id);
CREATE INDEX idx_social_integrations_provider ON public.social_integrations_cliente(provider);
CREATE INDEX idx_social_integrations_active ON public.social_integrations_cliente(is_active);
CREATE INDEX idx_social_metrics_cliente_id ON public.social_metrics_cliente(cliente_id);
CREATE INDEX idx_social_metrics_integration ON public.social_metrics_cliente(integration_id);
CREATE INDEX idx_social_metrics_date ON public.social_metrics_cliente(metric_date);

-- Trigger para updated_at
CREATE TRIGGER update_social_integrations_cliente_updated_at
  BEFORE UPDATE ON public.social_integrations_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();