import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Validação obrigatória
    if (!email || !password) {
      console.error('🔐 Signup: Credenciais ausentes');
      return new Response(
        JSON.stringify({ 
          error: 'MISSING_CREDENTIALS',
          message: 'Email e senha são obrigatórios' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!metadata?.nome) {
      console.error('🔐 Signup: Nome ausente');
      return new Response(
        JSON.stringify({ 
          error: 'MISSING_NAME',
          message: 'Nome é obrigatório' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VALIDAÇÃO CRÍTICA: Não permitir cliente_id e especialidade simultaneamente
    if (metadata.cliente_id && metadata.especialidade) {
      console.error('🔐 Signup: Conflito cliente_id + especialidade');
      return new Response(
        JSON.stringify({ 
          error: 'INVALID_METADATA',
          message: 'Usuário não pode ser cliente e especialista simultaneamente' 
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
      // FASE 2: Criar perfil
      // IMPORTANTE: especialidade e cliente_id são mutuamente exclusivos
      // - Se é CLIENTE: cliente_id preenchido, especialidade NULL
      // - Se é ESPECIALISTA: especialidade preenchida, cliente_id NULL
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          nome: metadata.nome,
          email: email,
          telefone: metadata.telefone,
          especialidade: metadata.especialidade || null,
          cliente_id: metadata.cliente_id || null,
          status: role === 'admin' ? 'aprovado' : 'pendente_aprovacao',
          role_requested: metadata.especialidade ? 'especialista' : null
        });

      if (profileError) {
        console.error('🔐 Signup: Erro ao criar perfil:', profileError);
        
        // ROLLBACK: Deletar usuário do Auth
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('🔄 Signup: Rollback - Usuário deletado do Auth');

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
        
        // ROLLBACK: Deletar perfil e usuário
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('🔄 Signup: Rollback - Perfil e usuário deletados');

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
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
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
