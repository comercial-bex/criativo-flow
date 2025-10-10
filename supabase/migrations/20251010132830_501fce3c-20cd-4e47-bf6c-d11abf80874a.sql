-- Função para verificar disponibilidade de equipamento
CREATE OR REPLACE FUNCTION public.fn_verificar_disponibilidade(
  p_item_id UUID,
  p_inicio TIMESTAMPTZ,
  p_fim TIMESTAMPTZ,
  p_unidade_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflitos JSONB;
  v_disponivel BOOLEAN;
BEGIN
  -- Verificar se há reservas conflitantes
  SELECT 
    COUNT(*) = 0,
    COALESCE(jsonb_agg(jsonb_build_object(
      'id', id,
      'tipo', tipo_reserva,
      'inicio', inicio,
      'fim', fim,
      'projeto_id', projeto_id
    )), '[]'::jsonb)
  INTO v_disponivel, v_conflitos
  FROM public.inventario_reservas
  WHERE item_id = p_item_id
    AND (p_unidade_id IS NULL OR unidade_id = p_unidade_id)
    AND status_reserva != 'cancelada'
    AND (inicio, fim) OVERLAPS (p_inicio, p_fim);

  RETURN jsonb_build_object(
    'disponivel', v_disponivel,
    'conflitos', v_conflitos,
    'item_id', p_item_id
  );
END;
$$;

-- Função para criar reserva de equipamento
CREATE OR REPLACE FUNCTION public.fn_criar_reserva_equipamento(
  p_item_id UUID,
  p_tipo_reserva TEXT,
  p_inicio TIMESTAMPTZ,
  p_fim TIMESTAMPTZ,
  p_unidade_id UUID DEFAULT NULL,
  p_tarefa_id UUID DEFAULT NULL,
  p_projeto_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserva_id UUID;
  v_cliente_id UUID;
BEGIN
  -- Buscar cliente_id do projeto (se fornecido)
  IF p_projeto_id IS NOT NULL THEN
    SELECT cliente_id INTO v_cliente_id
    FROM public.projetos
    WHERE id = p_projeto_id;
  END IF;

  -- Criar reserva
  INSERT INTO public.inventario_reservas (
    item_id,
    unidade_id,
    tipo_reserva,
    inicio,
    fim,
    tarefa_id,
    projeto_id,
    cliente_id,
    status_reserva,
    criado_por
  ) VALUES (
    p_item_id,
    p_unidade_id,
    p_tipo_reserva,
    p_inicio,
    p_fim,
    p_tarefa_id,
    p_projeto_id,
    v_cliente_id,
    'confirmada',
    auth.uid()
  )
  RETURNING id INTO v_reserva_id;

  RETURN v_reserva_id;
END;
$$;