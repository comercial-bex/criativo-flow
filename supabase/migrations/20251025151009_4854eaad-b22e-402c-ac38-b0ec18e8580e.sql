-- Criar view consolidada de lançamentos com origem
CREATE OR REPLACE VIEW vw_lancamentos_origem AS
SELECT 
  fl.id,
  fl.data_lancamento,
  fl.descricao,
  fl.valor,
  fl.tipo_lancamento,
  fl.tipo_origem,
  fl.origem_id,
  fl.tarefa_id,
  fl.evento_id,
  fl.folha_item_id,
  fl.projeto_id,
  fl.cliente_id,
  
  -- Dados de Tarefa
  t.titulo as tarefa_titulo,
  t.status as tarefa_status,
  
  -- Dados de Evento
  e.titulo as evento_titulo,
  e.tipo as evento_tipo,
  
  -- Dados de Folha (quando implementado)
  NULL::text as folha_descricao,
  NULL::text as folha_referencia,
  
  -- Dados de Projeto
  p.titulo as projeto_titulo,
  
  -- Dados de Cliente
  COALESCE(c1.nome, c2.nome) as cliente_nome,
  
  -- Calcular tipo de transação baseado nas contas
  CASE 
    WHEN cd.codigo LIKE '1%' OR cd.codigo LIKE '2%' THEN 'receita'
    WHEN cd.codigo LIKE '3%' OR cd.codigo LIKE '4%' THEN 'despesa'
    ELSE 'indefinido'
  END as tipo_transacao,
  
  -- Percentual do projeto (lançamento/custo total do projeto)
  CASE 
    WHEN p.id IS NOT NULL AND (SELECT SUM(valor) FROM financeiro_lancamentos WHERE projeto_id = p.id) > 0 THEN 
      (fl.valor / (SELECT SUM(valor) FROM financeiro_lancamentos WHERE projeto_id = p.id)) * 100
    ELSE NULL
  END as percentual_projeto

FROM financeiro_lancamentos fl
LEFT JOIN tarefa t ON fl.tarefa_id = t.id
LEFT JOIN eventos_calendario e ON fl.evento_id = e.id
LEFT JOIN projetos p ON fl.projeto_id = p.id
LEFT JOIN clientes c1 ON fl.cliente_id = c1.id
LEFT JOIN clientes c2 ON p.cliente_id = c2.id
LEFT JOIN financeiro_plano_contas cd ON fl.conta_debito_id = cd.id
ORDER BY fl.data_lancamento DESC;