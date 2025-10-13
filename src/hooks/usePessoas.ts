import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface Pessoa {
  id: string;
  nome: string;
  email?: string | null;
  cpf?: string | null;
  telefones?: any; // JSONB array
  papeis: string[]; // pessoa_papel[]
  dados_bancarios?: any;
  cargo_id?: string | null;
  cargo_atual?: string | null;
  regime?: string | null; // pessoa_regime
  data_admissao?: string | null;
  data_nascimento?: string | null; // Campo adicionado
  data_desligamento?: string | null;
  status?: string; // pessoa_status
  salario_base?: number | null;
  fee_mensal?: number | null;
  observacoes?: string | null;
  profile_id?: string | null;
  cliente_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  // Campos computados
  role?: string | null;
  tem_acesso_sistema?: boolean;
}

export function usePessoas(papel?: 'colaborador' | 'especialista' | 'cliente') {
  const queryClient = useQueryClient();

  const { data: pessoas = [], isLoading } = useQuery({
    queryKey: ['pessoas', papel],
    queryFn: async () => {
      let query = supabase
        .from('pessoas')
        .select(`
          *,
          user_roles(role)
        `)
        .order('nome', { ascending: true });
      
      if (papel) {
        query = query.contains('papeis', [papel]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Processar dados retornados
      return (data || []).map((p: any) => ({
        ...p,
        role: p.user_roles?.[0]?.role || null,
        tem_acesso_sistema: !!p.profile_id
      })) as Pessoa[];
    },
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>) => {
      // Validações
      if (!dados.papeis || dados.papeis.length === 0) {
        throw new Error('Pelo menos um papel deve ser selecionado');
      }

      // FASE 3: Usar maybeSingle() para evitar erros quando não há duplicatas
      if (dados.cpf) {
        const { data: existe } = await supabase
          .from('pessoas')
          .select('id')
          .eq('cpf', dados.cpf)
          .maybeSingle();
        
        if (existe) {
          throw new Error('CPF já cadastrado');
        }
      }

      if (dados.email) {
        const { data: existe } = await supabase
          .from('pessoas')
          .select('id')
          .eq('email', dados.email)
          .maybeSingle();
        
        if (existe) {
          throw new Error('Email já cadastrado');
        }
      }

      const { data, error } = await supabase
        .from('pessoas')
        .insert([dados as any]) // Cast para evitar conflito de tipos com enum do banco
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
        .update(updates as any) // Cast para evitar erro de tipo
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
