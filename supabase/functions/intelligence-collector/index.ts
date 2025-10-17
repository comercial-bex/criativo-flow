import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntelligenceSource {
  id: string;
  name: string;
  type: string;
  endpoint_url: string;
  method: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  ttl_minutes: number;
  is_active: boolean;
  requires_auth: boolean;
  auth_key_env: string | null;
  rate_limit_per_hour: number;
}

interface CollectorResult {
  success: boolean;
  source: string;
  collected: number;
  error?: string;
  raw_preview?: string;
  sample_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Intelligence Collector: Starting data collection...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body for test mode
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const testMode = body.test_mode === true;
    const singleSourceId = body.source_id;

    if (testMode) {
      console.log('🧪 Test mode enabled - will not save to database');
    }

    // Get intelligence sources (filter by ID for test mode)
    let query = supabase.from('intelligence_sources').select('*');
    
    if (singleSourceId) {
      query = query.eq('id', singleSourceId);
    } else {
      query = query.eq('is_active', true);
    }

    const { data: sources, error: sourcesError } = await query;

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    console.log(`📊 Found ${sources?.length || 0} ${testMode ? 'test' : 'active'} intelligence sources`);

    const results: CollectorResult[] = [];

    // Process each source
    for (const source of sources || []) {
      try {
        console.log(`🔍 Processing source: ${source.name} (${source.type})`);

        // Check if we should collect based on TTL (skip in test mode)
        if (!testMode) {
          const shouldCollect = await checkShouldCollect(supabase, source);
          
          if (!shouldCollect) {
            console.log(`⏭️ Skipping ${source.name} - within TTL window`);
            continue;
          }
        }

        // Collect data based on source type
        let rawResponse = '';
        let collectedData: any[] = [];
        
        try {
          const response = await collectFromSource(source);
          collectedData = response.data;
          rawResponse = response.rawData || '';
        } catch (collectError: any) {
          console.error(`❌ Error collecting from ${source.name}:`, collectError.message);
          
          // Update connector status with error (skip in test mode)
          if (!testMode) {
            await supabase.rpc('update_connector_status', {
              p_connector_name: source.name,
              p_success: false,
              p_error_message: collectError.message
            }).catch(e => console.warn('Failed to update connector status:', e));
          }
          
          results.push({
            source: source.name,
            success: false,
            collected: 0,
            error: collectError.message,
            ...(testMode && { raw_preview: collectError.message })
          });
          continue;
        }

        if (collectedData.length === 0) {
          console.log(`ℹ️ No new data for ${source.name}`);
          
          // Update connector status as healthy even with 0 items (skip in test mode)
          if (!testMode) {
            await supabase.rpc('update_connector_status', {
              p_connector_name: source.name,
              p_success: true,
              p_error_message: null
            }).catch(e => console.warn('Failed to update connector status:', e));
          }
          
          results.push({
            source: source.name,
            success: true,
            collected: 0,
            ...(testMode && { raw_preview: rawResponse.substring(0, 500) })
          });
          continue;
        }
        
        // In test mode, don't save to database
        if (testMode) {
          console.log(`🧪 Test mode: Skipping database save for ${source.name}`);
          results.push({
            source: source.name,
            success: true,
            collected: collectedData.length,
            raw_preview: rawResponse.substring(0, 500),
            sample_data: collectedData[0]
          });
          continue;
        }

        // Save to intelligence_data table
        const { error: insertError } = await supabase
          .from('intelligence_data')
          .upsert(
            collectedData.map(item => ({
              source_id: source.id,
              external_id: item.external_id,
              data_type: source.type,
              title: item.title,
              content: item.content,
              url: item.url,
              region: item.region,
              keywords: item.keywords,
              metric_type: item.metric_type,
              metric_value: item.metric_value,
              published_at: item.published_at,
              raw_payload: item.raw_payload
            })),
            { onConflict: 'source_id,external_id' }
          );

        if (insertError) {
          throw new Error(`Failed to save data: ${insertError.message}`);
        }

        console.log(`✅ Saved ${collectedData.length} items for ${source.name}`);
        
        // Update connector status - success
        await supabase.rpc('update_connector_status', {
          p_connector_name: source.name,
          p_success: true
        }).catch(e => console.warn('Failed to update connector status:', e));

        results.push({
          source: source.name,
          success: true,
          collected: collectedData.length
        });

        // Check for alerts
        await checkForAlerts(supabase, source, collectedData);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`❌ Error processing ${source.name}:`, errorMessage);
        
        // Update connector status - error (skip in test mode)
        if (!testMode) {
          await supabase.rpc('update_connector_status', {
            p_connector_name: source.name,
            p_success: false,
            p_error_message: errorMessage
          }).catch(e => console.warn('Failed to update connector status:', e));
        }

        results.push({
          source: source.name,
          success: false,
          collected: 0,
          error: errorMessage
        });
      }
    }

    console.log('🎯 Intelligence collection completed');

    const hasErrors = results.some(r => !r.success);

    return new Response(JSON.stringify({
      success: !hasErrors,
      message: 'Intelligence collection completed',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Intelligence Collector Error:', error);
    // Always return 200 with error details instead of 500
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkShouldCollect(supabase: any, source: IntelligenceSource): Promise<boolean> {
  const { data } = await supabase
    .from('intelligence_data')
    .select('retrieved_at')
    .eq('source_id', source.id)
    .order('retrieved_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return true;

  const lastRetrieved = new Date(data.retrieved_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastRetrieved.getTime()) / (1000 * 60);

  return diffMinutes >= source.ttl_minutes;
}

async function collectFromSource(source: IntelligenceSource): Promise<{ data: any[], rawData: string }> {
  const headers: Record<string, string> = { ...source.headers };
  
  // Add auth header if required
  if (source.requires_auth && source.auth_key_env) {
    const apiKey = Deno.env.get(source.auth_key_env);
    if (!apiKey) {
      throw new Error(`Missing API key for ${source.auth_key_env}`);
    }
    
    if (source.auth_key_env === 'YOUTUBE_API_KEY') {
      // YouTube Data API uses API key via the 'key' query parameter; do not set Authorization header
    } else if (source.auth_key_env === 'OPENWEATHER_API_KEY') {
      // OpenWeather uses query param, handled below
    }
  }

  let url = source.endpoint_url;
  const urlObj = new URL(url);

  // Add query parameters
  Object.entries(source.params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Special handling for different source types
  if (source.type === 'news' && source.name.includes('Google News')) {
    urlObj.searchParams.set('q', 'marketing digital OR social media');
    urlObj.searchParams.set('hl', 'pt-BR');
    urlObj.searchParams.set('gl', 'BR');
    urlObj.searchParams.set('ceid', 'BR:pt-BR');
  } else if (source.type === 'weather' && source.auth_key_env === 'OPENWEATHER_API_KEY') {
    urlObj.searchParams.set('q', 'São Paulo,BR');
    urlObj.searchParams.set('appid', Deno.env.get('OPENWEATHER_API_KEY') || '');
    urlObj.searchParams.set('units', 'metric');
  } else if (source.type === 'social' && source.auth_key_env === 'YOUTUBE_API_KEY') {
    urlObj.searchParams.set('part', 'snippet');
    urlObj.searchParams.set('q', 'marketing digital trends 2024');
    urlObj.searchParams.set('key', Deno.env.get('YOUTUBE_API_KEY') || '');
    urlObj.searchParams.set('maxResults', '10');
    urlObj.searchParams.set('order', 'relevance');
  }

  console.log(`🌐 Fetching from: ${urlObj.toString()}`);

  // Retry logic for IBGE (503 errors are common)
  let lastError: Error | null = null;
  const maxRetries = source.name === 'IBGE Demographics' ? 2 : 1;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`🔄 Retry attempt ${attempt} for ${source.name}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const response = await fetch(urlObj.toString(), {
        method: source.method,
        headers,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        console.error(`❌ HTTP Error Details:`, {
          status: response.status,
          statusText: response.statusText,
          url: urlObj.toString()
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.text();
      const data = await parseSourceData(source, rawData);
      
      return { data, rawData };
    } catch (error: any) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Unknown error during collection');
}

async function parseSourceData(source: IntelligenceSource, rawData: string): Promise<any[]> {
  const results: any[] = [];

  try {
    if (source.type === 'news' && rawData.includes('<rss')) {
      // Parse RSS feed
      const items = extractRSSItems(rawData);
      items.forEach((item, index) => {
        results.push({
          external_id: `${source.id}_${Date.now()}_${index}`,
          title: item.title,
          content: item.description,
          url: item.link,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          keywords: extractKeywords(item.title + ' ' + item.description),
          raw_payload: item
        });
      });
    } else if (source.type === 'demographics' && source.name === 'Brasil API') {
      // Brasil API - CEP data (tolerant parsing)
      try {
        const jsonData = JSON.parse(rawData);
        
        // Handle both v1 and v2 formats, and array responses
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        dataArray.forEach((item: any) => {
          results.push({
            external_id: `${source.id}_${item.cep || Date.now()}`,
            title: `Dados demográficos - ${item.city || item.localidade || 'Brasil'}`,
            content: `${item.city || item.localidade || 'Desconhecido'}/${item.state || item.uf || 'N/A'} - ${item.neighborhood || item.bairro || ''}`,
            region: `${item.city || item.localidade || 'Brasil'}, ${item.state || item.uf || 'BR'}`,
            keywords: [
              (item.city || item.localidade || '')?.toLowerCase(), 
              (item.state || item.uf || '')?.toLowerCase(), 
              'brasil', 
              'demografia'
            ].filter(Boolean),
            raw_payload: item
          });
        });
      } catch (parseError) {
        console.warn(`⚠️ Brasil API parse error:`, parseError);
        results.push({
          external_id: `${source.id}_error_${Date.now()}`,
          title: 'Dados Brasil API',
          content: 'Erro ao processar dados',
          region: 'Brasil',
          keywords: ['brasil', 'erro'],
          raw_payload: { error: 'Parse failed' }
        });
      }
    } else if (source.type === 'demographics' && source.name === 'IBGE Demographics') {
      // IBGE API - Aggregated demographic data (tolerant parsing)
      try {
        const jsonData = JSON.parse(rawData);
        
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          jsonData.forEach((item: any, index: number) => {
            try {
              const valor = item.resultados?.[0]?.series?.[0]?.serie || {};
              const anos = Object.keys(valor);
              const ano = anos.length > 0 ? anos[anos.length - 1] : '2022';
              const populacao = valor[ano] || 0;
              
              results.push({
                external_id: `${source.id}_${item.id || index}_${Date.now()}`,
                title: `População Brasil - ${ano}`,
                content: `Dados populacionais: ${populacao}`,
                region: 'Brasil',
                metric_type: 'populacao',
                metric_value: parseFloat(populacao) || 0,
                published_at: new Date().toISOString(),
                keywords: ['ibge', 'demografia', 'população', 'brasil'],
                raw_payload: item
              });
            } catch (itemError) {
              console.warn(`⚠️ IBGE item parse error:`, itemError);
            }
          });
        }
        
        // If no results, add a placeholder
        if (results.length === 0) {
          results.push({
            external_id: `${source.id}_nodata_${Date.now()}`,
            title: 'Dados IBGE',
            content: 'Sem dados no período',
            region: 'Brasil',
            metric_type: 'populacao',
            metric_value: 0,
            published_at: new Date().toISOString(),
            keywords: ['ibge', 'demografia', 'brasil'],
            raw_payload: { message: 'No data available' }
          });
        }
      } catch (parseError) {
        console.warn(`⚠️ IBGE parse error:`, parseError);
        results.push({
          external_id: `${source.id}_error_${Date.now()}`,
          title: 'Dados IBGE',
          content: 'Erro ao processar dados',
          region: 'Brasil',
          metric_type: 'populacao',
          metric_value: 0,
          keywords: ['ibge', 'erro'],
          raw_payload: { error: 'Parse failed' }
        });
      }
    } else if (source.type === 'social' || source.type === 'weather') {
      // Parse JSON response
      const jsonData = JSON.parse(rawData);
      
      if (source.type === 'social' && jsonData.items) {
        // YouTube API response
        jsonData.items.forEach((item: any) => {
          results.push({
            external_id: item.id.videoId || `${source.id}_${Date.now()}`,
            title: item.snippet.title,
            content: item.snippet.description,
            url: `https://youtube.com/watch?v=${item.id.videoId}`,
            published_at: item.snippet.publishedAt,
            keywords: extractKeywords(item.snippet.title + ' ' + item.snippet.description),
            raw_payload: item
          });
        });
      } else if (source.type === 'weather' && jsonData.weather) {
        // OpenWeather API response
        results.push({
          external_id: `weather_${jsonData.id}_${Date.now()}`,
          title: `Clima em ${jsonData.name}`,
          content: `${jsonData.weather[0].description}, ${jsonData.main.temp}°C`,
          region: jsonData.name,
          metric_type: 'temperature',
          metric_value: jsonData.main.temp,
          published_at: new Date().toISOString(),
          keywords: ['clima', 'tempo', jsonData.name.toLowerCase()],
          raw_payload: jsonData
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing data for ${source.name}:`, error);
  }

  return results;
}

function extractRSSItems(rssData: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(rssData)) !== null) {
    const itemContent = match[1];
    const title = extractXMLContent(itemContent, 'title');
    const description = extractXMLContent(itemContent, 'description');
    const link = extractXMLContent(itemContent, 'link');
    const pubDate = extractXMLContent(itemContent, 'pubDate');

    items.push({
      title: cleanText(title),
      description: cleanText(description),
      link,
      pubDate
    });
  }

  return items;
}

function extractXMLContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .trim();
}

function extractKeywords(text: string): string[] {
  const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'em', 'no', 'na', 'para', 'por', 'com', 'sem', 'sobre', 'até', 'após', 'antes', 'durante', 'entre'];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 10);

  return [...new Set(words)];
}

async function checkForAlerts(supabase: any, source: IntelligenceSource, data: any[]): Promise<void> {
  // Get active alerts for this source type
  const { data: alerts } = await supabase
    .from('intelligence_alerts')
    .select('*')
    .eq('is_active', true)
    .eq('alert_type', getAlertTypeForSource(source.type));

  if (!alerts || alerts.length === 0) return;

  for (const alert of alerts) {
    const shouldTrigger = await evaluateAlertConditions(alert, data);
    
    if (shouldTrigger) {
      // Create notification
      await supabase.rpc('create_intelligence_alert', {
        p_cliente_id: alert.cliente_id,
        p_title: `🔔 ${alert.name}`,
        p_message: `Nova atividade detectada: ${data.length} novos itens encontrados`,
        p_severity: alert.severity
      });

      // Update last triggered
      await supabase
        .from('intelligence_alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id);
    }
  }
}

function getAlertTypeForSource(sourceType: string): string {
  switch (sourceType) {
    case 'news': return 'news_mention';
    case 'social': return 'keyword_trend';
    case 'weather': return 'weather_alert';
    default: return 'general';
  }
}

async function evaluateAlertConditions(alert: any, data: any[]): Promise<boolean> {
  const conditions = alert.conditions;
  
  if (conditions.min_items && data.length >= conditions.min_items) {
    return true;
  }
  
  if (conditions.keywords && Array.isArray(conditions.keywords)) {
    const keywordMatches = data.filter(item => 
      conditions.keywords.some((keyword: string) => 
        item.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.content?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (keywordMatches.length >= (conditions.min_keyword_matches || 1)) {
      return true;
    }
  }
  
  return false;
}