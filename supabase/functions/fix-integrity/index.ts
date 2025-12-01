import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results = {
      fase1_roles_synced: 0,
      fase2_onboarding_created: 0,
      fase3_vetor_created: false,
      fase3_proposta_linked: false,
      fase3_orcamento_linked: false,
      errors: [] as string[],
    };

    // ============================================
    // FASE 1: Sincronizar Pessoas com user_roles
    // ============================================
    console.log('🔄 Fase 1: Sincronizando pessoas com user_roles...');
    
    const { data: pessoasSemRole } = await supabaseAdmin
      .from('pessoas')
      .select('id, profile_id, papeis, nome')
      .not('profile_id', 'is', null);

    if (pessoasSemRole) {
      for (const pessoa of pessoasSemRole) {
        // Verificar se já tem role
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', pessoa.profile_id)
          .maybeSingle();

        if (!existingRole) {
          // Mapear papel para role
          let role = 'cliente';
          const papeis = pessoa.papeis || [];
          
          if (papeis.includes('admin')) role = 'admin';
          else if (papeis.includes('gestor')) role = 'gestor';
          else if (papeis.includes('grs')) role = 'grs';
          else if (papeis.includes('design')) role = 'designer';
          else if (papeis.includes('audiovisual')) role = 'filmmaker';
          else if (papeis.includes('especialista')) role = 'filmmaker';
          else if (papeis.includes('colaborador')) role = 'atendimento';

          const { error } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: pessoa.profile_id, role });

          if (error) {
            results.errors.push(`Erro ao criar role para ${pessoa.nome}: ${error.message}`);
          } else {
            results.fase1_roles_synced++;
            console.log(`✅ Role '${role}' criado para ${pessoa.nome}`);
          }
        }
      }
    }

    // ============================================
    // FASE 2: Criar Onboarding para Clientes
    // ============================================
    console.log('🔄 Fase 2: Criando onboarding para clientes...');
    
    const { data: clientesSemOnboarding } = await supabaseAdmin
      .from('clientes')
      .select('id, nome');

    if (clientesSemOnboarding) {
      for (const cliente of clientesSemOnboarding) {
        const { data: existingOnboarding } = await supabaseAdmin
          .from('cliente_onboarding')
          .select('id')
          .eq('cliente_id', cliente.id)
          .maybeSingle();

        if (!existingOnboarding) {
          const { error } = await supabaseAdmin
            .from('cliente_onboarding')
            .insert({ 
              cliente_id: cliente.id, 
              nome_empresa: cliente.nome 
            });

          if (error) {
            results.errors.push(`Erro ao criar onboarding para ${cliente.nome}: ${error.message}`);
          } else {
            results.fase2_onboarding_created++;
            console.log(`✅ Onboarding criado para ${cliente.nome}`);
          }
        }
      }
    }

    // ============================================
    // FASE 3: Criar Cliente VETOR e Vincular Órfãos
    // ============================================
    console.log('🔄 Fase 3: Criando cliente VETOR...');
    
    const vetorId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    
    // Verificar se VETOR já existe
    const { data: existingVetor } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('id', vetorId)
      .maybeSingle();

    if (!existingVetor) {
      const { error: vetorError } = await supabaseAdmin
        .from('clientes')
        .insert({
          id: vetorId,
          nome: 'VETOR - Produção Audiovisual',
          status: 'ativo'
        });

      if (vetorError) {
        results.errors.push(`Erro ao criar cliente VETOR: ${vetorError.message}`);
      } else {
        results.fase3_vetor_created = true;
        console.log('✅ Cliente VETOR criado');
        
        // Criar onboarding para VETOR
        await supabaseAdmin
          .from('cliente_onboarding')
          .insert({
            cliente_id: vetorId,
            nome_empresa: 'VETOR - Produção Audiovisual'
          });
      }
    } else {
      console.log('ℹ️ Cliente VETOR já existe');
    }

    // Vincular orçamento órfão
    const { data: orcamentoOrfao } = await supabaseAdmin
      .from('orcamentos')
      .select('id')
      .eq('id', '2ac1bd17-52d6-443b-aab7-ad1656ca6543')
      .is('cliente_id', null)
      .maybeSingle();

    if (orcamentoOrfao) {
      const { error } = await supabaseAdmin
        .from('orcamentos')
        .update({ cliente_id: vetorId })
        .eq('id', '2ac1bd17-52d6-443b-aab7-ad1656ca6543');

      if (!error) {
        results.fase3_orcamento_linked = true;
        console.log('✅ Orçamento vinculado ao VETOR');
      }
    }

    // Vincular proposta órfã
    const { data: propostaOrfa } = await supabaseAdmin
      .from('propostas')
      .select('id')
      .eq('id', '5f563998-7c69-4461-a2ae-bbae42c849ca')
      .is('cliente_id', null)
      .maybeSingle();

    if (propostaOrfa) {
      const { error } = await supabaseAdmin
        .from('propostas')
        .update({ cliente_id: vetorId })
        .eq('id', '5f563998-7c69-4461-a2ae-bbae42c849ca');

      if (!error) {
        results.fase3_proposta_linked = true;
        console.log('✅ Proposta vinculada ao VETOR');
      }
    }

    // Registrar no log
    await supabaseAdmin
      .from('system_health_logs')
      .insert({
        check_type: 'integrity_fix',
        status: results.errors.length === 0 ? 'ok' : 'warning',
        details: results
      });

    console.log('✅ Correção de integridade concluída:', results);

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        summary: {
          roles_synced: results.fase1_roles_synced,
          onboarding_created: results.fase2_onboarding_created,
          vetor_created: results.fase3_vetor_created,
          orphans_linked: results.fase3_proposta_linked || results.fase3_orcamento_linked
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na correção de integridade:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
