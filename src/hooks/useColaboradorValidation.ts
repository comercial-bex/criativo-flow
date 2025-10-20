import { Pessoa } from './usePessoas';

export interface CamposFaltantes {
  essenciais: string[];
  importantes: string[];
  bancarios: string[];
}

export interface StatusValidacao {
  nivel: 'completo' | 'incompleto_parcial' | 'incompleto_critico';
  faltantes: CamposFaltantes;
  totalFaltantes: number;
}

export function validarColaborador(pessoa: Pessoa): StatusValidacao {
  const faltantes: CamposFaltantes = {
    essenciais: [],
    importantes: [],
    bancarios: []
  };

  // Campos essenciais (bloqueiam folha de pagamento)
  if (!pessoa.nome) faltantes.essenciais.push('Nome completo');
  if (!pessoa.cpf) faltantes.essenciais.push('CPF');
  if (!pessoa.regime) faltantes.essenciais.push('Regime de contratação');
  if (!pessoa.data_admissao) faltantes.essenciais.push('Data de admissão');
  
  if (pessoa.regime === 'clt' && !pessoa.salario_base) {
    faltantes.essenciais.push('Salário base');
  }
  if (pessoa.regime === 'pj' && !pessoa.fee_mensal) {
    faltantes.essenciais.push('Fee mensal');
  }
  
  // Campos importantes (não bloqueiam, mas são necessários)
  if (!pessoa.email) faltantes.importantes.push('Email');
  if (!pessoa.telefones?.[0]) faltantes.importantes.push('Telefone');
  if (!pessoa.cargo_atual) faltantes.importantes.push('Cargo');
  
  // Dados bancários (necessários para pagamento)
  if (!pessoa.dados_bancarios?.conta && !pessoa.dados_bancarios?.pix_chave) {
    faltantes.bancarios.push('Dados bancários (conta ou PIX)');
  }

  const totalFaltantes = 
    faltantes.essenciais.length + 
    faltantes.importantes.length + 
    faltantes.bancarios.length;

  let nivel: 'completo' | 'incompleto_parcial' | 'incompleto_critico';
  
  if (totalFaltantes === 0) {
    nivel = 'completo';
  } else if (faltantes.essenciais.length > 0) {
    nivel = 'incompleto_critico';
  } else {
    nivel = 'incompleto_parcial';
  }

  return {
    nivel,
    faltantes,
    totalFaltantes
  };
}
