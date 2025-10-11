import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { email, password, nome, telefone, especialidade, role } = await req.json();

    console.log('📝 Iniciando criação de usuário:', { email, nome, especialidade, role });

    // Validar email duplicado antes de criar
    console.log('🔍 Verificando email duplicado...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      throw new Error('Erro ao validar email: ' + listError.message);
    }

    const emailExists = existingUsers?.users?.some(u => u.email === email);
    
    if (emailExists) {
      console.log('⚠️ Email já existe:', email);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email já cadastrado no sistema' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 409 
        }
      );
    }

    console.log('✅ Email disponível, prosseguindo...');

    // Create user with Supabase Auth Admin (without email confirmation)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for internal accounts
      user_metadata: {
        nome,
        telefone,
        especialidade
      }
    });

    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError);
      throw userError;
    }

    console.log('✅ Usuário criado:', userData.user?.id);

    if (userData.user) {
      const userId = userData.user.id;

      try {
        // Determine status based on role
        const status = role === 'admin' ? 'aprovado' : 'pendente_aprovacao';
        
        // Create profile entry
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            nome: nome,
            email: email,
            telefone: telefone,
            especialidade: especialidade,
            status: status
          });

        if (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError);
          
          // ROLLBACK: Delete user from Auth
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log('🔄 Rollback: Usuário deletado do Auth');
          
          throw profileError;
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
          
          // ROLLBACK: Delete profile and user
          await supabaseAdmin.from('profiles').delete().eq('id', userId);
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log('🔄 Rollback: Perfil e usuário deletados');
          
          throw roleError;
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
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});