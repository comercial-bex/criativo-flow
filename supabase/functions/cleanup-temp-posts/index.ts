import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🧹 Iniciando limpeza de posts temporários expirados...')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Executar função de limpeza
    const { data, error } = await supabaseClient.rpc('cleanup_expired_temp_posts')

    if (error) {
      console.error('❌ Erro ao executar limpeza:', error)
      throw error
    }

    const deletedCount = data || 0
    const timestamp = new Date().toISOString()

    console.log(`✅ Limpeza concluída: ${deletedCount} posts removidos em ${timestamp}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted_count: deletedCount,
        timestamp,
        message: `${deletedCount} posts temporários expirados removidos com sucesso`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error: any) {
    console.error('❌ Erro fatal:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
