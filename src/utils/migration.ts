import { Colaborador } from '@/hooks/useColaboradores';
import { Pessoa } from '@/hooks/usePessoas';

/**
 * ✅ ATUALIZADO PARA NOVA ESTRUTURA UNIFICADA
 * Converte Colaborador (legado) para Pessoa (novo modelo)
 * @deprecated Use apenas durante período de transição
 */
export function migrateColaboradorToPessoa(colaborador: Colaborador): Partial<Pessoa> {
  return {
    id: colaborador.id,
    nome: colaborador.nome_completo,
    email: colaborador.email || null,
    cpf: colaborador.cpf_cnpj,
    telefones: [colaborador.celular].filter(Boolean) as string[],
    papeis: ['colaborador'],
    cargo_id: undefined,
    cargo_atual: colaborador.cargo_atual,
    regime: colaborador.regime as any,
    status: colaborador.status as any,
    salario_base: colaborador.salario_base || null,
    fee_mensal: colaborador.fee_mensal || null,
    data_admissao: colaborador.data_admissao,
    data_desligamento: colaborador.data_desligamento || null,
    dados_bancarios: {
      banco_codigo: colaborador.banco_codigo,
      agencia: colaborador.agencia,
      conta: colaborador.conta,
      tipo_conta: colaborador.tipo_conta as any,
      pix_tipo: colaborador.tipo_chave_pix as any,
      pix_chave: colaborador.chave_pix,
    },
    observacoes: null,
    created_at: colaborador.created_at,
    updated_at: colaborador.updated_at,
  };
}

/**
 * ✅ ATUALIZADO PARA NOVA ESTRUTURA UNIFICADA
 * Converte Pessoa para Colaborador (para componentes legados)
 * @deprecated Use apenas durante período de transição
 */
export function migratePessoaToColaborador(pessoa: Pessoa): Partial<Colaborador> {
  return {
    id: pessoa.id,
    nome_completo: pessoa.nome,
    cpf_cnpj: pessoa.cpf || '',
    email: pessoa.email || undefined,
    celular: pessoa.telefones?.[0] || null,
    cargo_atual: pessoa.cargo_atual || undefined,
    regime: pessoa.regime as any,
    status: pessoa.status as any,
    salario_base: pessoa.salario_base || undefined,
    fee_mensal: pessoa.fee_mensal || undefined,
    data_admissao: pessoa.data_admissao || '',
    data_desligamento: pessoa.data_desligamento || undefined,
    banco_codigo: pessoa.dados_bancarios?.banco_codigo || undefined,
    agencia: pessoa.dados_bancarios?.agencia || undefined,
    conta: pessoa.dados_bancarios?.conta || undefined,
    tipo_conta: (pessoa.dados_bancarios?.tipo_conta || null) as any,
    tipo_chave_pix: (pessoa.dados_bancarios?.pix_tipo || null) as any,
    chave_pix: pessoa.dados_bancarios?.pix_chave || undefined,
    created_at: pessoa.created_at,
    updated_at: pessoa.updated_at,
  };
}
