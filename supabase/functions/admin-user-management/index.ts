import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminUserRequest {
  action: 'list' | 'reset-password' | 'force-logout' | 'update-status' | 'delete-user';
  user_id?: string;
  email?: string;
  new_password?: string;
  status?: string;
  filters?: {
    role?: string;
    status?: string;
    search?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin permission
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body: AdminUserRequest = await req.json();

    switch (body.action) {
      case 'list':
        return await handleListUsers(supabase, body.filters);
      
      case 'reset-password':
        return await handleResetPassword(supabase, body.user_id!, body.new_password!);
      
      case 'force-logout':
        return await handleForceLogout(supabase, body.user_id!);
      
      case 'update-status':
        return await handleUpdateStatus(supabase, body.user_id!, body.status!);
      
      case 'delete-user':
        return await handleDeleteUser(supabase, body.user_id!);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error: any) {
    console.error('Error in admin-user-management function:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Erro desconhecido',
      details: error.details || null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function handleListUsers(supabase: any, filters?: any) {
  // Construir query com JOIN usando !inner (FK está configurada)
  // JOIN via profiles.id = user_roles.user_id
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles!user_roles_user_id_fkey(role),
      clientes(nome)
    `);

  // Aplicar filtros
  if (filters?.role) {
    query = query.eq('user_roles.role', filters.role);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  // Executar query com ordenação
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    throw error;
  }

  console.log(`✅ Buscados ${data?.length || 0} usuários com roles`);

  return new Response(JSON.stringify({ 
    success: true,
    users: data 
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleResetPassword(supabase: any, userId: string, newPassword: string) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ success: true, message: 'Password reset successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleForceLogout(supabase: any, userId: string) {
  // Remove all sessions for the user
  const { error } = await supabase.auth.admin.signOut(userId, 'global');

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ success: true, message: 'User logged out successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateStatus(supabase: any, userId: string, status: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ success: true, message: 'Status updated successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDeleteUser(supabase: any, userId: string) {
  console.log(`🗑️ Iniciando deleção de usuário: ${userId}`);
  
  try {
    // 1. Buscar dados do perfil antes de deletar (para log)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, nome, cliente_id')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else if (profile) {
      console.log(`✅ Perfil encontrado: ${profile.email} (${profile.nome})`);
    }
    
    // 2. Tentar deletar do Auth primeiro (cascade automático para profiles)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      // Se o erro for "user not found", fazer limpeza manual
      if (authDeleteError.message?.includes('not found') || 
          authDeleteError.message?.includes('Database error loading user')) {
        console.warn('⚠️ Usuário não encontrado no Auth, fazendo limpeza manual...');
        
        // Deletar manualmente de profiles (com nova policy RLS)
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (profileDeleteError) {
          console.error('❌ Erro ao deletar perfil:', profileDeleteError);
        }
        
        // Deletar manualmente de user_roles (com nova policy RLS)
        const { error: rolesDeleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        if (rolesDeleteError) {
          console.error('❌ Erro ao deletar roles:', rolesDeleteError);
        }
        
        console.log('🧹 Limpeza manual concluída');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Usuário removido (limpeza manual)',
            deleted_user: {
              email: profile?.email,
              nome: profile?.nome
            },
            cleanup_mode: true
          }), 
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.error('❌ Erro ao deletar do Auth:', authDeleteError);
      throw new Error(`Erro ao deletar: ${authDeleteError.message}`);
    }
    
    console.log(`🎉 Usuário ${profile?.email} deletado com sucesso`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário deletado com sucesso',
        deleted_user: {
          email: profile?.email,
          nome: profile?.nome
        }
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('💥 Erro crítico na deleção:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro desconhecido ao deletar usuário',
        details: error
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

serve(handler);