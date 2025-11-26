import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
  permissoes?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, nome, cliente_id, role, permissoes }: CreateClientUserRequest = await req.json();

    console.log('Creating client user:', { email, nome, cliente_id, role });

    // Verificar se usuário já existe
    const { data: existingPessoa } = await supabaseAdmin
      .from('pessoas')
      .select('id, profile_id, email, status, papeis')
      .eq('email', email)
      .single();

    if (existingPessoa) {
      // Atualizar usuário existente - adicionar papel 'cliente' se não tiver
      const papeis = existingPessoa.papeis || [];
      if (!papeis.includes('cliente')) {
        papeis.push('cliente');
      }

      const { error: updateError } = await supabaseAdmin
        .from('pessoas')
        .update({
          nome,
          cliente_id,
          papeis,
          status: 'aprovado'
        })
        .eq('profile_id', existingPessoa.profile_id);

      if (updateError) throw updateError;

      // Atualizar role
      await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: existingPessoa.profile_id,
          role: role
        });

      // Atualizar permissões cliente
      if (permissoes) {
        await supabaseAdmin
          .from('cliente_usuarios')
          .upsert({
            user_id: existingPessoa.profile_id,
            cliente_id,
            role_cliente: 'gestor',
            permissoes: permissoes,
            ativo: true
          });
      }

      return new Response(JSON.stringify({
        success: true,
        user_id: existingPessoa.profile_id,
        email,
        message: 'Usuário existente atualizado com sucesso'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar novo usuário
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cliente_id
      }
    });

    if (authError) throw authError;

    if (!authUser.user) {
      throw new Error('Falha ao criar usuário');
    }

    // Criar registro em pessoas
    const { error: profileError } = await supabaseAdmin
      .from('pessoas')
      .insert({
        profile_id: authUser.user.id,
        email,
        nome,
        cliente_id,
        papeis: ['cliente'],
        status: 'aprovado'
      });

    if (profileError) throw profileError;

    // Inserir role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: role
      });

    if (roleError) throw roleError;

    // Inserir permissões cliente
    if (permissoes) {
      const { error: permError } = await supabaseAdmin
        .from('cliente_usuarios')
        .insert({
          user_id: authUser.user.id,
          cliente_id,
          role_cliente: 'gestor',
          permissoes: permissoes,
          ativo: true
        });

      if (permError) throw permError;
    }

    console.log('Client user created successfully:', authUser.user.id);

    return new Response(JSON.stringify({
      success: true,
      user_id: authUser.user.id,
      email,
      password,
      message: 'Usuário cliente criado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating client user:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erro ao criar usuário cliente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});