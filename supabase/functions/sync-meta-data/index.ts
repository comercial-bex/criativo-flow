import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaPageData {
  id: string;
  name: string;
  category: string;
  followers_count?: number;
  fan_count?: number;
}

interface MetaInsights {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
      end_time: string;
    }>;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Iniciando sincronização de dados do Meta...');

    // Buscar todas as integrações ativas do Facebook/Instagram
    const { data: integrations, error: integrationsError } = await supabaseClient
      .from('social_integrations')
      .select('*')
      .in('provider', ['facebook', 'instagram'])
      .eq('is_active', true);

    if (integrationsError) {
      console.error('❌ Erro ao buscar integrações:', integrationsError);
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('ℹ️ Nenhuma integração Meta ativa encontrada');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhuma integração ativa encontrada',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;
    const results = [];

    for (const integration of integrations) {
      try {
        console.log(`📊 Processando integração ${integration.provider} para usuário ${integration.user_id}`);
        
        // Buscar dados da página/perfil
        const pageResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,category,followers_count,fan_count&access_token=${integration.access_token}`
        );

        if (!pageResponse.ok) {
          console.error(`❌ Erro na API do Meta para ${integration.id}:`, pageResponse.status);
          continue;
        }

        const pageData: MetaPageData = await pageResponse.json();
        console.log(`✅ Dados da página obtidos:`, pageData.name);

        // Buscar insights dos últimos 7 dias
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pageData.id}/insights?metric=page_impressions,page_reach,page_engaged_users&period=day&since=${getDateDaysAgo(7)}&until=${getDateDaysAgo(1)}&access_token=${integration.access_token}`
        );

        const today = new Date().toISOString().split('T')[0];

        if (insightsResponse.ok) {
          const insightsData: MetaInsights = await insightsResponse.json();
          console.log(`📈 Insights obtidos para ${pageData.name}`);

          // Processar e salvar métricas
          for (const insight of insightsData.data) {
            for (const value of insight.values) {
              const metricDate = value.end_time.split('T')[0];
              
              await supabaseClient
                .from('social_metrics')
                .upsert({
                  integration_id: integration.id,
                  metric_type: insight.name,
                  metric_value: value.value,
                  metric_date: metricDate,
                  raw_data: { 
                    page_data: pageData,
                    insight_name: insight.name,
                    end_time: value.end_time
                  }
                }, {
                  onConflict: 'integration_id,metric_type,metric_date'
                });
            }
          }
        }

        // Salvar dados básicos da conta
        const followers = pageData.followers_count || pageData.fan_count || 0;
        await supabaseClient
          .from('social_metrics')
          .upsert({
            integration_id: integration.id,
            metric_type: 'followers',
            metric_value: followers,
            metric_date: today,
            raw_data: { page_data: pageData, sync_date: new Date().toISOString() }
          }, {
            onConflict: 'integration_id,metric_type,metric_date'
          });

        // Atualizar dados da conta na integração
        await supabaseClient
          .from('social_integrations')
          .update({
            account_name: pageData.name,
            account_data: {
              ...integration.account_data,
              category: pageData.category,
              last_sync: new Date().toISOString(),
              followers_count: followers
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', integration.id);

        processedCount++;
        results.push({
          integration_id: integration.id,
          provider: integration.provider,
          account_name: pageData.name,
          followers: followers,
          status: 'success'
        });

        console.log(`✅ Sincronização concluída para ${pageData.name}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar integração ${integration.id}:`, error);
        results.push({
          integration_id: integration.id,
          provider: integration.provider,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    console.log(`🎉 Sincronização concluída! Processadas ${processedCount}/${integrations.length} integrações`);

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização concluída`,
      processed: processedCount,
      total: integrations.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}