-- FASE 1: UNIFICAÇÃO DO CALENDÁRIO - Versão Simplificada
-- Adicionar campos e índices, sem migração de dados incompatíveis

-- 1. Adicionar campos necessários
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_calendario' AND column_name = 'descricao') THEN
    ALTER TABLE public.eventos_calendario ADD COLUMN descricao TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_calendario' AND column_name = 'cor') THEN
    ALTER TABLE public.eventos_calendario ADD COLUMN cor TEXT DEFAULT '#3b82f6';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos_calendario' AND column_name = 'status') THEN
    ALTER TABLE public.eventos_calendario ADD COLUMN status TEXT DEFAULT 'agendado';
  END IF;
END $$;

-- 2. Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_data_inicio ON public.eventos_calendario(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_data_fim ON public.eventos_calendario(data_fim);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_responsavel ON public.eventos_calendario(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_cliente ON public.eventos_calendario(cliente_id);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_tipo ON public.eventos_calendario(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_status ON public.eventos_calendario(status);
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_periodo_responsavel 
ON public.eventos_calendario(responsavel_id, data_inicio, data_fim);

-- 3. RLS Policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON public.eventos_calendario;
  DROP POLICY IF EXISTS "Todos podem ver eventos do calendário" ON public.eventos_calendario;
  DROP POLICY IF EXISTS "Admin e responsável podem atualizar eventos" ON public.eventos_calendario;
  DROP POLICY IF EXISTS "Admin e responsável podem deletar eventos" ON public.eventos_calendario;

  CREATE POLICY "Usuários autenticados podem criar eventos"
  ON public.eventos_calendario FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

  CREATE POLICY "Todos podem ver eventos do calendário"
  ON public.eventos_calendario FOR SELECT
  TO authenticated
  USING (true);

  CREATE POLICY "Admin e responsável podem atualizar eventos"
  ON public.eventos_calendario FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()) OR auth.uid() = responsavel_id OR auth.uid() = created_by);

  CREATE POLICY "Admin e responsável podem deletar eventos"
  ON public.eventos_calendario FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()) OR auth.uid() = responsavel_id OR auth.uid() = created_by);
END $$;

-- 4. Documentação
COMMENT ON TABLE public.eventos_calendario IS 'Tabela unificada de eventos do calendário multidisciplinar.';
COMMENT ON COLUMN public.eventos_calendario.cor IS 'Cor do evento em hexadecimal. Padrão: #3b82f6';
COMMENT ON COLUMN public.eventos_calendario.status IS 'Status: agendado, confirmado, cancelado, concluido';