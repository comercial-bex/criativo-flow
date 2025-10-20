import { z } from 'zod';

export const pessoaFormSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  cpf: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cpfLimpo = val.replace(/\D/g, '');
      return cpfLimpo.length === 11;
    }, 'CPF deve ter 11 dígitos'),
  
  telefones: z.array(z.string()).optional(),
  
  regime: z.enum(['clt', 'pj', 'estagio', 'freelancer']).optional(),
  
  especialidade_id: z.string({
    required_error: 'Especialidade é obrigatória',
    invalid_type_error: 'Selecione uma especialidade válida'
  }).min(1, 'Especialidade é obrigatória'),
  
  cargo_atual: z.string().optional(),
  
  data_admissao: z.string().optional(),
  
  salario_base: z.number().positive('Salário deve ser positivo').optional(),
  
  fee_mensal: z.number().positive('Fee deve ser positivo').optional(),
  
  dados_bancarios: z.object({
    pix_chave: z.string().optional(),
    banco: z.string().optional(),
    agencia: z.string().optional(),
    conta: z.string().optional()
  }).optional()
});

export type PessoaFormData = z.infer<typeof pessoaFormSchema>;

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

export function formatarCPF(value: string): string {
  const cpfLimpo = value.replace(/\D/g, '');
  
  let cpfFormatado = cpfLimpo;
  if (cpfLimpo.length >= 3) {
    cpfFormatado = cpfLimpo.substring(0, 3) + '.';
    if (cpfLimpo.length >= 6) {
      cpfFormatado += cpfLimpo.substring(3, 6) + '.';
      if (cpfLimpo.length >= 9) {
        cpfFormatado += cpfLimpo.substring(6, 9) + '-';
        cpfFormatado += cpfLimpo.substring(9, 11);
      } else {
        cpfFormatado += cpfLimpo.substring(6);
      }
    } else {
      cpfFormatado += cpfLimpo.substring(3);
    }
  }

  return cpfFormatado;
}
