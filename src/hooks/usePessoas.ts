import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import { cleanCPF } from '@/lib/cpf-utils';

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
        .select('*')
        .order('nome', { ascending: true });
      
      if (papel) {
        query = query.contains('papeis', [papel]);
      }
      
      const { data, error } = await query;
      
      console.log('🔍 Query pessoas - Resultado:', {
        total: data?.length || 0,
        papel: papel || 'todos',
        primeiros3: data?.slice(0, 3).map(p => ({ nome: p.nome, papeis: p.papeis }))
      });
      
      if (error) {
        console.error('❌ Erro ao buscar pessoas:', error);
        throw error;
      }
      
      // Processar dados retornados
      return (data || []).map((p: any) => ({
        ...p,
        tem_acesso_sistema: !!p.profile_id
      })) as Pessoa[];
    },
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>) => {
      // FASE 2: Validação de papéis removida - agora são inferidos automaticamente
      
      // FASE 1: Normalizar CPF antes de validar e salvar
      const cpfNormalizado = dados.cpf ? cleanCPF(dados.cpf) : null;
      
      // Validar CPF duplicado
      if (cpfNormalizado) {
        const { data: existe } = await supabase
          .from('pessoas')
          .select('id')
          .eq('cpf', cpfNormalizado)
          .maybeSingle();
        
        if (existe) {
          throw new Error('CPF já cadastrado');
        }
      }

      // Email pode ser duplicado - não validamos

      // Salvar com CPF normalizado
      const dadosNormalizados = {
        ...dados,
        cpf: cpfNormalizado
      };

      const { data, error } = await supabase
        .from('pessoas')
        .insert([dadosNormalizados as any])
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
      // FASE 1: Normalizar CPF se estiver sendo atualizado
      const updatesNormalizados = {
        ...updates,
        cpf: updates.cpf ? cleanCPF(updates.cpf) : updates.cpf
      };

      // Email pode ser duplicado - não validamos

      // ✅ REMOVER campos computados que não existem na tabela
      const { tem_acesso_sistema, role, ...dadosParaUpdate } = updatesNormalizados;

      const { data, error } = await supabase
        .from('pessoas')
        .update(dadosParaUpdate as any)
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
