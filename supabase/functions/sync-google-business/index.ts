import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleBusinessLocation {
  name: string;
  title: string;
  phoneNumbers?: { number: string }[];
  categories?: { displayName: string }[];
  websiteUri?: string;
  regularHours?: any;
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

interface GoogleBusinessInsights {
  locationMetrics?: Array<{
    locationName: string;
    timeZone: string;
    metricValues: Array<{
      metric: string;
      totalValue: {
        value: string;
      };
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

    console.log('🚀 Iniciando sincronização do Google Meu Negócio...');

    // Buscar todas as integrações ativas do Google
    const { data: integrations, error: integrationsError } = await supabaseClient
      .from('social_integrations')
      .select('*')
      .eq('provider', 'google')
      .eq('is_active', true);

    if (integrationsError) {
      console.error('❌ Erro ao buscar integrações:', integrationsError);
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('ℹ️ Nenhuma integração Google ativa encontrada');
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
        console.log(`📊 Processando integração Google para usuário ${integration.user_id}`);
        
        // Buscar contas/localizações do usuário
        const accountsResponse = await fetch(
          'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
          {
            headers: {
              'Authorization': `Bearer ${integration.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!accountsResponse.ok) {
          console.error(`❌ Erro na API do Google Business para ${integration.id}:`, accountsResponse.status);
          const errorText = await accountsResponse.text();
          console.error('Detalhes do erro:', errorText);
          continue;
        }

        const accountsData = await accountsResponse.json();
        console.log(`✅ Contas Google obtidas:`, accountsData.accounts?.length || 0);

        if (!accountsData.accounts || accountsData.accounts.length === 0) {
          console.log('ℹ️ Nenhuma conta Google Business encontrada');
          continue;
        }

        // Para cada conta, buscar localizações
        for (const account of accountsData.accounts) {
          const locationsResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
            {
              headers: {
                'Authorization': `Bearer ${integration.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            
            if (locationsData.locations && locationsData.locations.length > 0) {
              for (const location of locationsData.locations) {
                console.log(`📍 Processando localização: ${location.title}`);

                // Buscar insights da localização (últimos 30 dias)
                const startDate = getDateDaysAgo(30);
                const endDate = getDateDaysAgo(1);

                try {
                  const insightsResponse = await fetch(
                    `https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}:reportInsights`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${integration.access_token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        locationNames: [location.name],
                        basicRequest: {
                          metricRequests: [
                            { metric: 'VIEWS_MAPS' },
                            { metric: 'VIEWS_SEARCH' },
                            { metric: 'ACTIONS_WEBSITE' },
                            { metric: 'ACTIONS_PHONE' },
                            { metric: 'ACTIONS_DRIVING_DIRECTIONS' }
                          ],
                          timeRange: {
                            startTime: `${startDate}T00:00:00Z`,
                            endTime: `${endDate}T23:59:59Z`
                          }
                        }
                      })
                    }
                  );

                  const today = new Date().toISOString().split('T')[0];

                  if (insightsResponse.ok) {
                    const insightsData: GoogleBusinessInsights = await insightsResponse.json();
                    
                    if (insightsData.locationMetrics && insightsData.locationMetrics.length > 0) {
                      for (const locationMetric of insightsData.locationMetrics) {
                        for (const metricValue of locationMetric.metricValues) {
                          await supabaseClient
                            .from('social_metrics')
                            .upsert({
                              integration_id: integration.id,
                              metric_type: `google_${metricValue.metric.toLowerCase()}`,
                              metric_value: parseInt(metricValue.totalValue.value) || 0,
                              metric_date: today,
                              raw_data: {
                                location_name: location.title,
                                metric: metricValue.metric,
                                time_range: { startDate, endDate },
                                location_data: location
                              }
                            }, {
                              onConflict: 'integration_id,metric_type,metric_date'
                            });
                        }
                      }
                    }
                  }
                } catch (insightsError) {
                  console.error(`⚠️ Erro ao buscar insights para ${location.title}:`, insightsError);
                }

                // Atualizar dados da conta na integração
                await supabaseClient
                  .from('social_integrations')
                  .update({
                    account_name: location.title,
                    account_data: {
                      ...integration.account_data,
                      location: location,
                      account: account,
                      last_sync: new Date().toISOString()
                    },
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', integration.id);
              }
            }
          }
        }

        processedCount++;
        results.push({
          integration_id: integration.id,
          provider: integration.provider,
          account_name: integration.account_name,
          status: 'success'
        });

        console.log(`✅ Sincronização Google concluída para usuário ${integration.user_id}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar integração Google ${integration.id}:`, error);
        results.push({
          integration_id: integration.id,
          provider: integration.provider,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    console.log(`🎉 Sincronização Google concluída! Processadas ${processedCount}/${integrations.length} integrações`);

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização Google concluída`,
      processed: processedCount,
      total: integrations.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro geral na sincronização Google:', error);
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