import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Dynamic CORS headers based on request origin
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    'https://lovable.app',
    'https://lovableproject.com',
    'http://localhost:8788',
  ];
  
  const isAllowed = origin && allowedOrigins.some(allowed => origin.includes(allowed));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  };
}

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
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
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
        return await handleListUsers(supabase, body.filters, origin);
      
      case 'reset-password':
        return await handleResetPassword(supabase, body.user_id!, body.new_password, origin);
      
      case 'force-logout':
        return await handleForceLogout(supabase, body.user_id!, origin);
      
      case 'update-status':
        return await handleUpdateStatus(supabase, body.user_id!, body.status!, origin);
      
      case 'delete-user':
        return await handleDeleteUser(supabase, body.user_id!, origin);
      
    case 'update-user-complete':
      return await handleUpdateUserComplete(supabase, body.user_id!, body.updates!, origin);
      
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

async function handleListUsers(supabase: any, filters?: any, origin?: string | null) {
  const corsHeaders = getCorsHeaders(origin);
  console.log('📋 Buscando lista de usuários com filtros:', filters);
  
  try {
    // 1. Buscar de PESSOAS (não profiles) para ter acesso ao status
    const { data: pessoas, error: pessoasError } = await supabase
      .from('pessoas')
      .select(`
        id,
        profile_id,
        nome,
        email,
        status,
        created_at,
        cliente_id,
        clientes:clientes!pessoas_cliente_id_fkey(nome)
      `)
      .order('created_at', { ascending: false });

    if (pessoasError) {
      console.error('❌ Erro ao buscar pessoas:', pessoasError);
      throw pessoasError;
    }

    console.log(`✅ Buscadas ${pessoas?.length || 0} pessoas`);

    // 2. Buscar roles usando profile_id (Auth ID)
    const profileIds = pessoas?.map(p => p.profile_id).filter(Boolean) || [];
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', profileIds);

    if (rolesError) {
      console.error('⚠️ Erro ao buscar roles (continuando sem roles):', rolesError);
    }

    console.log(`✅ Buscadas ${userRoles?.length || 0} roles`);

    // 3. Criar mapa de roles (chave = profile_id = Auth ID)
    const roleMap = new Map();
    userRoles?.forEach(ur => {
      roleMap.set(ur.user_id, ur.role);
    });

    // 4. Mapear para formato esperado pelo frontend (id = Auth ID)
    let users = pessoas?.map(p => ({
      id: p.profile_id || p.id,  // ✅ Auth ID (profile_id)
      nome: p.nome,
      email: p.email,
      status: p.status,
      created_at: p.created_at,
      cliente_id: p.cliente_id,
      clientes: p.clientes,
      user_roles: roleMap.has(p.profile_id) 
        ? [{ role: roleMap.get(p.profile_id) }] 
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

// Gerador de senha forte
function generateStrongPassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  // Garantir pelo menos 1 de cada tipo
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Preencher o resto
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function handleResetPassword(supabase: any, userId: string, newPassword?: string, origin?: string | null) {
  const corsHeaders = getCorsHeaders(origin);
  
  // Gerar senha forte se não fornecida
  const passwordToUse = newPassword || generateStrongPassword(16);
  
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: passwordToUse
  });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Password reset successfully',
    new_password: passwordToUse
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleForceLogout(supabase: any, userId: string, origin?: string | null) {
  const corsHeaders = getCorsHeaders(origin);
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

async function handleUpdateStatus(supabase: any, userId: string, status: string, origin?: string | null) {
  const corsHeaders = getCorsHeaders(origin);
  console.log(`📝 Atualizando status para user ${userId}: ${status}`);
  
  // userId = Auth ID (profile_id)
  const { error } = await supabase
    .from('pessoas')
    .update({ status })
    .eq('profile_id', userId);  // ✅ Localizar via profile_id

  if (error) {
    console.error('❌ Erro ao atualizar status:', error);
    throw error;
  }

  console.log('✅ Status atualizado com sucesso');

  return new Response(JSON.stringify({ success: true, message: 'Status updated successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDeleteUser(supabase: any, userId: string, origin?: string | null) {
  const corsHeaders = getCorsHeaders(origin);
  console.log(`🗑️ Iniciando deleção de usuário: ${userId}`);
  
  try {
    // 1. Buscar pessoa via profile_id (para log)
    const { data: pessoa } = await supabase
      .from('pessoas')
      .select('id, email, nome')
      .eq('profile_id', userId)  // ✅ Localizar via profile_id
      .maybeSingle();
    
    if (pessoa) {
      console.log(`✅ Pessoa encontrada: ${pessoa.email} (${pessoa.nome})`);
    }
    
    // 2. Deletar do Auth (cascade para user_roles)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      // Se usuário não existe no Auth, fazer limpeza manual
      if (authDeleteError.message?.includes('not found') || 
          authDeleteError.message?.includes('Database error')) {
        console.warn('⚠️ Usuário não encontrado no Auth, limpeza manual...');
        
        // Deletar pessoa
        if (pessoa) {
          await supabase
            .from('pessoas')
            .delete()
            .eq('id', pessoa.id);
        }
        
        // Deletar user_roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Usuário removido (limpeza manual)',
            deleted_user: {
              email: pessoa?.email,
              nome: pessoa?.nome
            }
          }), 
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Erro ao deletar: ${authDeleteError.message}`);
    }
    
    console.log(`🎉 Usuário ${pessoa?.email} deletado com sucesso`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário deletado com sucesso',
        deleted_user: {
          email: pessoa?.email,
          nome: pessoa?.nome
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
        error: error.message || 'Erro desconhecido'
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
  },
  origin?: string | null
) {
  const corsHeaders = getCorsHeaders(origin);
  console.log(`📝 Atualizando usuário ${userId}:`, updates);
  
  try {
    // 0. Buscar dados atuais do usuário (necessário para validação CPF)
    const { data: pessoaAtual, error: fetchError } = await supabase
      .from('pessoas')
      .select('cpf, papeis')
      .eq('profile_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Erro ao buscar pessoa atual:', fetchError);
    }
    
    console.log('📊 Pessoa atual:', pessoaAtual);
    
    // 1. Atualizar user_roles se role foi fornecida (userId = Auth ID)
    if (updates.role) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId,  // ✅ Auth ID
          role: updates.role 
        }, {
          onConflict: 'user_id'  // ✅ Resolver conflito usando a constraint unique de user_id
        });
      
      if (roleError) {
        console.error('❌ Erro ao atualizar role:', {
          code: roleError.code,
          message: roleError.message,
          details: roleError.details
        });
        
        // Se for erro de duplicação, tentar UPDATE direto como fallback
        if (roleError.code === '23505') {
          console.log('⚠️ Tentando UPDATE direto como fallback...');
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: updates.role })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error('❌ Erro no UPDATE direto:', updateError);
            throw new Error(`Falha ao atualizar role: ${updateError.message}`);
          }
          console.log(`✅ Role atualizada via UPDATE direto: ${updates.role}`);
        } else {
          throw new Error(`Falha ao atualizar role: ${roleError.message}`);
        }
      } else {
        console.log(`✅ Role atualizada via UPSERT: ${updates.role}`);
      }
    }
    
    // 2. Sanitizar papeis ANTES de validações (SOLUÇÃO P1 + P5)
    const ALLOWED_PAPEIS = new Set(['colaborador','especialista','cliente','grs','design','audiovisual','atendimento','financeiro','gestor','admin']);
    const PAPEIS_SYNONYMS: Record<string, string> = { 
      designer: 'design', 
      filmmaker: 'audiovisual', 
      rh: 'gestor' 
    };
    
    let papeisFinais: string[] = [];
    let warnings: string[] = [];
    
    if (Array.isArray(updates.papeis)) {
      const mapped = updates.papeis.map(p => PAPEIS_SYNONYMS[p] ?? p);
      const sanitized = mapped.filter(p => ALLOWED_PAPEIS.has(p));
      console.log('🔎 Papeis recebidos:', updates.papeis, '→ mapeados:', mapped, '→ sanitizados:', sanitized);
      
      if (sanitized.length > 0) {
        papeisFinais = sanitized;
      } else {
        console.log('⚠️ Nenhum papel válido após sanitização — mantendo papeis atuais');
        papeisFinais = pessoaAtual?.papeis || [];
        warnings.push('Papeis inválidos foram ignorados');
      }
    }
    
    // 3. Validação CPF para clientes (SOLUÇÃO P2)
    const isTornandoCliente = papeisFinais.includes('cliente');
    const cpfValido = pessoaAtual?.cpf && pessoaAtual.cpf.length >= 11;
    
    if (isTornandoCliente && !cpfValido) {
      console.warn('⚠️ CPF inválido para cliente — PULANDO atualização de papeis');
      warnings.push('CPF obrigatório para clientes. Por favor, adicione o CPF antes de definir como cliente.');
      papeisFinais = pessoaAtual?.papeis || []; // Manter papeis atuais
    }
    
    // 4. Validar cliente_id se tipo é cliente
    if (papeisFinais.includes('cliente') && !updates.cliente_id) {
      throw new Error('Cliente deve ter cliente_id definido');
    }
    
    // 5. Preparar updates para pessoas
    const pessoaUpdates: any = {};
    if (updates.cliente_id !== undefined) pessoaUpdates.cliente_id = updates.cliente_id;
    if (updates.status) pessoaUpdates.status = updates.status;
    
    // Adicionar papeis finais (já sanitizados e validados)
    if (papeisFinais.length > 0) {
      pessoaUpdates.papeis = papeisFinais;
    }
    
    if (Object.keys(pessoaUpdates).length > 0) {
      const { error: pessoaError } = await supabase
        .from('pessoas')
        .update(pessoaUpdates)
        .eq('profile_id', userId);  // ✅ Localizar via profile_id
      
      if (pessoaError) {
        console.error('❌ Erro ao atualizar pessoas:', pessoaError);
        throw pessoaError;
      }
      console.log(`✅ Dados atualizados em pessoas:`, pessoaUpdates);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário atualizado com sucesso',
        updates,
        warnings: warnings.length > 0 ? warnings : undefined
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
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