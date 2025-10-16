import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, TrendingUp } from "lucide-react";

export function MetricasReaisDesign() {
  const { user } = useAuth();
  const [metricas, setMetricas] = useState({
    tempoMedio: 0,
    taxaAprovacao: 0,
    loading: true
  });

  useEffect(() => {
    calcularMetricas();
  }, [user]);

  const calcularMetricas = async () => {
    try {
      if (!user) return;

      console.log('📊 [Métricas] Calculando métricas reais...');

      // Calcular tempo médio de produção (em horas)
      // Usando created_at e updated_at como proxy para tempo de trabalho
      const { data: tarefasCompletas, error: tempoError } = await supabase
        .from('tarefa')
        .select('created_at, updated_at, horas_trabalhadas')
        .eq('executor_id', user.id)
        .eq('executor_area', 'Criativo')
        .in('status', ['concluido', 'entregue'])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias

      if (tempoError) throw tempoError;

      // Usar horas_trabalhadas se disponível, senão calcular diferença entre datas
      const temposTrabalho = (tarefasCompletas || []).map(t => {
        if (t.horas_trabalhadas && t.horas_trabalhadas > 0) {
          return t.horas_trabalhadas;
        }
        const inicio = new Date(t.created_at);
        const fim = new Date(t.updated_at);
        return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60); // Converter para horas
      }).filter(t => t > 0 && t < 100); // Filtrar outliers

      const tempoMedio = temposTrabalho.length > 0
        ? temposTrabalho.reduce((acc, t) => acc + t, 0) / temposTrabalho.length
        : 0;

      // Calcular taxa de aprovação
      const { data: aprovacoes, error: aprovError } = await supabase
        .from('aprovacao_tarefa')
        .select('status_aprovacao, tarefa:tarefa_id(executor_id)')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (aprovError) throw aprovError;

      const aprovacoesUsuario = (aprovacoes || []).filter(
        (a: any) => a.tarefa?.executor_id === user.id
      );

      const totalAprovacoes = aprovacoesUsuario.length;
      const aprovadas = aprovacoesUsuario.filter(
        (a: any) => a.status_aprovacao === 'aprovado'
      ).length;

      const taxaAprovacao = totalAprovacoes > 0
        ? (aprovadas / totalAprovacoes) * 100
        : 0;

      console.log('✅ [Métricas] Calculadas:', {
        tempoMedio: tempoMedio.toFixed(1),
        taxaAprovacao: taxaAprovacao.toFixed(0),
        tarefasAnalisadas: tarefasCompletas?.length || 0,
        aprovacoesAnalisadas: totalAprovacoes
      });

      setMetricas({
        tempoMedio,
        taxaAprovacao,
        loading: false
      });
    } catch (error) {
      console.error('❌ [Métricas] Erro ao calcular:', error);
      setMetricas({
        tempoMedio: 0,
        taxaAprovacao: 0,
        loading: false
      });
    }
  };

  if (metricas.loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tempo Médio de Produção</span>
          <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de Aprovação</span>
          <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tempo Médio de Produção</span>
        </div>
        <span className="text-2xl font-bold">
          {metricas.tempoMedio > 0 ? `${metricas.tempoMedio.toFixed(1)}h` : 'N/A'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Taxa de Aprovação</span>
        </div>
        <span className="text-2xl font-bold">
          {metricas.taxaAprovacao > 0 ? `${metricas.taxaAprovacao.toFixed(0)}%` : 'N/A'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground text-center pt-2 border-t">
        Métricas dos últimos 30 dias
      </p>
    </div>
  );
}
