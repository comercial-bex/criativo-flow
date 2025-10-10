import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContaContabil {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'ativo' | 'passivo' | 'receita' | 'despesa';
  natureza: 'debito' | 'credito';
  nivel: number;
  conta_pai_id?: string;
  aceita_lancamento: boolean;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export function usePlanoContas(tipo?: string) {
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['plano-contas', tipo],
    queryFn: async () => {
      let query = supabase.from('financeiro_plano_contas').select('*').eq('ativo', true).order('codigo');
      
      if (tipo) query = query.eq('tipo', tipo);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContaContabil[];
    },
  });

  const contasAtivasParaLancamento = contas.filter(c => c.aceita_lancamento);

  return {
    contas,
    contasAtivasParaLancamento,
    isLoading,
  };
}
