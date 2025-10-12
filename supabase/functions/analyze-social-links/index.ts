import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialLinkAnalysis {
  url: string;
  plataforma: 'tiktok' | 'instagram' | 'youtube' | 'desconhecido';
  titulo: string;
  descricao: string;
  thumbnail_url?: string;
  estilo_visual_detectado: string[];
  tom_narrativo: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { links } = await req.json();

    if (!links || !Array.isArray(links) || links.length === 0) {
      throw new Error('Links são obrigatórios');
    }

    // Limitar a 10 links
    const linksToAnalyze = links.slice(0, 10);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const linksAnalisados: SocialLinkAnalysis[] = [];

    for (const linkUrl of linksToAnalyze) {
      try {
        const plataforma = detectarPlataforma(linkUrl);
        
        // Análise básica via metadados
        const metadata = await extrairMetadados(linkUrl);
        
        // Análise IA para insights visuais
        let insightsIA = '';
        if (LOVABLE_API_KEY) {
          insightsIA = await analisarComIA(linkUrl, metadata, LOVABLE_API_KEY);
        }

        linksAnalisados.push({
          url: linkUrl,
          plataforma,
          titulo: metadata.titulo || 'Vídeo sem título',
          descricao: metadata.descricao || '',
          thumbnail_url: metadata.thumbnail,
          estilo_visual_detectado: extrairEstilosVisuais(insightsIA, metadata),
          tom_narrativo: extrairTomNarrativo(insightsIA, metadata),
        });
      } catch (error) {
        console.error(`Erro ao analisar ${linkUrl}:`, error);
        // Fallback gracioso
        linksAnalisados.push({
          url: linkUrl,
          plataforma: 'desconhecido',
          titulo: 'Link inacessível',
          descricao: 'Não foi possível analisar este link',
          estilo_visual_detectado: [],
          tom_narrativo: 'Desconhecido',
        });
      }
    }

    // Consolidar insights
    const insightsConsolidados = consolidarInsights(linksAnalisados);

    return new Response(
      JSON.stringify({
        success: true,
        links_analisados: linksAnalisados,
        insights_consolidados: insightsConsolidados,
        sugestoes_tecnicas: gerarSugestoesTecnicas(linksAnalisados),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro ao analisar links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function detectarPlataforma(url: string): 'tiktok' | 'instagram' | 'youtube' | 'desconhecido' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'desconhecido';
}

async function extrairMetadados(url: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BEX-Bot/1.0)',
      },
    });
    clearTimeout(timeoutId);

    const html = await response.text();

    // Extrair Open Graph tags
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];

    return {
      titulo: ogTitle || '',
      descricao: ogDescription || '',
      thumbnail: ogImage || '',
    };
  } catch (error) {
    console.error('Erro ao extrair metadados:', error);
    return { titulo: '', descricao: '', thumbnail: '' };
  }
}

async function analisarComIA(url: string, metadata: any, apiKey: string): Promise<string> {
  try {
    const prompt = `Analise este vídeo de mídia social baseado nos metadados:
    
URL: ${url}
Título: ${metadata.titulo}
Descrição: ${metadata.descricao}

Identifique:
1. Estilo visual predominante (ex: transições rápidas, cores vibrantes, minimalista, etc.)
2. Tom narrativo (ex: informal, humorístico, educativo, inspirador, etc.)
3. Elementos técnicos notáveis (enquadramento, movimento de câmera, efeitos)

Seja específico e objetivo em 2-3 frases.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('Erro na análise IA:', error);
  }
  return '';
}

function extrairEstilosVisuais(insightsIA: string, metadata: any): string[] {
  const estilos = [];
  const texto = (insightsIA + ' ' + metadata.titulo + ' ' + metadata.descricao).toLowerCase();

  if (texto.includes('rápid') || texto.includes('dinâmic')) estilos.push('Transições rápidas');
  if (texto.includes('cores') || texto.includes('colorid')) estilos.push('Cores vibrantes');
  if (texto.includes('minimal')) estilos.push('Minimalista');
  if (texto.includes('close') || texto.includes('detalhe')) estilos.push('Enquadramentos fechados');
  if (texto.includes('moviment') || texto.includes('câmera')) estilos.push('Câmera em movimento');
  if (texto.includes('texto') || texto.includes('legenda')) estilos.push('Texto em tela');

  return estilos.length > 0 ? estilos : ['Estilo padrão'];
}

function extrairTomNarrativo(insightsIA: string, metadata: any): string {
  const texto = (insightsIA + ' ' + metadata.titulo + ' ' + metadata.descricao).toLowerCase();

  if (texto.includes('humor') || texto.includes('engraça')) return 'Humorístico';
  if (texto.includes('educativ') || texto.includes('ensina')) return 'Educativo';
  if (texto.includes('inspira') || texto.includes('motiv')) return 'Inspirador';
  if (texto.includes('informal') || texto.includes('descontraíd')) return 'Descontraído';
  if (texto.includes('urgên') || texto.includes('action')) return 'Call-to-Action direto';

  return 'Informativo';
}

function consolidarInsights(links: SocialLinkAnalysis[]): string {
  const estilos = links.flatMap(l => l.estilo_visual_detectado);
  const tons = links.map(l => l.tom_narrativo);

  const estilosMaisComuns = [...new Set(estilos)].slice(0, 3).join(', ');
  const tomDominante = tons[0] || 'Variado';

  return `📊 Análise de ${links.length} referência(s):

🎨 Estilos visuais predominantes: ${estilosMaisComuns}
🗣️ Tom narrativo: ${tomDominante}

💡 Recomendação: Incorpore elementos visuais similares (${estilosMaisComuns}) e mantenha tom ${tomDominante.toLowerCase()} para ressoar com as referências fornecidas.`;
}

function gerarSugestoesTecnicas(links: SocialLinkAnalysis[]): any {
  const temTransicoesRapidas = links.some(l => 
    l.estilo_visual_detectado.some(e => e.includes('rápid'))
  );
  const temCoresVibrantes = links.some(l => 
    l.estilo_visual_detectado.some(e => e.includes('cor'))
  );

  return {
    enquadramentos: temTransicoesRapidas 
      ? ['Plano médio', 'Close-up', 'Plano geral'] 
      : ['Plano médio', 'Plano americano'],
    transicoes: temTransicoesRapidas 
      ? ['Cortes secos', 'Jump cuts', 'Wipes'] 
      : ['Fade', 'Dissolve'],
    elementos_visuais: temCoresVibrantes 
      ? ['Paleta saturada', 'Contraste alto', 'Gradações vibrantes'] 
      : ['Paleta natural', 'Iluminação suave'],
  };
}
