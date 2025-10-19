-- ========================================
-- SPRINT 5: Contas a Pagar/Receber + Automações
-- ========================================

-- 1. Trigger: Gerar títulos quando contrato for ativado
CREATE OR REPLACE FUNCTION public.fn_gerar_titulos_contrato()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_num_parcelas INTEGER;
  v_valor_parcela NUMERIC;
BEGIN
  -- Apenas quando status mudar para 'ativo'
  IF NEW.status = 'ativo' AND (OLD.status IS NULL OR OLD.status != 'ativo') THEN
    
    -- Determinar número de parcelas baseado no tipo de pagamento
    IF NEW.tipo_pagamento = 'recorrente' THEN
      -- Calcular meses entre data_inicio e data_fim
      v_num_parcelas := EXTRACT(MONTH FROM AGE(NEW.data_fim, NEW.data_inicio)) + 1;
      v_valor_parcela := COALESCE(NEW.valor_recorrente, NEW.valor_mensal, NEW.valor_total / v_num_parcelas);
    ELSIF NEW.tipo_pagamento = 'parcelado' THEN
      v_num_parcelas := COALESCE(NEW.numero_parcelas, 1);
      v_valor_parcela := NEW.valor_total / v_num_parcelas;
    ELSE
      -- Pagamento único
      v_num_parcelas := 1;
      v_valor_parcela := NEW.valor_total;
    END IF;

    -- Gerar títulos a receber
    INSERT INTO public.titulos_financeiros (
      tipo,
      contrato_id,
      cliente_id,
      fornecedor_id,
      valor_original,
      valor_liquido,
      data_vencimento,
      data_competencia,
      descricao,
      status,
      numero_parcela,
      total_parcelas
    )
    SELECT 
      'receber'::tipo_titulo,
      NEW.id,
      NEW.cliente_id,
      NULL,
      v_valor_parcela,
      v_valor_parcela,
      NEW.data_inicio + (n || ' months')::interval,
      NEW.data_inicio + (n || ' months')::interval,
      'Parcela ' || (n+1) || '/' || v_num_parcelas || ' - ' || NEW.titulo,
      'pendente'::status_titulo,
      n + 1,
      v_num_parcelas
    FROM generate_series(0, v_num_parcelas - 1) n;
    
    -- Registrar em audit trail
    INSERT INTO public.audit_trail (
      entidade_tipo,
      entidade_id,
      acao,
      acao_detalhe,
      user_id,
      metadata
    ) VALUES (
      'contrato',
      NEW.id,
      'gerar_titulos',
      'Títulos a receber gerados automaticamente',
      auth.uid(),
      jsonb_build_object(
        'num_titulos', v_num_parcelas,
        'valor_parcela', v_valor_parcela
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_gerar_titulos_contrato ON public.contratos;
CREATE TRIGGER trg_gerar_titulos_contrato
AFTER INSERT OR UPDATE ON public.contratos
FOR EACH ROW
EXECUTE FUNCTION public.fn_gerar_titulos_contrato();

-- 2. Function: Notificar vencimentos próximos (usada pelo pg_cron)
CREATE OR REPLACE FUNCTION public.fn_notificar_vencimentos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo RECORD;
  v_responsavel_id UUID;
BEGIN
  -- Títulos a PAGAR vencendo em 7 dias
  FOR v_titulo IN 
    SELECT t.*, f.razao_social as fornecedor_nome
    FROM titulos_financeiros t
    LEFT JOIN fornecedores f ON t.fornecedor_id = f.id
    WHERE t.tipo = 'pagar'
      AND t.status = 'pendente'
      AND t.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  LOOP
    -- Notificar equipe financeira
    INSERT INTO notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    )
    SELECT 
      ur.user_id,
      '⚠️ Conta a Pagar Vencendo',
      'Título: ' || v_titulo.descricao || ' - Vencimento: ' || TO_CHAR(v_titulo.data_vencimento, 'DD/MM/YYYY') || ' - Valor: R$ ' || TO_CHAR(v_titulo.valor_liquido, 'FM999G999G990D00'),
      'warning',
      v_titulo.data_vencimento
    FROM user_roles ur
    WHERE ur.role IN ('admin', 'financeiro', 'gestor');
  END LOOP;

  -- Títulos a RECEBER vencidos
  FOR v_titulo IN 
    SELECT t.*, c.nome as cliente_nome
    FROM titulos_financeiros t
    LEFT JOIN clientes c ON t.cliente_id = c.id
    WHERE t.tipo = 'receber'
      AND t.status = 'vencido'
  LOOP
    -- Notificar equipe comercial/financeira
    INSERT INTO notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    )
    SELECT 
      ur.user_id,
      '🔴 Título Vencido - Cobrança Necessária',
      'Cliente: ' || v_titulo.cliente_nome || ' - Título: ' || v_titulo.descricao || ' - Vencido em: ' || TO_CHAR(v_titulo.data_vencimento, 'DD/MM/YYYY'),
      'error',
      CURRENT_TIMESTAMP
    FROM user_roles ur
    WHERE ur.role IN ('admin', 'financeiro', 'gestor', 'atendimento');
  END LOOP;
END;
$$;

-- 3. Configurar pg_cron (executar diariamente às 8h)
-- Nota: pg_cron precisa estar habilitado no Supabase
SELECT cron.schedule(
  'notificar-vencimentos-titulos',
  '0 8 * * *', -- 8h da manhã, todo dia
  $$SELECT public.fn_notificar_vencimentos();$$
);

-- 4. View: Dashboard de Vencimentos
CREATE OR REPLACE VIEW public.vw_dashboard_vencimentos AS
SELECT 
  tipo,
  COUNT(*) FILTER (WHERE status = 'vencido') as total_vencidos,
  COUNT(*) FILTER (WHERE status = 'pendente' AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as total_vencendo_7d,
  COUNT(*) FILTER (WHERE status = 'pendente' AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as total_vencendo_30d,
  COUNT(*) FILTER (WHERE status = 'pago') as total_pagos,
  SUM(valor_liquido) FILTER (WHERE status = 'vencido') as valor_vencidos,
  SUM(valor_liquido) FILTER (WHERE status = 'pendente' AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as valor_vencendo_7d,
  SUM(valor_liquido) FILTER (WHERE status = 'pendente') as valor_total_pendente,
  SUM(valor_pago) FILTER (WHERE status = 'pago') as valor_total_pago
FROM titulos_financeiros
GROUP BY tipo;

-- Grant permissions
GRANT SELECT ON public.vw_dashboard_vencimentos TO authenticated;

-- Comentários
COMMENT ON FUNCTION public.fn_gerar_titulos_contrato IS 'Gera títulos a receber automaticamente quando um contrato é ativado';
COMMENT ON FUNCTION public.fn_notificar_vencimentos IS 'Notifica equipe sobre títulos vencendo ou vencidos - executado diariamente pelo pg_cron';
COMMENT ON VIEW public.vw_dashboard_vencimentos IS 'Dashboard consolidado de vencimentos de títulos a pagar e receber';