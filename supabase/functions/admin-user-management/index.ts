import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminUserRequest {
  action: 'list' | 'reset-password' | 'force-logout' | 'update-status' | 'delete-user' | 'update-user-complete';
  user_id?: string;
  email?: string;
  new_password?: string;
  status?: string;
  filters?: {
    role?: string;
    status?: string;
    search?: string;
  };
  updates?: {
    role?: string;
    cliente_id?: string | null;
    status?: string;
    papeis?: string[];
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
      
      case 'update-user-complete':
        return await handleUpdateUserComplete(supabase, body.user_id!, body.updates!);
      
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
  console.log('📋 Buscando lista de usuários com filtros:', filters);
  
  try {
    // 1. Buscar perfis com join de clientes (FK está em pessoas, mas profiles é view)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        nome,
        email,
        status,
        created_at,
        cliente_id,
        clientes!pessoas_cliente_id_fkey(nome)
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      throw profilesError;
    }

    console.log(`✅ Buscados ${profiles?.length || 0} perfis`);

    // 2. Buscar roles de todos os usuários
    const profileIds = profiles?.map(p => p.id) || [];
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', profileIds);

    if (rolesError) {
      console.error('⚠️ Erro ao buscar roles (continuando sem roles):', rolesError);
    }

    console.log(`✅ Buscadas ${userRoles?.length || 0} roles`);

    // 3. Criar mapa de roles
    const roleMap = new Map();
    userRoles?.forEach(ur => {
      roleMap.set(ur.user_id, ur.role);
    });

    // 4. Combinar dados
    let users = profiles?.map(profile => ({
      ...profile,
      user_roles: roleMap.has(profile.id) 
        ? [{ role: roleMap.get(profile.id) }] 
        : []
    })) || [];

    console.log(`✅ Montados ${users.length} usuários completos`);

    // 5. Aplicar filtros em memória
    if (filters?.role && filters.role !== 'all') {
      users = users.filter(u => u.user_roles?.[0]?.role === filters.role);
      console.log(`🔍 Filtrado por role '${filters.role}': ${users.length} usuários`);
    }

    if (filters?.status && filters.status !== 'all') {
      users = users.filter(u => u.status === filters.status);
      console.log(`🔍 Filtrado por status '${filters.status}': ${users.length} usuários`);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(u => 
        u.nome?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.clientes?.nome?.toLowerCase().includes(searchLower)
      );
      console.log(`🔍 Filtrado por busca '${filters.search}': ${users.length} usuários`);
    }

    console.log(`✅ Retornando ${users.length} usuários após filtros`);

    return new Response(JSON.stringify({ success: true, users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', error);
    throw error;
  }
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

async function handleUpdateUserComplete(
  supabase: any, 
  userId: string, 
  updates: {
    role?: string;
    cliente_id?: string | null;
    status?: string;
    papeis?: string[];
  }
) {
  console.log(`📝 Atualizando usuário ${userId}:`, updates);
  
  try {
    let roleSkipped = false;
    
    // 1. Atualizar user_roles se role foi fornecida (com tolerância ao FK quebrado)
    if (updates.role) {
      try {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: updates.role 
          });
        
        if (roleError) {
          throw roleError;
        }
        console.log(`✅ Role atualizada em user_roles: ${updates.role}`);
      } catch (e: any) {
        // Se erro é FK para profiles_deprecated, continuar sem travar
        if (e?.code === '23503' && String(e?.message || '').includes('profiles_deprecated')) {
          console.warn(`⚠️ FK antigo em user_roles (profiles_deprecated); gravando somente em pessoas.papeis`);
          roleSkipped = true;
        } else {
          console.error('❌ Erro ao atualizar role:', e);
          throw e;
        }
      }
    }
    
    // 2. Validar cliente_id se tipo é cliente
    if (updates.papeis?.includes('cliente') && !updates.cliente_id) {
      throw new Error('Cliente deve ter cliente_id definido');
    }
    
    // 3. Atualizar pessoas se há mudanças (usando id, não profile_id)
    const pessoaUpdates: any = {};
    if (updates.cliente_id !== undefined) pessoaUpdates.cliente_id = updates.cliente_id;
    if (updates.status) pessoaUpdates.status = updates.status;
    if (updates.papeis) pessoaUpdates.papeis = updates.papeis;
    
    if (Object.keys(pessoaUpdates).length > 0) {
      // Primeiro, verificar se o registro existe em pessoas
      const { data: pessoaExists, error: checkError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar pessoa:', checkError);
        throw checkError;
      }
      
      if (pessoaExists) {
        // Atualizar registro existente
        const { error: pessoaError } = await supabase
          .from('pessoas')
          .update(pessoaUpdates)
          .eq('id', userId);
        
        if (pessoaError) {
          console.error('❌ Erro ao atualizar pessoas:', pessoaError);
          throw pessoaError;
        }
        console.log(`✅ Dados em pessoas atualizados:`, pessoaUpdates);
      } else {
        console.log(`⚠️ Registro não encontrado em pessoas para user ${userId}, pulando atualização`);
      }
    }
    
    // 4. Retornar sucesso (com flag se role foi pulada)
    if (roleSkipped) {
      console.log(`📊 Atualização completa com role_skipped=true para user ${userId}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário atualizado com sucesso',
        updates,
        role_skipped: roleSkipped
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: any) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro ao atualizar usuário'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

serve(handler);