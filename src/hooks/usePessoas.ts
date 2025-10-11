import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface Pessoa {
  id: string;
  nome: string;
  email?: string;
  cpf?: string;
  telefones?: string[];
  papeis: ('colaborador' | 'especialista' | 'cliente')[];
  dados_bancarios?: {
    banco_codigo?: string;
    banco_nome?: string;
    agencia?: string;
    conta?: string;
    tipo_conta?: string;
    pix_tipo?: string;
    pix_chave?: string;
  };
  cargo_id?: string;
  cargo_atual?: string;
  regime?: 'clt' | 'pj' | 'estagio' | 'freelancer';
  data_admissao?: string;
  data_desligamento?: string;
  status: 'ativo' | 'afastado' | 'desligado' | 'ferias' | 'inativo';
  salario_base?: number;
  fee_mensal?: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export function usePessoas(papel?: 'colaborador' | 'especialista' | 'cliente') {
  const queryClient = useQueryClient();

  const { data: pessoas = [], isLoading } = useQuery({
    queryKey: ['pessoas', papel],
    queryFn: async () => {
      let query = supabase.from('pessoas').select('*').order('nome', { ascending: true });
      
      if (papel) {
        query = query.contains('papeis', [papel]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Pessoa[];
    },
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>) => {
      // Validações
      if (!dados.papeis || dados.papeis.length === 0) {
        throw new Error('Pelo menos um papel deve ser selecionado');
      }

      if (dados.cpf) {
        const { data: existe } = await supabase
          .from('pessoas')
          .select('id')
          .eq('cpf', dados.cpf)
          .single();
        
        if (existe) {
          throw new Error('CPF já cadastrado');
        }
      }

      if (dados.email) {
        const { data: existe } = await supabase
          .from('pessoas')
          .select('id')
          .eq('email', dados.email)
          .single();
        
        if (existe) {
          throw new Error('Email já cadastrado');
        }
      }

      const { data, error } = await supabase
        .from('pessoas')
        .insert([dados])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      smartToast.success('Pessoa cadastrada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao cadastrar pessoa', error.message);
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pessoa> & { id: string }) => {
      const { data, error } = await supabase
        .from('pessoas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      smartToast.success('Pessoa atualizada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao atualizar pessoa', error.message);
    },
  });

  const desativarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pessoas')
        .update({ status: 'desligado', data_desligamento: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      smartToast.success('Pessoa desativada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao desativar pessoa', error.message);
    },
  });

  return {
    pessoas,
    isLoading,
    criar: criarMutation.mutate,
    atualizar: atualizarMutation.mutate,
    desativar: desativarMutation.mutate,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isDesativando: desativarMutation.isPending,
  };
}
