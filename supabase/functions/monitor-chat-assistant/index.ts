import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thread_id, message, connection_id } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar contexto: eventos recentes + checks + playbooks
    const { data: events } = await supabaseAdmin
      .from('system_events_bus')
      .select('*')
      .eq('connection_id', connection_id)
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: checks } = await supabaseAdmin
      .from('system_checks')
      .select('*')
      .eq('connection_id', connection_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: playbooks } = await supabaseAdmin
      .from('system_playbooks')
      .select('*');

    const { data: connection } = await supabaseAdmin
      .from('system_connections')
      .select('*')
      .eq('id', connection_id)
      .single();

    // Montar prompt com contexto
    const systemPrompt = `Você é um assistente técnico especializado em diagnóstico do BEX 3.0 — uma plataforma full-stack de gestão para agências de marketing.

**CONEXÃO EM ANÁLISE:**
${JSON.stringify(connection, null, 2)}

**EVENTOS CRÍTICOS RECENTES:**
${events && events.length > 0 ? JSON.stringify(events, null, 2) : 'Nenhum evento crítico registrado'}

**ÚLTIMAS VERIFICAÇÕES:**
${checks && checks.length > 0 ? JSON.stringify(checks.slice(0, 5), null, 2) : 'Sem histórico de verificações'}

**PLAYBOOKS DISPONÍVEIS:**
${playbooks?.map(p => `• ${p.title} (match: ${p.match_error})`).join('\n') || 'Nenhum playbook disponível'}

**SUAS RESPONSABILIDADES:**
1. **Diagnosticar** a causa raiz baseado nos logs, eventos e checks
2. **Sugerir 3 ações imediatas** que o usuário pode executar agora
3. **Recomendar o playbook** mais adequado (se aplicável)
4. **Ser técnico mas acessível** — use termos precisos mas explique quando necessário

**FORMATO DE RESPOSTA:**
🔍 **Causa Provável:**
[Explicação clara e direta do problema]

🛠️ **Ações Imediatas:**
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

📋 **Playbook Recomendado:**
[Nome do playbook e resumo de 1 linha]

💡 **Contexto Adicional:**
[Se houver informações relevantes sobre o sistema]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const aiResult = await response.json();
    const assistantMessage = aiResult.choices[0].message.content;

    // Salvar mensagens no thread
    await supabaseAdmin.from('system_chat_messages').insert([
      { thread_id, role: 'user', content: message },
      { thread_id, role: 'assistant', content: assistantMessage }
    ]);

    // Buscar playbook sugerido (se mencionado)
    let suggestedPlaybook = null;
    for (const pb of playbooks || []) {
      if (assistantMessage.toLowerCase().includes(pb.title.toLowerCase())) {
        suggestedPlaybook = pb;
        break;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        suggested_playbook: suggestedPlaybook,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in chat assistant:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
