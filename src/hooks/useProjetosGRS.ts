import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Projeto {
  id: string;
  titulo: string;
  status: string;
  data_prazo: string | null;
  cliente_id: string;
  cliente_nome: string;
  progresso: number;
}

interface Metricas {
  projetosPendentes: number;
  tarefasNovo: number;
  tarefasEmAndamento: number;
  tarefasConcluido: number;
}

export function useProjetosGRS() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    projetosPendentes: 0,
    tarefasNovo: 0,
    tarefasEmAndamento: 0,
    tarefasConcluido: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar projetos do GRS
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          id,
          titulo,
          status,
          data_prazo,
          cliente_id,
          progresso,
          clientes:cliente_id (
            nome
          )
        `)
        .eq('responsavel_grs_id', user?.id)
        .not('status', 'in', '("arquivado","inativo")')
        .order('data_prazo', { ascending: true })
        .limit(10);

      if (projetosError) throw projetosError;

      const projetosFormatados = (projetosData || []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        status: p.status,
        data_prazo: p.data_prazo,
        cliente_id: p.cliente_id,
        cliente_nome: p.clientes?.nome || 'Cliente',
        progresso: p.progresso || 0
      }));

      setProjetos(projetosFormatados);

      // Calcular métricas
      const { count: pendentes } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_grs_id', user?.id)
        .eq('status', 'ativo');

      const { count: novo } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', user?.id)
        .eq('status', 'backlog');

      const { count: emAndamento } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', user?.id)
        .eq('status', 'em_producao');

      const { count: concluido } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', user?.id)
        .eq('status', 'publicado');

      setMetricas({
        projetosPendentes: pendentes || 0,
        tarefasNovo: novo || 0,
        tarefasEmAndamento: emAndamento || 0,
        tarefasConcluido: concluido || 0
      });

    } catch (error) {
      console.error('Erro ao buscar dados GRS:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return {
    projetos,
    metricas,
    loading,
    refresh: fetchData
  };
}
