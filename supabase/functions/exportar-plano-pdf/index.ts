import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { planejamentoId, clienteId } = await req.json();

    console.log(`[exportar-plano-pdf] Planejamento ID: ${planejamentoId}`);

    // Buscar dados do planejamento
    const { data: planejamento, error: planejamentoError } = await supabaseClient
      .from('planejamentos')
      .select('*')
      .eq('id', planejamentoId)
      .single();

    if (planejamentoError) throw planejamentoError;

    // Buscar posts
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts_planejamento')
      .select('*')
      .eq('planejamento_id', planejamentoId)
      .order('data_postagem');

    if (postsError) throw postsError;

    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabaseClient
      .from('clientes')
      .select('nome_fantasia, razao_social')
      .eq('id', clienteId)
      .single();

    if (clienteError) throw clienteError;

    // Gerar HTML para o PDF
    const html = generatePDFHTML(planejamento, posts || [], cliente);

    // Aqui você poderia usar uma biblioteca como Puppeteer ou wkhtmltopdf
    // Por enquanto, retornamos o HTML que pode ser convertido no frontend
    return new Response(
      JSON.stringify({ 
        success: true, 
        html,
        planejamento,
        posts,
        cliente
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[exportar-plano-pdf] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generatePDFHTML(planejamento: any, posts: any[], cliente: any, supabaseClient: any) {
  // 1. Análise de distribuição de tipos de conteúdo
  const distribuicaoConteudo = posts.reduce((acc, post) => {
    const tipo = post.tipo_conteudo || 'não_definido';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Análise de formatos criativos
  const distribuicaoFormatos = posts.reduce((acc, post) => {
    const formato = post.formato_postagem || 'outro';
    acc[formato] = (acc[formato] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = posts.reduce((acc, post) => {
    const status = post.status_post || 'a_fazer';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Performance esperada (simulação baseada em tipo)
  const performanceEsperada: Record<string, any> = {
    informar: { alcance: 850, engajamento: 4.2 },
    inspirar: { alcance: 1200, engajamento: 6.8 },
    entreter: { alcance: 2100, engajamento: 9.5 },
    vender: { alcance: 680, engajamento: 3.1 },
    posicionar: { alcance: 950, engajamento: 5.3 }
  };

  // 4. Gerar recomendações estratégicas com IA
  let recomendacoesIA: string[] = [];

  if (LOVABLE_API_KEY) {
    try {
      const prompt = `Analise este plano editorial e forneça 5 recomendações estratégicas:

DISTRIBUIÇÃO DE CONTEÚDO:
${Object.entries(distribuicaoConteudo).map(([tipo, qtd]) => `- ${tipo}: ${qtd} posts`).join('\n')}

FORMATOS:
${Object.entries(distribuicaoFormatos).map(([formato, qtd]) => `- ${formato}: ${qtd} posts`).join('\n')}

Total de posts: ${posts.length}

Retorne 5 recomendações estratégicas práticas e acionáveis em formato JSON:
{
  "recomendacoes": [
    "Recomendação 1",
    "Recomendação 2",
    ...
  ]
}`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          response_format: { type: "json_object" }
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const resultado = JSON.parse(aiData.choices[0].message.content);
        recomendacoesIA = resultado.recomendacoes || [];
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações IA:', error);
    }
  }

  const emojis: Record<string, string> = {
    informar: '💡',
    inspirar: '✨',
    entreter: '🎭',
    vender: '💰',
    posicionar: '🎯'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório Editorial - ${cliente.nome_fantasia}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', sans-serif; 
      padding: 40px; 
      background: #f8fafc;
      color: #1e293b;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 60px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 50px; 
      border-bottom: 3px solid #006BFF; 
      padding-bottom: 30px; 
    }
    .header h1 { 
      color: #006BFF; 
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 18px;
      color: #64748b;
      font-weight: 500;
    }
    .header .cliente {
      font-size: 24px;
      color: #1e293b;
      font-weight: 600;
      margin-top: 10px;
    }
    
    .summary { 
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      padding: 30px; 
      border-radius: 12px; 
      margin-bottom: 40px;
      border-left: 4px solid #006BFF;
    }
    .summary h2 {
      color: #006BFF;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .summary-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 20px; 
    }
    .summary-item { 
      text-align: center;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .summary-item h3 { 
      font-size: 42px; 
      color: #006BFF; 
      font-weight: 700;
      margin-bottom: 8px;
    }
    .summary-item p { 
      color: #64748b; 
      font-size: 14px;
      font-weight: 500;
    }
    
    .distribuicao {
      margin: 40px 0;
    }
    .distribuicao h2 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .distribuicao-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .tipo-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    .tipo-card.informar { border-color: #3b82f6; }
    .tipo-card.inspirar { border-color: #a855f7; }
    .tipo-card.entreter { border-color: #eab308; }
    .tipo-card.vender { border-color: #22c55e; }
    .tipo-card.posicionar { border-color: #6366f1; }
    
    .tipo-emoji { font-size: 32px; margin-bottom: 8px; }
    .tipo-nome { 
      font-weight: 600; 
      font-size: 14px; 
      margin-bottom: 5px;
      text-transform: capitalize;
    }
    .tipo-qtd { 
      font-size: 28px; 
      font-weight: 700; 
      color: #006BFF;
    }
    .tipo-percent {
      font-size: 12px;
      color: #64748b;
    }
    
    .performance {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 25px;
      border-radius: 10px;
      margin: 30px 0;
    }
    .performance h3 {
      color: #92400e;
      font-size: 18px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .perf-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }
    .perf-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }
    .perf-value {
      font-size: 24px;
      font-weight: 700;
      color: #f59e0b;
    }
    
    table { 
      width: 100%; 
      border-collapse: separate;
      border-spacing: 0;
      margin: 30px 0;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    th { 
      background: linear-gradient(135deg, #006BFF 0%, #0052cc 100%);
      color: white; 
      padding: 15px; 
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td { 
      padding: 12px 15px; 
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    tr:nth-child(even) { 
      background: #f8fafc; 
    }
    tr:hover {
      background: #f1f5f9;
    }
    
    .recomendacoes {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-left: 4px solid #006BFF;
      padding: 30px;
      border-radius: 12px;
      margin: 40px 0;
    }
    .recomendacoes h2 {
      color: #006BFF;
      font-size: 22px;
      margin-bottom: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .recomendacoes ul {
      list-style: none;
    }
    .recomendacoes li {
      background: white;
      padding: 15px 20px;
      margin-bottom: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .recomendacoes li:before {
      content: "✨";
      margin-right: 10px;
    }
    
    .footer { 
      margin-top: 60px; 
      text-align: center; 
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
    }
    .footer p {
      color: #64748b; 
      font-size: 13px;
      margin-bottom: 8px;
    }
    .footer .logo {
      color: #006BFF;
      font-weight: 700;
      font-size: 18px;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Editorial Mensal</h1>
      <p class="cliente">${cliente.nome_fantasia}</p>
      <p class="subtitle">${planejamento.titulo} | ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
    </div>

    <div class="summary">
      <h2>Resumo Executivo</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <h3>${posts.length}</h3>
          <p>Total de Posts</p>
        </div>
        <div class="summary-item">
          <h3>${statusCounts.publicado || 0}</h3>
          <p>Publicados</p>
        </div>
        <div class="summary-item">
          <h3>${statusCounts.em_producao || 0}</h3>
          <p>Em Produção</p>
        </div>
        <div class="summary-item">
          <h3>${statusCounts.a_fazer || 0}</h3>
          <p>A Fazer</p>
        </div>
      </div>
    </div>

    <div class="distribuicao">
      <h2>Distribuição por Tipo de Conteúdo</h2>
      <div class="distribuicao-grid">
        ${Object.entries(distribuicaoConteudo).map(([tipo, qtd]) => {
          const percent = ((qtd as number / posts.length) * 100).toFixed(1);
          return `
            <div class="tipo-card ${tipo}">
              <div class="tipo-emoji">${emojis[tipo] || '📌'}</div>
              <div class="tipo-nome">${tipo}</div>
              <div class="tipo-qtd">${qtd}</div>
              <div class="tipo-percent">${percent}%</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="performance">
      <h3>📈 Performance Esperada (Médias Projetadas)</h3>
      <div class="performance-grid">
        <div class="perf-item">
          <div class="perf-label">Alcance Médio</div>
          <div class="perf-value">
            ${Math.round(Object.entries(distribuicaoConteudo).reduce((acc, [tipo, qtd]) => {
              const perf = performanceEsperada[tipo] || { alcance: 800 };
              return acc + (perf.alcance * (qtd as number));
            }, 0) / posts.length)}
          </div>
        </div>
        <div class="perf-item">
          <div class="perf-label">Engajamento Médio</div>
          <div class="perf-value">
            ${(Object.entries(distribuicaoConteudo).reduce((acc, [tipo, qtd]) => {
              const perf = performanceEsperada[tipo] || { engajamento: 4.5 };
              return acc + (perf.engajamento * (qtd as number));
            }, 0) / posts.length).toFixed(1)}%
          </div>
        </div>
        <div class="perf-item">
          <div class="perf-label">Total Impressões Estimadas</div>
          <div class="perf-value">
            ${((posts.length * 1200) / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>

    <h2 style="margin-top: 40px; color: #1e293b; font-size: 24px; font-weight: 600;">Conteúdo Detalhado</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Data</th>
          <th>Formato</th>
          <th>Tipo Conteúdo</th>
          <th>Texto Estruturado</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${posts.map((post, idx) => `
          <tr>
            <td><strong>${String(idx + 1).padStart(2, '0')}</strong></td>
            <td>${new Date(post.data_postagem).toLocaleDateString('pt-BR')}</td>
            <td>${post.formato_postagem}</td>
            <td style="text-transform: capitalize;">${post.tipo_conteudo || 'Não definido'}</td>
            <td style="font-size: 11px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${post.texto_estruturado?.substring(0, 60) || '-'}...
            </td>
            <td>
              <span style="padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; 
                ${post.status_post === 'publicado' ? 'background: #dcfce7; color: #166534;' : 
                  post.status_post === 'em_producao' ? 'background: #dbeafe; color: #1e40af;' : 
                  'background: #fef3c7; color: #92400e;'}">
                ${post.status_post || 'a_fazer'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    ${recomendacoesIA.length > 0 ? `
    <div class="recomendacoes">
      <h2>🎯 Recomendações Estratégicas (Gerado por IA)</h2>
      <ul>
        ${recomendacoesIA.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="footer">
      <p class="logo">© BEX - Agência de Marketing Digital</p>
      <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      <p>Relatório confidencial - Uso exclusivo de ${cliente.nome_fantasia}</p>
    </div>
  </div>
</body>
</html>
  `;
}
