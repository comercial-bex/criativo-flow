import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { validateCreateUser, formatValidationErrors } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const requestData = await req.json();
    
    // ✅ FASE 1 FIX 1.3: Validação robusta de input
    const validation = validateCreateUser(requestData);
    if (!validation.success) {
      console.log('❌ Validação falhou:', validation.errors);
      return new Response(
        JSON.stringify(formatValidationErrors(validation.errors!)),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const { email, password, nome, telefone, especialidade, role } = validation.data!;

    console.log('📝 Iniciando criação de usuário:', { email, nome, especialidade, role });

    // Tentar criar usuário com try-catch granular
    console.log('🔄 Tentando criar usuário no Supabase Auth...');

    let userData;
    let userError;

    try {
      const response = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          telefone,
          especialidade
        }
      });
      
      userData = response.data;
      userError = response.error;
      
      console.log('📊 Response do createUser:', { 
        hasData: !!userData?.user, 
        hasError: !!userError,
        userId: userData?.user?.id,
        errorCode: userError?.code,
        errorMessage: userError?.message 
      });
      
    } catch (createUserException) {
      console.error('💥 Exceção ao chamar createUser:', createUserException);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'auth_exception',
          error: createUserException instanceof Error ? createUserException.message : 'Erro inesperado ao criar usuário',
          details: createUserException instanceof Error ? createUserException.stack : String(createUserException)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }

    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError);
      
      // Verificar se é email duplicado
      const errorMsg = userError.message?.toLowerCase() || '';
      if (errorMsg.includes('already registered') || errorMsg.includes('email') || userError.status === 422) {
        return new Response(
          JSON.stringify({ 
            success: false,
            code: 'email_exists',
            error: 'Email já cadastrado no sistema' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 200 
          }
        );
      }
      
      // Outro erro de autenticação
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'auth_error',
          error: `Falha ao criar usuário: ${userError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }

    console.log('✅ Usuário criado:', userData.user?.id);

    if (userData.user) {
      const userId = userData.user.id;

      try {
        // Determine status based on role
        const status = role === 'admin' ? 'aprovado' : 'pendente_aprovacao';
        
        // Determinar papeis baseado em especialidade ou role
        const papeis = especialidade 
          ? ['especialista', especialidade]
          : role === 'cliente' 
          ? ['cliente']
          : ['especialista'];
        
        // Create entry in pessoas table
        const { error: profileError } = await supabaseAdmin
          .from('pessoas')
          .insert({
            profile_id: userId,
            nome: nome,
            email: email,
            telefones: telefone ? [telefone] : [],
            papeis: papeis,
            status: status
          });

        if (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError);
          
          // ROLLBACK: Delete user from Auth
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log('🔄 Rollback: Usuário deletado do Auth');
          
          return new Response(
            JSON.stringify({ 
              success: false,
              code: 'db_error',
              error: 'Falha ao salvar dados do usuário' 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 200 
            }
          );
        }

        console.log('✅ Perfil criado com sucesso');

        // Insert user role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });

        if (roleError) {
          console.error('❌ Erro ao inserir role:', roleError);
          
          // ROLLBACK: Delete pessoas entry and user
          await supabaseAdmin.from('pessoas').delete().eq('profile_id', userId);
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log('🔄 Rollback: Registro pessoas e usuário deletados');
          
          return new Response(
            JSON.stringify({ 
              success: false,
              code: 'db_error',
              error: 'Falha ao salvar dados do usuário' 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 200 
            }
          );
        }

        console.log('✅ Role inserida com sucesso');
      } catch (error) {
        // Ensure rollback happened
        console.error('❌ Erro crítico, rollback executado');
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: userData.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro geral não tratado:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        code: 'internal_error',
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});