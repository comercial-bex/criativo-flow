import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { validateCreateUser, formatValidationErrors } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateClientUserRequest {
  email: string;
  password: string;
  nome: string;
  cliente_id: string;
  role: string;
  role_cliente?: string;
}

// Helper functions
async function createProfile(supabaseAdmin: any, userId: string, nome: string, email: string, cliente_id: string) {
  // Criar registro em pessoas (tabela correta)
  const { error } = await supabaseAdmin
    .from('pessoas')
    .insert({
      profile_id: userId,
      nome,
      email,
      cliente_id,
      status: 'aprovado',
      papeis: ['cliente']
    });
  
  if (error) throw error;
  console.log('✅ Perfil criado em pessoas');
}

async function createRole(supabaseAdmin: any, userId: string, role: string) {
  const { error } = await supabaseAdmin
    .from('user_roles')
    .insert({ user_id: userId, role });
  
  if (error) throw error;
  console.log('✅ Role criado');
}

async function upsertRole(supabaseAdmin: any, userId: string, role: string) {
  const { error } = await supabaseAdmin
    .from('user_roles')
    .upsert(
      { user_id: userId, role },
      { onConflict: 'user_id,role' }
    );
  
  if (error) throw error;
  console.log('✅ Role garantido');
}

async function createClienteUsuario(supabaseAdmin: any, userId: string, cliente_id: string, role: string, role_cliente?: string) {
  const permissoes = {
    financeiro: { ver: true, editar: true },
    marketing: { ver: true, aprovar: true },
    projetos: { ver: true, criar: true, editar: true },
    relatorios: { ver: true }
  };

  const { error } = await supabaseAdmin
    .from('cliente_usuarios')
    .insert({
      user_id: userId,
      cliente_id,
      role_cliente: role_cliente || (role === 'cliente' ? 'proprietario' : role),
      permissoes,
      ativo: true
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error;
  }
  console.log('✅ Cliente-usuário vinculado');
}

async function upsertClienteUsuario(supabaseAdmin: any, userId: string, cliente_id: string, role: string, role_cliente?: string) {
  const permissoes = {
    financeiro: { ver: true, editar: true },
    marketing: { ver: true, aprovar: true },
    projetos: { ver: true, criar: true, editar: true },
    relatorios: { ver: true }
  };

  const { error } = await supabaseAdmin
    .from('cliente_usuarios')
    .upsert({
      user_id: userId,
      cliente_id,
      role_cliente: role_cliente || (role === 'cliente' ? 'proprietario' : role),
      permissoes,
      ativo: true
    }, {
      onConflict: 'cliente_id,user_id'
    });

  if (error) throw error;
  console.log('✅ Cliente-usuário garantido');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Edge Function: create-client-user iniciada');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('🔧 Edge Function: Variáveis de ambiente não configuradas');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔧 Edge Function: Conectando ao Supabase...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🔧 Edge Function: Lendo dados da requisição...');
    const requestBody = await req.json();
    console.log('🔧 Edge Function: Dados recebidos:', { 
      ...requestBody, 
      password: '***OCULTA***' 
    });
    
    // ✅ FASE 1 FIX 1.3: Validação robusta de input
    const validation = validateCreateUser(requestBody);
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

    const { email, password, nome, cliente_id, role, role_cliente } = validation.data!;

    console.log('📝 Processando usuário cliente:', { email, nome, cliente_id, role, role_cliente });

    // PASSO 1: Verificar se usuário existe no Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u: any) => u.email === email);

    if (existingUser) {
      console.log('👤 Usuário já existe no Auth:', existingUser.id);
      
      // PASSO 2: Verificar se perfil existe em pessoas
      const { data: existingProfile } = await supabaseAdmin
        .from('pessoas')
        .select('*')
        .eq('profile_id', existingUser.id)
        .maybeSingle();
      
      if (!existingProfile) {
        console.log('🔄 RECUPERAÇÃO: Perfil ausente, criando...');
        
        try {
          // Criar perfil para usuário órfão
          await createProfile(supabaseAdmin, existingUser.id, nome, email, cliente_id);
          await createRole(supabaseAdmin, existingUser.id, role);
          await createClienteUsuario(supabaseAdmin, existingUser.id, cliente_id, role, role_cliente);
          
          // Atualizar senha se fornecida
          if (password) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
              password,
              email_confirm: true 
            });
          }
          
          console.log('✅ Usuário recuperado e configurado com sucesso');
          
          return new Response(
            JSON.stringify({ 
              user: existingUser,
              email: email,
              password: password,
              success: true,
              message: '✅ Usuário recuperado e configurado com sucesso!',
              recovery: true
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('❌ Erro na recuperação:', error);
          throw error;
        }
      } else {
        console.log('♻️ ATUALIZAÇÃO: Perfil existe, atualizando dados...');
        
        try {
          // Atualizar perfil existente em pessoas
          await supabaseAdmin
            .from('pessoas')
            .update({ 
              nome, 
              cliente_id,
              status: 'aprovado',
              updated_at: new Date().toISOString()
            })
            .eq('profile_id', existingUser.id);
          
          // Atualizar senha
          if (password) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
              password 
            });
          }
          
          // Garantir role e cliente_usuarios existem
          await upsertRole(supabaseAdmin, existingUser.id, role);
          await upsertClienteUsuario(supabaseAdmin, existingUser.id, cliente_id, role, role_cliente);
          
          console.log('✅ Usuário atualizado com sucesso');
          
          return new Response(
            JSON.stringify({ 
              user: existingUser,
              email: email,
              password: password,
              success: true,
              message: '♻️ Usuário atualizado com sucesso!',
              updated: true
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('❌ Erro na atualização:', error);
          throw error;
        }
      }
    } else {
      // PASSO 3: Criar novo usuário (fluxo original)
      console.log('➕ Criando novo usuário...');
      
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          cliente_id
        }
      });

      if (userError) {
        console.error('❌ Erro ao criar usuário:', userError);
        return new Response(
          JSON.stringify({ error: userError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Usuário criado:', userData.user?.id);

      if (userData.user) {
        const userId = userData.user.id;

        try {
          await createProfile(supabaseAdmin, userId, nome, email, cliente_id);
          await createRole(supabaseAdmin, userId, role);
          await createClienteUsuario(supabaseAdmin, userId, cliente_id, role, role_cliente);
          
          console.log('✅ Novo cliente criado com sucesso');
        } catch (error) {
          console.error('❌ Erro crítico, executando rollback');
          
          // ROLLBACK: Delete user from Auth
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log('🔄 Rollback: Usuário deletado do Auth');
          
          throw error;
        }
      }

      return new Response(
        JSON.stringify({ 
          user: userData.user,
          email: email,
          password: password,
          success: true,
          message: '✅ Cliente criado com sucesso!',
          created: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in create-client-user function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});