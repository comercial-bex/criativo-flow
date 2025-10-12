import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Atividade {
  id: string;
  acao: string;
  descricao: string;
  created_at: string;
  profile_nome: string;
  profile_avatar_url: string | null;
  metadata: any;
}

export function useTimelineAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAtividades = async () => {
    try {
      setLoading(true);

      // Buscar clientes onde o usuário é responsável
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id')
        .eq('responsavel_id', user?.id);

      if (clientesError) throw clientesError;

      const clienteIds = clientesData?.map(c => c.id) || [];

      if (clienteIds.length === 0) {
        setAtividades([]);
        setLoading(false);
        return;
      }

      // Buscar logs de atividade
      const { data: logsData, error: logsError } = await supabase
        .from('logs_atividade')
        .select(`
          id,
          acao,
          descricao,
          created_at,
          metadata,
          profiles:usuario_id (
            nome,
            avatar_url
          )
        `)
        .in('cliente_id', clienteIds)
        .in('entidade_tipo', ['tarefa', 'projeto', 'planejamento'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      const atividadesFormatadas = (logsData || []).map((log: any) => ({
        id: log.id,
        acao: log.acao,
        descricao: log.descricao,
        created_at: log.created_at,
        profile_nome: log.profiles?.nome || 'Usuário',
        profile_avatar_url: log.profiles?.avatar_url || null,
        metadata: log.metadata
      }));

      setAtividades(atividadesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as atividades recentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAtividades();

      // Configurar realtime subscription
      const channel = supabase
        .channel('timeline-atividades')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs_atividade'
          },
          () => {
            fetchAtividades();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    atividades,
    loading,
    refresh: fetchAtividades
  };
}
