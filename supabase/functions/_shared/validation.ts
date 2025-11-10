// ========================================
// SHARED VALIDATION - FASE 1 FIX 1.3
// ========================================
// Validação de input centralizada para Edge Functions
// Usa Zod para validação de schemas com mensagens em português

// Validação básica de email (regex simples e efetiva)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação de telefone brasileiro (com ou sem DDI)
const telefoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;

// Enums de validação
const validRoles = [
  'admin',
  'gestor',
  'grs',
  'designer',
  'filmmaker',
  'atendimento',
  'financeiro',
  'trafego',
  'fornecedor',
  'cliente',
] as const;

const validEspecialidades = [
  'grs',
  'design',
  'audiovisual',
  'atendimento',
  'financeiro',
  'trafego',
] as const;

// ========================================
// INTERFACES DE VALIDAÇÃO
// ========================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  especialidade?: string;
  role: string;
  cliente_id?: string;
  role_cliente?: string;
}

export interface UpdateSpecialistInput {
  id: string;
  nome: string;
  telefone?: string;
  especialidade: string;
  role?: string;
}

// ========================================
// VALIDADORES INDIVIDUAIS
// ========================================

function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email é obrigatório', code: 'required' };
  }
  if (email.length > 255) {
    return {
      field: 'email',
      message: 'Email deve ter no máximo 255 caracteres',
      code: 'max_length',
    };
  }
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Email inválido',
      code: 'invalid_format',
    };
  }
  return null;
}

function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return {
      field: 'password',
      message: 'Senha é obrigatória',
      code: 'required',
    };
  }
  if (password.length < 8) {
    return {
      field: 'password',
      message: 'Senha deve ter no mínimo 8 caracteres',
      code: 'min_length',
    };
  }
  if (password.length > 72) {
    return {
      field: 'password',
      message: 'Senha deve ter no máximo 72 caracteres',
      code: 'max_length',
    };
  }
  // Validar pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return {
      field: 'password',
      message: 'Senha deve conter pelo menos uma letra maiúscula',
      code: 'missing_uppercase',
    };
  }
  // Validar pelo menos um número
  if (!/[0-9]/.test(password)) {
    return {
      field: 'password',
      message: 'Senha deve conter pelo menos um número',
      code: 'missing_number',
    };
  }
  return null;
}

function validateNome(nome: string): ValidationError | null {
  if (!nome) {
    return { field: 'nome', message: 'Nome é obrigatório', code: 'required' };
  }
  const trimmedNome = nome.trim();
  if (trimmedNome.length < 2) {
    return {
      field: 'nome',
      message: 'Nome deve ter no mínimo 2 caracteres',
      code: 'min_length',
    };
  }
  if (trimmedNome.length > 100) {
    return {
      field: 'nome',
      message: 'Nome deve ter no máximo 100 caracteres',
      code: 'max_length',
    };
  }
  return null;
}

function validateTelefone(telefone?: string): ValidationError | null {
  if (!telefone) return null; // Telefone é opcional
  if (!telefoneRegex.test(telefone)) {
    return {
      field: 'telefone',
      message: 'Telefone inválido. Use formato: (11) 98765-4321',
      code: 'invalid_format',
    };
  }
  return null;
}

function validateRole(role: string): ValidationError | null {
  if (!role) {
    return { field: 'role', message: 'Role é obrigatória', code: 'required' };
  }
  if (!validRoles.includes(role as any)) {
    return {
      field: 'role',
      message: `Role inválida. Valores permitidos: ${validRoles.join(', ')}`,
      code: 'invalid_value',
    };
  }
  return null;
}

function validateEspecialidade(
  especialidade?: string
): ValidationError | null {
  if (!especialidade) return null; // Especialidade é opcional
  if (!validEspecialidades.includes(especialidade as any)) {
    return {
      field: 'especialidade',
      message: `Especialidade inválida. Valores permitidos: ${validEspecialidades.join(', ')}`,
      code: 'invalid_value',
    };
  }
  return null;
}

