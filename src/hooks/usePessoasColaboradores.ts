import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PessoaColaborador {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
  telefones?: string[];
  
  // Endereço (via JSONB endereco)
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  
  // Profissional
  cargo_atual?: string;
  regime?: 'clt' | 'estagio' | 'pj';
  data_admissao?: string;
  data_desligamento?: string;
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado' | 'desligado';
  
  // Remuneração
  salario_base?: number;
  fee_mensal?: number;
  
  // Organização
  centro_custo?: string;
  unidade_filial?: string;
  gestor_imediato_id?: string;
  
  // Veículo
  veiculo_id?: string;
  veiculo?: {
    id: string;
    nome: string;
    placa?: string;
  };
  
  // Bancários (via JSONB dados_bancarios)
  dados_bancarios?: {
    banco_codigo?: string;
    banco_nome?: string;
    agencia?: string;
    conta?: string;
    tipo_conta?: 'corrente' | 'poupanca' | 'pme' | 'salario';
    titular_conta?: string;
    cpf_cnpj_titular?: string;
    tipo_chave_pix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
    chave_pix?: string;
  };
  
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook para gerenciar Colaboradores usando a tabela unificada `pessoas`
 * 
 * Substitui `useColaboradores` (DEPRECATED)
 * Filtra pessoas com papel 'colaborador'
 */
export function usePessoasColaboradores() {
  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ['pessoas-colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .contains('papeis', ['colaborador'])
        .order('nome');
      
      if (error) throw error;
      
      // Buscar veículos separadamente se necessário
      const colaboradoresComVeiculo = await Promise.all(
        (data || []).map(async (pessoa) => {
          let veiculoInfo = null;
          if (pessoa.veiculo_id) {
            const { data: veiculo } = await supabase
              .from('inventario_itens')
              .select(`
                id,
                identificacao_interna,
                modelo:inventario_modelos!modelo_id(nome)
              `)
              .eq('id', pessoa.veiculo_id)
              .single();
            
            if (veiculo) {
              veiculoInfo = {
                id: veiculo.id,
                nome: (veiculo.modelo as any)?.nome || veiculo.identificacao_interna || 'Sem nome',
                placa: veiculo.identificacao_interna
              };
            }
          }
          
          return {
            id: pessoa.id,
            nome: pessoa.nome,
            cpf: pessoa.cpf || '',
            email: pessoa.email,
            telefones: pessoa.telefones,
            endereco: {}, // Não existe na tabela pessoas ainda
            cargo_atual: pessoa.cargo_atual,
            regime: undefined, // Não existe campo tipo_vinculo
            data_admissao: pessoa.data_admissao,
            data_desligamento: pessoa.data_desligamento,
            status: pessoa.status as any,
            salario_base: pessoa.salario_base,
            fee_mensal: pessoa.fee_mensal,
            centro_custo: undefined, // Não existe na tabela pessoas
            unidade_filial: undefined, // Não existe na tabela pessoas
            gestor_imediato_id: undefined, // Não existe na tabela pessoas
            veiculo_id: pessoa.veiculo_id,
            veiculo: veiculoInfo,
            dados_bancarios: pessoa.dados_bancarios as any,
            observacoes: pessoa.observacoes,
            created_at: pessoa.created_at,
            updated_at: pessoa.updated_at,
          } as PessoaColaborador;
        })
      );
      
      return colaboradoresComVeiculo;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (novoColaborador: Partial<PessoaColaborador>) => {
      // Preparar dados para inserção
      const dadosParaInserir: any = {
        nome: novoColaborador.nome,
        cpf: novoColaborador.cpf,
        email: novoColaborador.email,
        telefones: novoColaborador.telefones || [],
        cargo_atual: novoColaborador.cargo_atual,
        data_admissao: novoColaborador.data_admissao,
        status: novoColaborador.status || 'ativo',
        salario_base: novoColaborador.salario_base,
        fee_mensal: novoColaborador.fee_mensal,
        dados_bancarios: novoColaborador.dados_bancarios || {},
        observacoes: novoColaborador.observacoes,
        papeis: ['colaborador'], // Sempre incluir papel colaborador
      };

      const { data, error } = await supabase
        .from('pessoas')
        .insert([dadosParaInserir])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas-colaboradores'] });
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      toast.success('✅ Colaborador cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao cadastrar colaborador', {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PessoaColaborador> & { id: string }) => {
      // Preparar dados para atualização (apenas campos que existem em pessoas)
      const dadosParaAtualizar: any = {};
      
      if (updates.nome) dadosParaAtualizar.nome = updates.nome;
      if (updates.cpf) dadosParaAtualizar.cpf = updates.cpf;
      if (updates.email !== undefined) dadosParaAtualizar.email = updates.email;
      if (updates.telefones) dadosParaAtualizar.telefones = updates.telefones;
      if (updates.cargo_atual) dadosParaAtualizar.cargo_atual = updates.cargo_atual;
      if (updates.data_admissao) dadosParaAtualizar.data_admissao = updates.data_admissao;
      if (updates.data_desligamento !== undefined) dadosParaAtualizar.data_desligamento = updates.data_desligamento;
      if (updates.status) dadosParaAtualizar.status = updates.status;
      if (updates.salario_base !== undefined) dadosParaAtualizar.salario_base = updates.salario_base;
      if (updates.fee_mensal !== undefined) dadosParaAtualizar.fee_mensal = updates.fee_mensal;
      if (updates.dados_bancarios) dadosParaAtualizar.dados_bancarios = updates.dados_bancarios;
      if (updates.observacoes !== undefined) dadosParaAtualizar.observacoes = updates.observacoes;

      const { data, error } = await supabase
        .from('pessoas')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas-colaboradores'] });
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
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
      // Desativar ao invés de deletar
      const { error } = await supabase
        .from('pessoas')
        .update({ 
          status: 'desligado',
          data_desligamento: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas-colaboradores'] });
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      toast.success('✅ Colaborador desligado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao desligar colaborador', {
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
