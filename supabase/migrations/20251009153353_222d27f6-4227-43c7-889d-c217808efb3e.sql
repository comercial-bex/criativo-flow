-- RLS Policies e Triggers Finais

ALTER TABLE eventos_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos visíveis para todos autenticados"
ON eventos_calendario FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Admin e Gestores criam eventos"
ON eventos_calendario FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) IN ('gestor', 'grs')
);

CREATE POLICY "Responsável atualiza seu evento"
ON eventos_calendario FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'gestor' OR
  responsavel_id = auth.uid()
);

CREATE POLICY "Admin gerencia config calendário"
ON calendario_config FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Todos podem ver config calendário"
ON calendario_config FOR SELECT
TO authenticated
USING (TRUE);

-- Trigger de notificação
CREATE OR REPLACE FUNCTION trg_notificar_novo_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data_evento)
  VALUES (
    NEW.responsavel_id,
    'Novo Evento Agendado',
    'Você foi alocado para: ' || NEW.titulo || ' em ' || to_char(NEW.data_inicio, 'DD/MM/YYYY HH24:MI'),
    'info',
    NEW.data_inicio
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_evento
AFTER INSERT ON eventos_calendario
FOR EACH ROW
WHEN (NEW.is_automatico = FALSE)
EXECUTE FUNCTION trg_notificar_novo_evento();