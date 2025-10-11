import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RiscoPreditivo {
  id: string;
  responsavel_id: string;
  executor_id?: string;
  score_risco: number;
  status: 'normal' | 'alerta' | 'critico';
  carga_atual: number;
  tarefas_pendentes: number;
  prazo_mais_proximo?: string;
  sugestao: string;
  metadata?: any;
  created_at: string;
  responsavel?: {
    nome: string;
    especialidade: string;
    avatar_url?: string;
  };
}

export function useRiscoPreditivo() {
  const [riscos, setRiscos] = useState<RiscoPreditivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [executando, setExecutando] = useState(false);
  const { toast } = useToast();

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase.rpc('get_riscos_preditivos' as any) as any;

      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error('Erro ao buscar riscos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os riscos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const executarAnalise = async () => {
    setExecutando(true);
    try {
      const { error } = await supabase.functions.invoke('ia-preditiva');
      
      if (error) throw error;

      toast({
        title: 'Análise concluída',
        description: 'Riscos atualizados com sucesso'
      });

      await fetchRiscos();
    } catch (error) {
      console.error('Erro ao executar análise:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar análise preditiva',
        variant: 'destructive'
      });
    } finally {
      setExecutando(false);
    }
  };

  useEffect(() => {
    fetchRiscos();

    // Subscription para atualizações em tempo real
    const channel = supabase
      .channel('risco-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'risco_producao'
      }, () => {
        fetchRiscos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    riscos,
    loading,
    executando,
    executarAnalise,
    refetch: fetchRiscos
  };
}
