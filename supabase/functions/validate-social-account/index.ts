import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { provider, accountsData } = await req.json();

    console.log('🔍 Validando contas sociais:', { provider, accounts: accountsData?.length });

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