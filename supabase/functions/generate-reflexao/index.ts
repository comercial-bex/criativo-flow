import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const prompt = `
Gere uma frase inspiradora curta (máximo 2 linhas) para um profissional de 
Gestão de Redes Sociais iniciar o dia com motivação e foco. 
Use tom profissional mas acolhedor.
Seja criativo e diferente a cada vez.
Retorne APENAS a frase, sem aspas ou formatação extra.
    `.trim();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            reflexao: "Cada dia é uma nova oportunidade para criar conteúdo excepcional!"
          }), 
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      const errorText = await response.text();
      console.error('Erro da API:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const reflexao = data.choices?.[0]?.message?.content?.trim() || 
                     "Transforme ideias em estratégias vencedoras hoje!";

    console.log('Reflexão gerada:', reflexao);

    return new Response(
      JSON.stringify({ reflexao }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao gerar reflexão:', error);
    
    // Retornar mensagem padrão em caso de erro
    return new Response(
      JSON.stringify({ 
        reflexao: "Mantenha o foco, a consistência traz resultados extraordinários!"
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
