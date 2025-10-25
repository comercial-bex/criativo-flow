-- Aplicar triggers às tabelas correspondentes

-- Trigger para registrar custos de tarefas finalizadas
DROP TRIGGER IF EXISTS trg_registrar_custo_tarefa ON tarefa;
CREATE TRIGGER trg_registrar_custo_tarefa
  AFTER UPDATE OF status ON tarefa
  FOR EACH ROW
  EXECUTE FUNCTION fn_registrar_custo_tarefa();

-- Trigger para registrar custos de eventos externos
DROP TRIGGER IF EXISTS trg_registrar_custo_evento ON eventos_calendario;
CREATE TRIGGER trg_registrar_custo_evento
  AFTER INSERT ON eventos_calendario
  FOR EACH ROW
  EXECUTE FUNCTION fn_registrar_custo_evento();

-- Trigger para registrar lançamentos de folha pagos
DROP TRIGGER IF EXISTS trg_registrar_lancamento_folha ON financeiro_folha_itens;
CREATE TRIGGER trg_registrar_lancamento_folha
  AFTER UPDATE OF status ON financeiro_folha_itens
  FOR EACH ROW
  EXECUTE FUNCTION fn_registrar_lancamento_folha();

-- Criar view para mapa de dívidas usando campos existentes
CREATE OR REPLACE VIEW vw_mapa_dividas AS
SELECT 
  d.id as divida_id,
  d.tipo,
  d.credor_devedor,
  d.descricao,
  d.valor_total,
  d.valor_pago,
  d.valor_restante,
  d.numero_parcelas,
  0::integer as parcelas_pagas_count,
  0::integer as parcelas_vencidas_count,
  NULL::date as proximo_vencimento,
  d.status,
  cc.nome as centro_custo_nome,
  d.data_emissao,
  d.cliente_id,
  d.fornecedor_id,
  d.centro_custo_id,
  c.nome as cliente_nome
FROM dividas d
LEFT JOIN clientes c ON d.cliente_id = c.id
LEFT JOIN centros_custo cc ON d.centro_custo_id = cc.id;

COMMENT ON VIEW vw_mapa_dividas IS 'View consolidada do mapa de dívidas';