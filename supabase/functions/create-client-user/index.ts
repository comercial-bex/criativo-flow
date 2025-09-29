import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    const { email, password, nome, cliente_id, role }: CreateClientUserRequest = requestBody;

    // Validate required fields
    if (!email || !password || !nome || !cliente_id || !role) {
      console.error('🔧 Edge Function: Campos obrigatórios ausentes');
      return new Response(
        JSON.stringify({ 
          error: 'Todos os campos são obrigatórios',
          missing: {
            email: !email,
            password: !password,
            nome: !nome,
            cliente_id: !cliente_id,
            role: !role
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Criando usuário cliente:', { email, nome, cliente_id, role });

    // Create user with Supabase Auth Admin (without email confirmation)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for client accounts
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
      // Create profile entry with pendente_aprovacao status
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userData.user.id,
          nome: nome,
          email: email,
          cliente_id: cliente_id,
          status: 'pendente_aprovacao' // Clientes sempre ficam pendentes para aprovação
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil criado com sucesso');

      // Insert user role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: role
        });

      if (roleError) {
        console.error('❌ Erro ao inserir role:', roleError);
        throw roleError;
      }

      console.log('✅ Role inserido com sucesso');
    }

    console.log('✅ Cliente criado com sucesso');

    return new Response(
      JSON.stringify({ 
        user: userData.user,
        email: email,
        password: password,
        success: true,
        message: 'Cliente criado com sucesso! Aguardando aprovação do administrador.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

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