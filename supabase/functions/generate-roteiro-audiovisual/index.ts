import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefingData {
  cliente_nome: string;
  titulo: string;
  objetivo: string;
  tom: string;
  veiculacao: string[];
  mensagem_chave: string;
  beneficios: string[];
  cta: string;
  ambiente: string;
}

interface SugestoesTecnicas {
  lente: string;
  filtro: string;
  hora: string;
  movimento: string;
  cor: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const briefingData = await req.json() as BriefingData;

    if (!briefingData || !briefingData.titulo) {
      throw new Error('Dados do briefing são obrigatórios');
    }

    // Gerar sugestões técnicas com base no ambiente
    const sugestoesTecnicas = getSugestoesAmbiente(briefingData.ambiente);

    // Gerar blocos do roteiro
    const blocos = gerarBlocos(briefingData, sugestoesTecnicas);

    const roteiro = {
      identificacao: {
        cliente: briefingData.cliente_nome,
        peca: briefingData.titulo,
        duracao: '30s',
        veiculacao: briefingData.veiculacao,
        data: new Date().toLocaleDateString('pt-BR'),
      },
      objetivo: briefingData.objetivo,
      tom: briefingData.tom,
      blocos: blocos,
      referencias_tecnicas: sugestoesTecnicas,
      observacoes_finais: {
        mensagem_chave: briefingData.mensagem_chave,
        cta: briefingData.cta || 'Saiba mais!',
      },
    };

    // Gerar Markdown do roteiro
    const roteiroMarkdown = gerarMarkdown(roteiro);

    return new Response(
      JSON.stringify({ 
        success: true, 
        roteiro: roteiroMarkdown,
        roteiro_struct: roteiro 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro ao gerar roteiro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getSugestoesAmbiente(ambiente: string): SugestoesTecnicas {
  const sugestoes: Record<string, SugestoesTecnicas> = {
    praia: {
      lente: '24mm f/2.8',
      filtro: 'Polarizador circular',
      hora: 'Golden hour (1h antes do pôr do sol)',
      movimento: 'Panorâmico suave com gimbal',
      cor: 'Tons quentes saturados, realçar azul do mar',
    },
    floresta: {
      lente: '35mm f/1.8',
      filtro: 'ND variável (2-5 stops)',
      hora: 'Luz difusa (nublado ou sombreado)',
      movimento: 'Travelling suave entre árvores',
      cor: 'Textura orgânica, verdes naturais',
    },
    cidade: {
      lente: '35mm f/1.4',
      filtro: 'Neutro ou UV',
      hora: 'Luz mista (dia ou blue hour)',
      movimento: 'Handheld dinâmico ou gimbal urbano',
      cor: 'Ritmo dinâmico, contrastes urbanos',
    },
    escritorio: {
      lente: '50mm f/1.4',
      filtro: 'LED 5600K difuso (softbox)',
      hora: 'Qualquer (iluminação controlada)',
      movimento: 'Plano médio fixo ou slider sutil',
      cor: 'Profissional, iluminação suave',
    },
    noturno: {
      lente: '24-35mm f/1.4',
      filtro: 'LED RGB para acentos coloridos',
      hora: 'Noite (após crepúsculo)',
      movimento: 'Tripé ou gimbal estabilizado (ISO alto)',
      cor: 'Contraste forte, neons, bokeh urbano',
    },
    evento: {
      lente: '24-70mm f/2.8 (zoom versátil)',
      filtro: 'Mix de luz ambiente + LED portátil',
      hora: 'Variável (adaptar)',
      movimento: 'Handheld rápido + momentos fixos',
      cor: 'Energia, cores vibrantes',
    },
  };

  return sugestoes[ambiente] || sugestoes.cidade;
}

function gerarBlocos(briefingData: BriefingData, sugestoes: SugestoesTecnicas) {
  return [
    {
      bloco: 1,
      tipo: 'IMAGEM',
      tempo: '0-3s',
      descricao: `Abertura com ${briefingData.ambiente}`,
      tecnica: sugestoes.lente,
      observacao: `Usar ${sugestoes.filtro}`,
    },
    {
      bloco: 2,
      tipo: 'OFF',
      tempo: '3-10s',
      texto: briefingData.mensagem_chave,
      tecnica: 'Locução em estúdio com reverb suave',
      observacao: 'Sincronia com imagens do ambiente',
    },
    {
      bloco: 3,
      tipo: 'ON',
      tempo: '10-20s',
      texto: briefingData.beneficios[0] || 'Benefício principal',
      tecnica: 'Plano médio do cliente/produto',
      observacao: 'Áudio direto + ambiente natural',
    },
    {
      bloco: 4,
      tipo: 'MONTAGEM',
      tempo: '20-27s',
      descricao: 'Sequência rápida de benefícios visuais',
      tecnica: sugestoes.movimento,
      observacao: `Cores: ${sugestoes.cor}`,
    },
    {
      bloco: 5,
      tipo: 'CTA',
      tempo: '27-30s',
      texto: briefingData.cta || 'Saiba mais!',
      tecnica: 'Plano fechado logo/produto',
      observacao: 'Fade out com branding',
    },
  ];
}

function gerarMarkdown(roteiro: any): string {
  let md = `# ${roteiro.identificacao.peca}\n\n`;
  md += `**Cliente:** ${roteiro.identificacao.cliente}\n`;
  md += `**Duração:** ${roteiro.identificacao.duracao}\n`;
  md += `**Veiculação:** ${roteiro.identificacao.veiculacao.join(', ')}\n`;
  md += `**Data:** ${roteiro.identificacao.data}\n\n`;
  md += `---\n\n`;
  md += `## 🎯 Objetivo\n${roteiro.objetivo}\n\n`;
  md += `## 🎭 Tom\n${roteiro.tom}\n\n`;
  md += `---\n\n`;
  md += `## 📝 Roteiro\n\n`;
  
  roteiro.blocos.forEach((bloco: any) => {
    md += `### Bloco ${bloco.bloco} - ${bloco.tipo} (${bloco.tempo})\n`;
    if (bloco.descricao) md += `**Descrição:** ${bloco.descricao}\n`;
    if (bloco.texto) md += `**Texto:** "${bloco.texto}"\n`;
    md += `**Técnica:** ${bloco.tecnica}\n`;
    md += `**Observação:** ${bloco.observacao}\n\n`;
  });
  
  md += `---\n\n`;
  md += `## 🎬 Referências Técnicas\n\n`;
  md += `- **Lente:** ${roteiro.referencias_tecnicas.lente}\n`;
  md += `- **Filtro:** ${roteiro.referencias_tecnicas.filtro}\n`;
  md += `- **Horário:** ${roteiro.referencias_tecnicas.hora}\n`;
  md += `- **Movimento:** ${roteiro.referencias_tecnicas.movimento}\n`;
  md += `- **Cor:** ${roteiro.referencias_tecnicas.cor}\n\n`;
  
  md += `---\n\n`;
  md += `## 📌 Observações Finais\n\n`;
  md += `**Mensagem-chave:** ${roteiro.observacoes_finais.mensagem_chave}\n\n`;
  md += `**CTA:** ${roteiro.observacoes_finais.cta}\n`;
  
  return md;
}
