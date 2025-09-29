-- Adicionar cliente_id à tabela profiles para vincular usuários autenticados com clientes
ALTER TABLE public.profiles ADD COLUMN cliente_id uuid REFERENCES public.clientes(id);

-- Índice para performance
CREATE INDEX idx_profiles_cliente_id ON public.profiles(cliente_id);

-- Criar policies específicas para clientes visualizarem apenas seus dados
CREATE POLICY "Clientes veem apenas seus planejamentos" ON public.planejamentos
FOR SELECT USING (
  cliente_id = (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Clientes veem posts de seus planejamentos" ON public.posts_planejamento
FOR SELECT USING (
  planejamento_id IN (
    SELECT id FROM public.planejamentos 
    WHERE cliente_id = (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Clientes veem suas propostas" ON public.propostas
FOR SELECT USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE cliente_id = (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Clientes veem seus eventos" ON public.eventos_agenda
FOR SELECT USING (
  cliente_id = (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
);