import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Criar usuário admin
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@sistema.com',
      password: 'Agencia@2026',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador',
        sobrenome: 'Sistema'
      }
    })

    if (userError) {
      // Se usuário já existe, buscar ID
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const adminUser = existingUser?.users.find(u => u.email === 'admin@sistema.com')
      
      if (adminUser) {
        // Atualizar senha do usuário existente
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          adminUser.id,
          { password: 'Agencia@2026' }
        )
        
        if (updateError) throw updateError
        
        console.log('✅ Senha do admin atualizada')
        
        // Usar ID do usuário existente
        userData = { user: adminUser }
      } else {
        throw userError
      }
    }

    const userId = userData?.user?.id
    if (!userId) {
      throw new Error('Failed to get user ID')
    }

    // Inserir na tabela pessoas
    const { error: pessoaError } = await supabaseAdmin
      .from('pessoas')
      .upsert({
        profile_id: userId,
        nome: 'Administrador',
        sobrenome: 'Sistema',
        email: 'admin@sistema.com',
        papeis: ['admin', 'gestor', 'colaborador'],
        ativo: true
      }, {
        onConflict: 'profile_id'
      })

    if (pessoaError) throw pessoaError

    // Adicionar role de admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id,role',
        ignoreDuplicates: true
      })

    if (roleError) throw roleError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário administrador criado com sucesso!',
        credentials: {
          email: 'admin@sistema.com',
          password: 'Agencia@2026'
        },
        warning: '⚠️ Altere a senha após o primeiro login!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
