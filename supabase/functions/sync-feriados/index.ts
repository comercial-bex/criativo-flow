import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeriadoBrasilAPI {
  date: string;
  name: string;
  type: string; // 'national' | 'state' | 'municipal'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando sincronização de feriados...');

    // Obter ano da query string ou usar ano atual
    const url = new URL(req.url);
    const ano = url.searchParams.get('ano') || new Date().getFullYear().toString();
    
    console.log(`📅 Sincronizando feriados para o ano: ${ano}`);

    // 1. Buscar feriados da Brasil API
    const brasilApiUrl = `https://brasilapi.com.br/api/feriados/v1/${ano}`;
    console.log(`🌐 Buscando dados de: ${brasilApiUrl}`);
    
    const response = await fetch(brasilApiUrl);
    
    if (!response.ok) {
      throw new Error(`Brasil API retornou erro: ${response.status} ${response.statusText}`);
    }

    const feriados: FeriadoBrasilAPI[] = await response.json();
    console.log(`✅ ${feriados.length} feriados obtidos da Brasil API`);

    // 2. Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Formatar e preparar dados para inserção
    const feriadosFormatados = feriados.map(f => ({
      nome: f.name,
      data: f.date,
      tipo: f.type === 'national' ? 'nacional' : 'estadual',
      descricao: `Feriado ${f.type === 'national' ? 'nacional' : 'estadual'} importado via Brasil API`,
      is_ponto_facultativo: false,
      estado: null,
      cidade: null
    }));

    console.log(`📦 Preparando inserção de ${feriadosFormatados.length} feriados no banco...`);

    // 4. Inserir no Supabase (usando upsert para evitar duplicatas)
    const { data, error } = await supabase
      .from('feriados_nacionais')
      .upsert(feriadosFormatados, {
        onConflict: 'data',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Erro ao inserir feriados:', error);
      throw error;
    }

    console.log(`✅ Sincronização concluída com sucesso!`);

    // 5. Registrar log da sincronização
    const { error: logError } = await supabase
      .from('logs_sistema')
      .insert({
        tipo: 'sync_feriados',
        descricao: `Sincronizados ${feriadosFormatados.length} feriados do ano ${ano}`,
        metadata: {
          ano,
          total_importados: feriadosFormatados.length,
          fonte: 'Brasil API'
        }
      });

    if (logError) {
      console.warn('⚠️ Não foi possível registrar log (tabela logs_sistema pode não existir)');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ ${feriadosFormatados.length} feriados sincronizados para ${ano}`,
        data: {
          ano,
          total_importados: feriadosFormatados.length,
          feriados: feriadosFormatados
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
