import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FASE 2: Edge Function para gerenciar especialistas com privilégios elevados
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, especialistaData } = await req.json();

    console.log(`🔧 Edge Function: Ação solicitada: ${action}`);

    switch (action) {
      case 'update-specialist':
        return await handleUpdateSpecialist(supabaseAdmin, especialistaData);
      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('❌ Erro na edge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleUpdateSpecialist(supabase: any, especialistaData: any) {
  const { id, nome, telefone, especialidade, role } = especialistaData;

  console.log('📝 Atualizando especialista:', { id, nome, especialidade, role });

  try {
    // Atualizar perfil do especialista
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nome,
        telefone,
        especialidade,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError);
      throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
    }

    // Atualizar ou inserir role se fornecida
    if (role) {
      // Primeiro, remover roles existentes para evitar duplicatas
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
      }

      // Inserir nova role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role: role
        });

      if (roleError) {
        console.error('❌ Erro ao inserir role:', roleError);
        throw new Error(`Erro ao atualizar função: ${roleError.message}`);
      }
    }

    console.log('✅ Especialista atualizado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Especialista atualizado com sucesso' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}