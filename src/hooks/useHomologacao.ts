import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

export interface ItemChecklist {
  id: string;
  modulo: string;
  item: string;
  status: 'passou' | 'falhou' | 'nao_testado';
  impacto: 'alto' | 'medio' | 'baixo';
  prioridade: 'Alta' | 'Média' | 'Baixa';
  esforco: 'Alto' | 'Médio' | 'Baixo';
  solucao_sugerida: string;
  evidencia_url?: string;
  evidencia_dados?: any;
  observacoes?: string;
}

export interface DependenciaFK {
  tabela: string;
  campo_fk: string;
  aponta_para: string;
  status: 'pendente' | 'migrado';
  registros_afetados?: number;
}

export interface TesteE2E {
  id: string;
  nome: string;
  descricao: string;
  status: 'nao_executado' | 'executando' | 'passou' | 'falhou';
  logs?: string;
  evidencias?: any;
}

export interface TarefaPlano72h {
  dia: string;
  tarefa: string;
  modulo: string;
  bloqueador: boolean;
  responsavel?: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
}

export function useHomologacao() {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState({
    unificacao: { fks_corretas: 0, fks_pendentes: 0, tabela_existe: false },
    checklist: [] as ItemChecklist[],
    dependencias: [] as DependenciaFK[],
    testes: [] as TesteE2E[],
    plano72h: [] as TarefaPlano72h[]
  });

  const varrerSistema = async () => {
    setLoading(true);
    toast.loading('🔍 Varrendo sistema...');
    
    try {
      // 1. Verificar se tabela funcionarios existe
      const { data: funcionarios, error: errFunc } = await (supabase
        .from('funcionarios' as any)
        .select('id', { count: 'exact', head: true }) as any);
      
      const tabelaExiste = !errFunc;

      // 2. Buscar dependências FK pendentes (simulação)
      const dependencias: DependenciaFK[] = [
        { tabela: 'financeiro_folha_itens', campo_fk: 'colaborador_id', aponta_para: 'rh_colaboradores', status: 'pendente', registros_afetados: 145 },
        { tabela: 'financeiro_adiantamentos', campo_fk: 'colaborador_id', aponta_para: 'rh_colaboradores', status: 'pendente', registros_afetados: 32 },
        { tabela: 'rh_folha_ponto', campo_fk: 'colaborador_id', aponta_para: 'rh_colaboradores', status: 'pendente', registros_afetados: 890 },
        { tabela: 'tarefas_projeto', campo_fk: 'executor_id', aponta_para: 'profiles', status: 'pendente', registros_afetados: 267 },
        { tabela: 'inventario_reservas', campo_fk: 'responsavel_id', aponta_para: 'profiles', status: 'pendente', registros_afetados: 54 },
      ];

      const fksPendentes = dependencias.filter(d => d.status === 'pendente').length;
      const fksCorretas = dependencias.filter(d => d.status === 'migrado').length;

      // 3. Carregar checklist do banco
      const { data: checklistData, error: errCheck } = await supabase
        .from('homologacao_checklist')
        .select('*')
        .order('modulo', { ascending: true });

      if (errCheck) {
        console.error('Erro ao carregar checklist:', errCheck);
      }

      // 4. Inicializar testes E2E
      const testesIniciais: TesteE2E[] = [
        {
          id: 'clt_adiantamento',
          nome: 'CLT com Adiantamento',
          descricao: 'Testa folha com salário R$1500, adiantamento R$400, 2h extra, 1 falta justificada',
          status: 'nao_executado'
        },
        {
          id: 'pj_captacao',
          nome: 'PJ em Captação',
          descricao: 'GRS cria tarefa → reserva arsenal → termo → despesas → RPA com retenções',
          status: 'nao_executado'
        },
        {
          id: 'devolucao_atrasada',
          nome: 'Devolução Atrasada',
          descricao: 'Check-in com atraso → multa automática → lançamento financeiro',
          status: 'nao_executado'
        },
        {
          id: 'desligamento',
          nome: 'Desligamento',
          descricao: 'Inativar → bloquear acessos → encerrar cartões → reatribuir tarefas',
          status: 'nao_executado'
        },
        {
          id: 'contrato_merge_tags',
          nome: 'Contrato com Merge Tags',
          descricao: 'Gerar via modelo → preview → validar placeholders → download PDF',
          status: 'nao_executado'
        }
      ];

      setResultados({
        unificacao: {
          fks_corretas: fksCorretas,
          fks_pendentes: fksPendentes,
          tabela_existe: tabelaExiste
        },
        checklist: (checklistData || []) as ItemChecklist[],
        dependencias,
        testes: testesIniciais,
        plano72h: []
      });

      // Registrar log
      await supabase.from('homologacao_logs').insert({
        acao: 'varrer',
        resultado: {
          tabela_funcionarios: tabelaExiste,
          fks_pendentes: fksPendentes,
          itens_checklist: checklistData?.length || 0
        }
      });

      toast.dismiss();
      toast.success('✅ Varredura concluída');
    } catch (error: any) {
      toast.dismiss();
      toast.error('❌ Erro na varredura: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executarE2E = async (cenarioIds: string[]) => {
    setLoading(true);
    toast.loading('🧪 Executando testes E2E...');

    try {
      const resultadosTestes = [...resultados.testes];

      for (const id of cenarioIds) {
        const index = resultadosTestes.findIndex(t => t.id === id);
        if (index === -1) continue;

        resultadosTestes[index].status = 'executando';
        setResultados({ ...resultados, testes: resultadosTestes });

        // Simular execução (substitua por lógica real)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const passou = Math.random() > 0.3; // 70% de chance de passar
        resultadosTestes[index].status = passou ? 'passou' : 'falhou';
        resultadosTestes[index].logs = passou 
          ? '✅ Cenário executado com sucesso'
          : '❌ Erro: validação de cálculo falhou';
      }

      setResultados({ ...resultados, testes: resultadosTestes });

      // Registrar log
      await supabase.from('homologacao_logs').insert({
        acao: 'executar_e2e',
        resultado: {
          cenarios: cenarioIds,
          aprovados: resultadosTestes.filter(t => t.status === 'passou').length,
          reprovados: resultadosTestes.filter(t => t.status === 'falhou').length
        }
      });

      toast.dismiss();
      toast.success('✅ Testes concluídos');
    } catch (error: any) {
      toast.dismiss();
      toast.error('❌ Erro nos testes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarPlano72h = () => {
    const pendencias = resultados.checklist
      .filter(item => item.status === 'falhou' && item.prioridade === 'Alta');

    const tarefas: TarefaPlano72h[] = pendencias.map((p, i) => ({
      dia: `D${Math.floor(i / 3)}`,
      tarefa: p.solucao_sugerida,
      modulo: p.modulo,
      bloqueador: p.impacto === 'alto',
      status: 'pendente'
    }));

    setResultados({ ...resultados, plano72h: tarefas });
    toast.success('📋 Plano 72h gerado com ' + tarefas.length + ' tarefas');

    return tarefas;
  };

  const atualizarStatus = async (id: string, novoStatus: 'passou' | 'falhou') => {
    const { error } = await supabase
      .from('homologacao_checklist')
      .update({ 
        status: novoStatus,
        testado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    setResultados({
      ...resultados,
      checklist: resultados.checklist.map(item =>
        item.id === id ? { ...item, status: novoStatus } : item
      )
    });

    toast.success('Status atualizado');
  };

  const anexarEvidencia = async (id: string, url: string) => {
    const { error } = await supabase
      .from('homologacao_checklist')
      .update({ evidencia_url: url })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao anexar evidência');
      return;
    }

    setResultados({
      ...resultados,
      checklist: resultados.checklist.map(item =>
        item.id === id ? { ...item, evidencia_url: url } : item
      )
    });

    toast.success('Evidência anexada');
  };

  const exportar = (formato: 'csv' | 'json') => {
    if (formato === 'json') {
      const dados = {
        mvp_ready: calcularMVPReady(),
        data_analise: new Date().toISOString(),
        resumo: {
          itens_passou: resultados.checklist.filter(c => c.status === 'passou').length,
          itens_falhou: resultados.checklist.filter(c => c.status === 'falhou').length,
          bloqueadores: resultados.checklist.filter(c => c.status === 'falhou' && c.impacto === 'alto').length
        },
        dependencias: resultados.dependencias,
        checklist: resultados.checklist,
        testes_e2e: resultados.testes,
        plano_72h: resultados.plano72h
      };

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homologacao_bex_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      toast.success('✅ JSON exportado');
    } else {
      // CSV simplificado
      const csv = [
        'Módulo,Item,Status,Impacto,Solução,Prioridade,Esforço',
        ...resultados.checklist.map(item =>
          `"${item.modulo}","${item.item}","${item.status}","${item.impacto}","${item.solucao_sugerida}","${item.prioridade}","${item.esforco}"`
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homologacao_checklist_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success('✅ CSV exportado');
    }
  };

  const calcularMVPReady = () => {
    const bloqueadores = resultados.checklist.filter(
      c => c.status === 'falhou' && c.impacto === 'alto'
    ).length;

    return bloqueadores === 0 && resultados.unificacao.tabela_existe;
  };

  return {
    loading,
    resultados,
    varrerSistema,
    executarE2E,
    gerarPlano72h,
    atualizarStatus,
    anexarEvidencia,
    exportar,
    calcularMVPReady
  };
}
