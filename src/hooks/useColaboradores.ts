import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Colaborador {
  id: string;
  nome_completo: string;
  cpf_cnpj: string;
  rg?: string;
  data_nascimento?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  
  // Profissional
  cargo_id?: string;
  cargo_atual?: string;
  regime: 'clt' | 'estagio' | 'pj';
  data_admissao: string;
  data_desligamento?: string;
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado' | 'desligado';
  
  // Remuneração
  salario_base?: number;
  fee_mensal?: number;
  
  // Organização
  centro_custo?: string;
  unidade_filial?: string;
  gestor_imediato_id?: string;
  
  // Bancários
  banco_codigo?: string;
  banco_nome?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'corrente' | 'poupanca' | 'pme' | 'salario';
  titular_conta?: string;
  cpf_cnpj_titular?: string;
  tipo_chave_pix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  chave_pix?: string;
  
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useColaboradores() {
  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rh_colaboradores')
        .select('*')
        .order('nome_completo');
      
      if (error) throw error;
      return data as Colaborador[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (novoColaborador: Partial<Colaborador>) => {
      const { data, error } = await supabase
        .from('rh_colaboradores')
        .insert([novoColaborador] as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('✅ Colaborador cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao cadastrar colaborador', {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await supabase
        .from('rh_colaboradores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('✅ Colaborador atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao atualizar colaborador', {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rh_colaboradores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('✅ Colaborador removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao remover colaborador', {
        description: error.message,
      });
    },
  });

  return {
    colaboradores,
    isLoading,
    criar: createMutation.mutate,
    atualizar: updateMutation.mutate,
    deletar: deleteMutation.mutate,
    isCriando: createMutation.isPending,
    isAtualizando: updateMutation.isPending,
    isDeletando: deleteMutation.isPending,
  };
}