function validateUUID(value: string, fieldName: string): ValidationError | null {
  if (!value) {
    return {
      field: fieldName,
      message: `${fieldName} é obrigatório`,
      code: 'required',
    };
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser um UUID válido`,
      code: 'invalid_format',
    };
  }
  return null;
}

const validClienteRoles = [
  'proprietario',
  'gerente_financeiro',
  'gestor_marketing',
  'social_media',
] as const;

function validateRoleCliente(
  role_cliente?: string
): ValidationError | null {
  if (!role_cliente) return null;
  if (!validClienteRoles.includes(role_cliente as any)) {
    return {
      field: 'role_cliente',
      message: `role_cliente inválida. Valores permitidos: ${validClienteRoles.join(', ')}`,
      code: 'invalid_value',
    };
  }
  return null;
}

// ========================================
// VALIDADORES DE SCHEMAS COMPLETOS
// ========================================

export function validateCreateUser(
  input: Partial<CreateUserInput>
): ValidationResult<CreateUserInput> {
  const errors: ValidationError[] = [];

  // Validar campos obrigatórios
  const emailError = validateEmail(input.email || '');
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(input.password || '');
  if (passwordError) errors.push(passwordError);

  const nomeError = validateNome(input.nome || '');
  if (nomeError) errors.push(nomeError);

  const roleError = validateRole(input.role || '');
  if (roleError) errors.push(roleError);

  // Validar campos opcionais
  const telefoneError = validateTelefone(input.telefone);
  if (telefoneError) errors.push(telefoneError);

  const especialidadeError = validateEspecialidade(input.especialidade);
  if (especialidadeError) errors.push(especialidadeError);

  const roleClienteError = validateRoleCliente(input.role_cliente);
  if (roleClienteError) errors.push(roleClienteError);

  // Se houver UUID de cliente, validar
  if (input.cliente_id) {
    const clienteIdError = validateUUID(input.cliente_id, 'cliente_id');
    if (clienteIdError) errors.push(clienteIdError);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as CreateUserInput,
  };
}

export function validateUpdateSpecialist(
  input: Partial<UpdateSpecialistInput>
): ValidationResult<UpdateSpecialistInput> {
  const errors: ValidationError[] = [];

  // Validar ID
  const idError = validateUUID(input.id || '', 'id');
  if (idError) errors.push(idError);

  // Validar campos obrigatórios
  const nomeError = validateNome(input.nome || '');
  if (nomeError) errors.push(nomeError);

  const especialidadeError = validateEspecialidade(input.especialidade);
  if (especialidadeError) {
    errors.push({
      field: 'especialidade',
      message: 'Especialidade é obrigatória',
      code: 'required',
    });
  }

  // Validar campos opcionais
  const telefoneError = validateTelefone(input.telefone);
  if (telefoneError) errors.push(telefoneError);

  if (input.role) {
    const roleError = validateRole(input.role);
    if (roleError) errors.push(roleError);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as UpdateSpecialistInput,
  };
}

// ========================================
// HELPER: FORMATADOR DE ERRO PARA RESPONSE
// ========================================

export function formatValidationErrors(errors: ValidationError[]) {
  return {
    success: false,
    code: 'validation_error',
    message: 'Dados inválidos fornecidos',
    errors: errors.reduce(
      (acc, err) => {
        acc[err.field] = err.message;
        return acc;
      },
      {} as Record<string, string>
    ),
    details: errors,
  };
}

// ========================================
// FILTER VALIDATION
// ========================================

const validStatuses = ['ativo', 'inativo', 'pendente', 'bloqueado'] as const;

export interface AdminFiltersInput {
  role?: string;
  status?: string;
  search?: string;
}

export function validateAdminFilters(
  filters?: Partial<AdminFiltersInput>
): ValidationResult<AdminFiltersInput> {
  if (!filters) {
    return { success: true, data: {} };
  }

  const errors: ValidationError[] = [];

  // Validate role if provided
  if (filters.role) {
    const roleError = validateRole(filters.role);
    if (roleError) errors.push(roleError);
  }

  // Validate status if provided
  if (filters.status && !validStatuses.includes(filters.status as any)) {
    errors.push({
      field: 'status',
      message: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      code: 'invalid_value',
    });
  }

  // Validate search length
  if (filters.search && filters.search.length > 200) {
    errors.push({
      field: 'search',
      message: 'Termo de busca deve ter no máximo 200 caracteres',
      code: 'max_length',
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: filters as AdminFiltersInput,
  };
}
