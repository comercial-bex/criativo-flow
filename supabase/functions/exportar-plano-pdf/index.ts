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

function generatePDFHTML(planejamento: any, posts: any[], cliente: any) {
  const statusCounts = posts.reduce((acc, post) => {
    const status = post.status_post || 'a_fazer';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Plano Editorial - ${cliente.nome_fantasia}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #006BFF; padding-bottom: 20px; }
    .header h1 { color: #006BFF; margin: 0; }
    .header p { color: #666; }
    .summary { background: #f4f6f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .summary-item { text-align: center; }
    .summary-item h3 { margin: 0; font-size: 32px; color: #006BFF; }
    .summary-item p { margin: 5px 0 0; color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #006BFF; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Plano Editorial</h1>
    <p><strong>${cliente.nome_fantasia}</strong></p>
    <p>${planejamento.titulo}</p>
  </div>

  <div class="summary">
    <h2>Resumo Executivo</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <h3>${posts.length}</h3>
        <p>Total de Posts</p>
      </div>
      <div class="summary-item">
        <h3>${statusCounts.a_fazer || 0}</h3>
        <p>A Fazer</p>
      </div>
      <div class="summary-item">
        <h3>${statusCounts.em_producao || 0}</h3>
        <p>Em Produção</p>
      </div>
      <div class="summary-item">
        <h3>${statusCounts.publicado || 0}</h3>
        <p>Publicados</p>
      </div>
    </div>
  </div>

  <h2>Conteúdo Detalhado</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Data</th>
        <th>Formato</th>
        <th>Objetivo</th>
        <th>Título</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${posts.map((post, idx) => `
        <tr>
          <td>${String(idx + 1).padStart(2, '0')}</td>
          <td>${new Date(post.data_postagem).toLocaleDateString('pt-BR')}</td>
          <td>${post.formato_postagem}</td>
          <td>${post.objetivo_postagem}</td>
          <td>${post.titulo || 'Sem título'}</td>
          <td>${post.status_post || 'a_fazer'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    <p>© BEX - Sistema de Gestão Editorial</p>
  </div>
</body>
</html>
  `;
}
