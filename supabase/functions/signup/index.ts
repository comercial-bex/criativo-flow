import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ========================================
// VALIDATION UTILITIES
// ========================================
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
const validEspecialidades = ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'trafego', 'gestor', 'rh'] as const;
const validRoles = ['admin', 'cliente', 'especialista'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  password: string;
  metadata: {
    nome: string;
    telefone?: string;
    especialidade?: string;
    cliente_id?: string;
    empresa?: string;
  };
  role?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Signup Edge Function: Iniciando...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('🔐 Signup: Variáveis de ambiente não configuradas');
      return new Response(
        JSON.stringify({ 
          error: 'SERVER_CONFIG_ERROR',
          message: 'Configuração do servidor incompleta' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body: SignupRequest = await req.json();
    const { email, password, metadata, role = 'cliente' } = body;

    // ========================================
    // COMPREHENSIVE INPUT VALIDATION
    // ========================================
    const validationErrors: string[] = [];

    // Email validation
    if (!email) {
      validationErrors.push('Email é obrigatório');
    } else if (email.length > 255) {
      validationErrors.push('Email deve ter no máximo 255 caracteres');
    } else if (!emailRegex.test(email)) {
      validationErrors.push('Email inválido. Use formato: exemplo@dominio.com');
    }

    // Password validation
    if (!password) {
      validationErrors.push('Senha é obrigatória');
    } else if (password.length < 8) {
      validationErrors.push('Senha deve ter no mínimo 8 caracteres');
    } else if (password.length > 72) {
      validationErrors.push('Senha deve ter no máximo 72 caracteres');
    } else {
      if (!/[A-Z]/.test(password)) {
        validationErrors.push('Senha deve conter pelo menos uma letra maiúscula');
      }
      if (!/[a-z]/.test(password)) {
        validationErrors.push('Senha deve conter pelo menos uma letra minúscula');
      }
      if (!/[0-9]/.test(password)) {
        validationErrors.push('Senha deve conter pelo menos um número');
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        validationErrors.push('Senha deve conter pelo menos um caractere especial');
      }
    }

    // Nome validation
    if (!metadata?.nome) {
      validationErrors.push('Nome é obrigatório');
    } else {
      const trimmedNome = metadata.nome.trim();
      if (trimmedNome.length < 2) {
        validationErrors.push('Nome deve ter no mínimo 2 caracteres');
      }
      if (trimmedNome.length > 100) {
        validationErrors.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    // Telefone validation (optional)
    if (metadata?.telefone && !phoneRegex.test(metadata.telefone)) {
      validationErrors.push('Telefone inválido. Use formato: (11) 98765-4321');
    }

    // Especialidade validation (optional)
    if (metadata?.especialidade && !validEspecialidades.includes(metadata.especialidade as any)) {
      validationErrors.push(`Especialidade inválida. Valores permitidos: ${validEspecialidades.join(', ')}`);
    }

    // Role validation
    if (role && !validRoles.includes(role as any)) {
      validationErrors.push(`Role inválida. Valores permitidos: ${validRoles.join(', ')}`);
    }

    // Cliente_id validation (optional UUID)
    if (metadata?.cliente_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(metadata.cliente_id)) {
        validationErrors.push('cliente_id deve ser um UUID válido');
      }
    }

    // Empresa validation (optional length limit)
    if (metadata?.empresa && metadata.empresa.length > 200) {
      validationErrors.push('Nome da empresa deve ter no máximo 200 caracteres');
    }

    // VALIDAÇÃO CRÍTICA: Não permitir cliente_id e especialidade simultaneamente
    if (metadata?.cliente_id && metadata?.especialidade) {
      validationErrors.push('Usuário não pode ser cliente e especialista simultaneamente');
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.error('🔐 Signup: Validação falhou:', validationErrors);
      return new Response(
        JSON.stringify({ 
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos fornecidos',
          errors: validationErrors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Signup: Criando usuário:', { email, nome: metadata.nome, role });

    // FASE 1: Criar usuário no Auth (SEM email_confirm para especialistas)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: metadata.especialidade ? false : true, // Especialistas precisam verificar email
      user_metadata: {
        nome: metadata.nome,
        telefone: metadata.telefone,
        especialidade: metadata.especialidade,
        cliente_id: metadata.cliente_id,
        empresa: metadata.empresa
      }
    });

    if (userError) {
      console.error('🔐 Signup: Erro ao criar usuário:', userError);
      
      // Verificar se email já existe
      if (userError.message?.includes('already registered') || userError.message?.includes('already exists')) {
        return new Response(
          JSON.stringify({ 
            error: 'EMAIL_EXISTS',
            message: 'Este email já está cadastrado no sistema' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'AUTH_ERROR',
          message: userError.message || 'Erro ao criar conta de autenticação' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      throw new Error('Usuário não retornado após criação');
    }

    const userId = userData.user.id;
    console.log('✅ Signup: Usuário criado:', userId);

    try {
      // FASE 2: Criar registro em pessoas
      // IMPORTANTE: cliente_id e especialidade são campos independentes
      // - CLIENTE: cliente_id preenchido, pode ter papeis=['cliente']
      // - ESPECIALISTA: especialidade preenchida, papeis=['especialista', 'designer', etc]
      
      const papeis = metadata.especialidade 
        ? ['especialista', metadata.especialidade] 
        : metadata.cliente_id 
        ? ['cliente'] 
        : ['cliente'];

      const { error: profileError } = await supabaseAdmin
        .from('pessoas')
        .insert({
          profile_id: userId,
          nome: metadata.nome,
          email: email,
          telefones: metadata.telefone ? [metadata.telefone] : [],
          cliente_id: metadata.cliente_id || null,
          papeis: papeis,
          status: role === 'admin' ? 'aprovado' : 'pendente_aprovacao'
        });

      if (profileError) {
        console.error('🔐 Signup: Erro ao criar perfil:', profileError);
        
        // ROLLBACK: Deletar registro pessoas e usuário
        await supabaseAdmin.from('pessoas').delete().eq('profile_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('🔄 Signup: Rollback - Pessoas e usuário deletados');

        return new Response(
          JSON.stringify({ 
            error: 'PROFILE_ERROR',
            message: 'Erro ao criar perfil. Por favor, tente novamente.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Signup: Perfil criado');

      // FASE 3: Criar role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (roleError) {
        console.error('🔐 Signup: Erro ao criar role:', roleError);
        
        // ROLLBACK: Deletar registro de pessoas e usuário
        await supabaseAdmin.from('pessoas').delete().eq('profile_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('🔄 Signup: Rollback - Registro pessoas e usuário deletados');

        return new Response(
          JSON.stringify({ 
            error: 'ROLE_ERROR',
            message: 'Erro ao atribuir permissões. Por favor, tente novamente.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Signup: Role criada');

      // FASE 4 (Opcional): Criar vínculo cliente_usuarios se cliente_id existir
      if (metadata.cliente_id) {
        const { error: clientUserError } = await supabaseAdmin
          .from('cliente_usuarios')
          .insert({
            cliente_id: metadata.cliente_id,
            user_id: userId,
            role_cliente: 'proprietario',
            permissoes: {
              financeiro: { ver: true, editar: true },
              marketing: { ver: true, aprovar: true },
              projetos: { ver: true, criar: true, editar: true },
              relatorios: { ver: true }
            },
            is_active: true
          });

        if (clientUserError) {
          console.warn('⚠️ Signup: Erro ao vincular cliente (não crítico):', clientUserError);
          // Não faz rollback aqui, apenas loga o warning
        } else {
          console.log('✅ Signup: Vínculo cliente criado');
        }
      }

      // FASE 5: Gerar token de verificação de email para especialistas
      if (metadata.especialidade) {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        const { error: tokenError } = await supabaseAdmin
          .from('email_verification_tokens')
          .insert({
            user_id: userId,
            token: token,
            expires_at: expiresAt.toISOString()
          });

        if (tokenError) {
          console.error('⚠️ Signup: Erro ao criar token de verificação:', tokenError);
        } else {
          console.log('✅ Signup: Token de verificação criado');
          // TODO: Enviar email com link de verificação
          // Link: ${supabaseUrl}/auth/verify-email?token=${token}
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          user: {
            id: userId,
            email: email,
            nome: metadata.nome
          },
          requires_email_verification: !!metadata.especialidade,
          message: metadata.especialidade 
            ? 'Conta criada! Verifique seu email para confirmar o cadastro.' 
            : 'Conta criada com sucesso!' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('🔐 Signup: Erro crítico:', error);
      
      // ROLLBACK completo
      try {
        await supabaseAdmin.from('pessoas').delete().eq('profile_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('🔄 Signup: Rollback completo executado');
      } catch (rollbackError) {
        console.error('🔐 Signup: Erro no rollback:', rollbackError);
      }

      return new Response(
        JSON.stringify({ 
          error: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao criar conta' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('🔐 Signup: Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
