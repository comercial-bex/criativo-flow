/**
 * ============================================================================
 * TESTE E2E: VALIDAÇÃO DO FLUXO GRS
 * ============================================================================
 * Valida a propagação automática de Planejamento → Tarefa → Aprovação
 * com rastreabilidade via trace_id
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xvpqgwbktpfodbuhwqhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  test: string;
  passed: boolean;
  duration_ms: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Cria fixtures de teste (Cliente, Projeto, Especialistas, Orçamento)
 */
async function createFixtures() {
  const startTime = Date.now();
  
  try {
    // 1. Criar Cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        nome: 'Cliente Teste E2E',
        email: 'teste-e2e@example.com',
        status: 'ativo',
      })
      .select()
      .single();

    if (clienteError) throw clienteError;

    // 2. Criar Especialistas (GRS, Designer, Filmmaker)
    const { data: especialistas, error: especialistasError } = await supabase
      .from('profiles')
      .insert([
        { nome: 'GRS Teste', email: 'grs-teste@example.com', especialidade: 'grs' },
        { nome: 'Designer Teste', email: 'designer-teste@example.com', especialidade: 'designer' },
        { nome: 'Filmmaker Teste', email: 'filmmaker-teste@example.com', especialidade: 'filmmaker' },
      ])
      .select();

    if (especialistasError) throw especialistasError;

    const [grs, designer, filmmaker] = especialistas;

    // 3. Criar Projeto
    const { data: projeto, error: projetoError } = await supabase
      .from('projetos')
      .insert({
        cliente_id: cliente.id,
        titulo: 'Projeto Teste E2E',
        mes_referencia: new Date().toISOString().slice(0, 10),
        status: 'em_andamento',
        responsavel_grs_id: grs.id,
      })
      .select()
      .single();

    if (projetoError) throw projetoError;

    // 4. Criar Orçamento (necessário para validação de vínculo)
    const { data: orcamento, error: orcamentoError } = await supabase
      .from('orcamentos')
      .insert({
        cliente_id: cliente.id,
        projeto_id: projeto.id,
        titulo: 'Orçamento Teste E2E',
        status: 'aprovado',
        total: 1000,
      })
      .select()
      .single();

    if (orcamentoError) throw orcamentoError;

    results.push({
      test: '1. Criar Fixtures',
      passed: true,
      duration_ms: Date.now() - startTime,
      details: `Cliente: ${cliente.id}, Projeto: ${projeto.id}, Especialistas: ${especialistas.length}`,
    });

    return { cliente, projeto, especialistas: { grs, designer, filmmaker }, orcamento };
  } catch (error) {
    results.push({
      test: '1. Criar Fixtures',
      passed: false,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Cria e aprova Planejamento para acionar o trigger
 */
async function createAndApprovePlanejamento(clienteId: string, projetoId: string, especialistas: any) {
  const startTime = Date.now();

  try {
    const { data: planejamento, error: planejamentoError } = await supabase
      .from('planejamentos')
      .insert({
        cliente_id: clienteId,
        projeto_id: projetoId,
        titulo: 'Planejamento Teste E2E',
        mes_referencia: new Date().toISOString().slice(0, 10),
        status: 'rascunho',
        descricao: JSON.stringify({
          especialistas: {
            grs_id: especialistas.grs.id,
            designer_id: especialistas.designer.id,
            filmmaker_id: especialistas.filmmaker.id,
          },
        }),
      })
      .select()
      .single();

    if (planejamentoError) throw planejamentoError;

    // Aprovar planejamento (aciona o trigger)
    const { error: aprovacaoError } = await supabase
      .from('planejamentos')
      .update({ status: 'aprovado' })
      .eq('id', planejamento.id);

    if (aprovacaoError) throw aprovacaoError;

    // Aguardar propagação (trigger assíncrono)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    results.push({
      test: '2. Criar e Aprovar Planejamento',
      passed: true,
      duration_ms: Date.now() - startTime,
      details: `Planejamento ID: ${planejamento.id}`,
    });

    return planejamento;
  } catch (error) {
    results.push({
      test: '2. Criar e Aprovar Planejamento',
      passed: false,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Valida que tarefas foram criadas corretamente
 */
async function validateTasksCreated(planejamentoId: string) {
  const startTime = Date.now();

  try {
    const { data: tarefas, error } = await supabase
      .from('tarefas_projeto')
      .select('*')
      .eq('origem', 'planejamento')
      .eq('grs_action_id', planejamentoId);

    if (error) throw error;

    const passed = tarefas && tarefas.length >= 2; // Mínimo GRS + Designer

    results.push({
      test: '3. Validar Tarefas Criadas',
      passed,
      duration_ms: Date.now() - startTime,
      details: `Tarefas encontradas: ${tarefas?.length || 0}`,
    });

    return tarefas;
  } catch (error) {
    results.push({
      test: '3. Validar Tarefas Criadas',
      passed: false,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return [];
  }
}

/**
 * Valida que aprovação foi criada para o cliente
 */
async function validateApprovalCreated(planejamentoId: string) {
  const startTime = Date.now();

  try {
    const { data: aprovacao, error } = await supabase
      .from('aprovacoes_cliente')
      .select('*')
      .eq('tipo', 'planejamento')
      .eq('referencia_id', planejamentoId)
      .single();

    if (error) throw error;

    const passed = !!aprovacao && !!aprovacao.hash_publico;

    results.push({
      test: '4. Validar Aprovação Criada',
      passed,
      duration_ms: Date.now() - startTime,
      details: `Aprovação ID: ${aprovacao?.id}, Hash: ${aprovacao?.hash_publico}`,
    });

    return aprovacao;
  } catch (error) {
    results.push({
      test: '4. Validar Aprovação Criada',
      passed: false,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Valida que trace_id é compartilhado entre tarefa, aprovação e logs
 */
async function validateTraceIdCorrelation(tarefas: any[], aprovacao: any) {
  const startTime = Date.now();

  try {
    if (!tarefas.length || !aprovacao) {
      throw new Error('Tarefas ou aprovação não disponíveis para validação');
    }

    const traceId = tarefas[0].trace_id;
    const traceIdsMatch = tarefas.every((t) => t.trace_id === traceId) && aprovacao.trace_id === traceId;

    // Validar logs com mesmo trace_id
    const { data: logs, error: logsError } = await supabase
      .from('logs_atividade')
      .select('*')
      .eq('trace_id', traceId);

    if (logsError) throw logsError;

    const passed = traceIdsMatch && logs && logs.length > 0;

    results.push({
      test: '5. Validar Correlação trace_id',
      passed,
      duration_ms: Date.now() - startTime,
      details: `trace_id: ${traceId}, Logs encontrados: ${logs?.length || 0}`,
    });
  } catch (error) {
    results.push({
      test: '5. Validar Correlação trace_id',
      passed: false,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Executa todos os testes E2E
 */
async function runE2ETests() {
  console.log('🧪 Iniciando Testes E2E do Fluxo GRS...\n');

  try {
    const fixtures = await createFixtures();
    const planejamento = await createAndApprovePlanejamento(
      fixtures.cliente.id,
      fixtures.projeto.id,
      fixtures.especialistas
    );
    const tarefas = await validateTasksCreated(planejamento.id);
    const aprovacao = await validateApprovalCreated(planejamento.id);
    await validateTraceIdCorrelation(tarefas, aprovacao);

    // Relatório final
    console.log('\n📊 RELATÓRIO DE TESTES E2E\n');
    console.log('═'.repeat(80));
    
    results.forEach((result) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} | ${result.test} (${result.duration_ms}ms)`);
      if (result.details) console.log(`   └─ ${result.details}`);
      if (result.error) console.log(`   └─ ❌ ${result.error}`);
    });

    console.log('═'.repeat(80));
    const totalPassed = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    console.log(`\n🎯 Resultado Final: ${totalPassed}/${totalTests} testes passaram\n`);

    // Salvar relatório em JSON
    const report = {
      timestamp: new Date().toISOString(),
      total_tests: totalTests,
      passed: totalPassed,
      failed: totalTests - totalPassed,
      results,
    };

    console.log('📄 Relatório JSON:', JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('❌ Erro fatal nos testes E2E:', error);
  }
}

// Exportar função para uso externo
export { runE2ETests };
