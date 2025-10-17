import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchFacebookAccounts(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,instagram_business_account{id,name,username},category,tasks`
  );
  
  if (!response.ok) {
    throw new Error('Erro ao buscar páginas do Facebook');
  }

  const data = await response.json();
  return data.data || [];
}

async function fetchGoogleBusinessAccounts(accessToken: string) {
  // TODO: Implementar chamada à API Google Business Profile
  return [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autorização necessária');
    }

    const { provider, accountsData, accessToken, action } = await req.json();

    console.log('🔍 Validando contas sociais:', { provider, accounts: accountsData?.length, action });

    // Listar contas reais via API
    if (action === 'list_accounts') {
      let accounts = [];
      
      if (provider === 'facebook' || provider === 'instagram') {
        accounts = await fetchFacebookAccounts(accessToken);
      } else if (provider === 'google') {
        accounts = await fetchGoogleBusinessAccounts(accessToken);
      }

      // Validar cada conta
      const validatedAccounts = [];

      for (const account of accounts) {
        const isBusiness = account.account_type === 'BUSINESS' || 
                          account.category !== undefined ||
                          account.instagram_business_account !== undefined;

        const hasFacebookPage = provider === 'instagram' 
          ? account.connected_facebook_page !== undefined
          : true;

        const isInBusinessManager = account.business_account_id !== undefined;

        const hasAdminAccess = account.tasks?.includes('MANAGE') || 
                               account.tasks?.includes('ADVERTISE') ||
                               account.role === 'admin' ||
                               account.role === 'editor';

        const validation = {
          id: account.id,
          name: account.name || account.username,
          accountType: provider === 'instagram' && account.instagram_business_account ? 'business' : 'page',
          isValid: isBusiness && hasFacebookPage && hasAdminAccess,
          instagramAccount: account.instagram_business_account || null,
          accessToken: accessToken,
          missingRequirements: []
        };

        if (!isBusiness) validation.missingRequirements.push('Conta precisa ser Comercial');
        if (!hasFacebookPage && provider === 'instagram') validation.missingRequirements.push('Instagram precisa estar vinculado a Página do Facebook');
        if (!hasAdminAccess) validation.missingRequirements.push('Usuário precisa ser Admin ou Editor da conta');

        validatedAccounts.push(validation);
      }

      return new Response(
        JSON.stringify({
          success: true,
          accounts: validatedAccounts,
          validAccounts: validatedAccounts.filter(a => a.isValid)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validações específicas por provider
    const validatedAccounts = [];

    if (provider === 'facebook' || provider === 'instagram') {
      for (const account of accountsData || []) {
        // Verificar se é Business Account
        const isBusiness = account.account_type === 'BUSINESS' || 
                          account.category !== undefined ||
                          account.instagram_business_account !== undefined;

        // Verificar se tem Facebook Page vinculada (para Instagram)
        const hasFacebookPage = provider === 'instagram' 
          ? account.connected_facebook_page !== undefined
          : true;

        // Verificar se está no Business Manager
        const isInBusinessManager = account.business_account_id !== undefined;

        // Verificar permissões do usuário
        const hasAdminAccess = account.tasks?.includes('MANAGE') || 
                               account.tasks?.includes('ADVERTISE') ||
                               account.role === 'admin' ||
                               account.role === 'editor';

        const validation = {
          accountId: account.id,
          accountName: account.name || account.username,
          accountType: account.account_type,
          isValid: isBusiness && hasFacebookPage && isInBusinessManager && hasAdminAccess,
          checks: {
            isBusiness,
            hasFacebookPage,
            isInBusinessManager,
            hasAdminAccess,
          },
          missingRequirements: []
        };

        // Adicionar requisitos faltantes
        if (!isBusiness) validation.missingRequirements.push('Conta precisa ser Comercial');
        if (!hasFacebookPage && provider === 'instagram') validation.missingRequirements.push('Instagram precisa estar vinculado a Página do Facebook');
        if (!isInBusinessManager) validation.missingRequirements.push('Conta precisa estar no Gerenciador de Negócios');
        if (!hasAdminAccess) validation.missingRequirements.push('Usuário precisa ser Admin ou Editor da conta');

        validatedAccounts.push(validation);

        console.log(`✅ Conta ${account.name}: ${validation.isValid ? 'VÁLIDA' : 'INVÁLIDA'}`, validation.missingRequirements);
      }
    } else if (provider === 'google') {
      // Validação Google Analytics / Google My Business
      for (const account of accountsData || []) {
        const validation = {
          accountId: account.id,
          accountName: account.name,
          isValid: true, // Google tem menos restrições
          checks: {
            hasAccess: true
          },
          missingRequirements: []
        };

        validatedAccounts.push(validation);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider,
        validatedAccounts,
        summary: {
          total: validatedAccounts.length,
          valid: validatedAccounts.filter(a => a.isValid).length,
          invalid: validatedAccounts.filter(a => !a.isValid).length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao validar contas:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});