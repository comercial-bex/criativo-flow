/**
 * Email Templates - Sistema de templates para envio de emails profissionais
 * Suporta orçamentos, contratos e propostas com branding da empresa
 */

export const generateOrcamentoEmailHTML = (params: {
  orcamento: any;
  itens: any[];
  mensagem: string;
  empresaData?: any;
}): string => {
  const { orcamento, itens, mensagem, empresaData } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Orçamento #${orcamento?.numero || ''}</h2>
    </div>
    <div class="content">
      <p>${mensagem?.replace(/\n/g, '<br>')}</p>
      <p><strong>Cliente:</strong> ${orcamento?.clientes?.nome || ''}</p>
      <p><strong>Validade:</strong> ${orcamento?.validade ? new Date(orcamento.validade).toLocaleDateString('pt-BR') : ''}</p>
    </div>
    <div class="footer">
      <p>${empresaData?.nome || 'BEX Communication'}</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateContratoEmailHTML = (params: {
  contrato: any;
  mensagem: string;
  empresaData?: any;
}): string => {
  const { contrato, mensagem, empresaData } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Contrato - ${contrato?.titulo || ''}</h2>
    </div>
    <div class="content">
      <p>${mensagem?.replace(/\n/g, '<br>')}</p>
      <p><strong>Cliente:</strong> ${contrato?.clientes?.nome || ''}</p>
    </div>
    <div class="footer">
      <p>${empresaData?.nome || 'BEX Communication'}</p>
    </div>
  </div>
</body>
</html>
  `;
};
interface EmpresaConfig {
  nome?: string;
  logo_url?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  website?: string;
}

interface EmailTemplateData {
  destinatario: string;
  assunto: string;
  mensagem: string;
  empresa?: EmpresaConfig;
  dados: any;
}

/**
 * Sanitiza dados antes de inserir no HTML
 */
function sanitize(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formata valor monetário
 */
function formatMoney(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data
 */
function formatDate(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Template base HTML
 */
function getBaseTemplate(conteudo: string, empresa?: EmpresaConfig): string {
  const corPrimaria = empresa?.cor_primaria || '#6366f1';
  const corSecundaria = empresa?.cor_secundaria || '#4f46e5';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${corPrimaria}, ${corSecundaria});
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    .header img {
      max-width: 150px;
      height: auto;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: ${corPrimaria};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    .highlight {
      background: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin: 15px 0;
    }
    .info-box {
      background: #f0f9ff;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${empresa?.logo_url ? `<img src="${empresa.logo_url}" alt="${sanitize(empresa.nome || '')}" />` : ''}
      <h1>${sanitize(empresa?.nome || 'Empresa')}</h1>
    </div>
    <div class="content">
      ${conteudo}
    </div>
    <div class="footer">
      ${empresa?.nome ? `<p><strong>${sanitize(empresa.nome)}</strong></p>` : ''}
      ${empresa?.endereco ? `<p>${sanitize(empresa.endereco)}</p>` : ''}
      ${empresa?.telefone ? `<p>Tel: ${sanitize(empresa.telefone)}</p>` : ''}
      ${empresa?.email ? `<p>Email: ${sanitize(empresa.email)}</p>` : ''}
      ${empresa?.website ? `<p><a href="${sanitize(empresa.website)}" style="color: ${corPrimaria};">${sanitize(empresa.website)}</a></p>` : ''}
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Este é um email automático, por favor não responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template para Orçamento
 */
export function gerarTemplateOrcamento(data: EmailTemplateData): string {
  const { mensagem, empresa, dados: orcamento } = data;
  
  const itensHtml = orcamento.itens?.map((item: any) => `
    <tr>
      <td>${sanitize(item.descricao || item.produto_nome || '')}</td>
      <td style="text-align: center;">${item.quantidade || 1}</td>
      <td style="text-align: right;">${formatMoney(item.valor_unitario || 0)}</td>
      <td style="text-align: right; font-weight: 600;">${formatMoney((item.quantidade || 1) * (item.valor_unitario || 0))}</td>
    </tr>
  `).join('') || '';
  
  const conteudo = `
    <h2 style="color: #111; margin-bottom: 20px;">Orçamento #${sanitize(orcamento.numero || '')}</h2>
    
    <p style="white-space: pre-line; margin-bottom: 20px;">${sanitize(mensagem)}</p>
    
    <div class="info-box">
      <p><strong>Cliente:</strong> ${sanitize(orcamento.clientes?.nome || '')}</p>
      <p><strong>Data de Emissão:</strong> ${formatDate(orcamento.created_at)}</p>
      <p><strong>Validade:</strong> ${orcamento.validade_dias ? `${orcamento.validade_dias} dias` : 'Conforme proposta'}</p>
    </div>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px;">Itens do Orçamento</h3>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align: center;">Qtd</th>
          <th style="text-align: right;">Valor Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itensHtml}
      </tbody>
      <tfoot>
        <tr style="background: #f9fafb;">
          <td colspan="3" style="text-align: right; font-weight: 600;">TOTAL:</td>
          <td style="text-align: right; font-weight: 700; font-size: 18px; color: #059669;">
            ${formatMoney(orcamento.valor_total || 0)}
          </td>
        </tr>
      </tfoot>
    </table>
    
    ${orcamento.observacoes ? `
      <div class="highlight">
        <strong>Observações:</strong><br>
        ${sanitize(orcamento.observacoes)}
      </div>
    ` : ''}
    
    ${orcamento.pix_chave ? `
      <div class="info-box">
        <p><strong>💰 Pagamento via PIX</strong></p>
        <p><strong>Chave:</strong> ${sanitize(orcamento.pix_chave)}</p>
        ${orcamento.pix_tipo ? `<p><strong>Tipo:</strong> ${sanitize(orcamento.pix_tipo)}</p>` : ''}
      </div>
    ` : ''}
    
    <p style="margin-top: 30px;">
      Ficamos à disposição para quaisquer esclarecimentos.
    </p>
  `;
  
  return getBaseTemplate(conteudo, empresa);
}

/**
 * Template para Contrato
 */
export function gerarTemplateContrato(data: EmailTemplateData): string {
  const { mensagem, empresa, dados: contrato } = data;
  
  const conteudo = `
    <h2 style="color: #111; margin-bottom: 20px;">Contrato - ${sanitize(contrato.titulo || '')}</h2>
    
    <p style="white-space: pre-line; margin-bottom: 20px;">${sanitize(mensagem)}</p>
    
    <div class="info-box">
      <p><strong>Cliente:</strong> ${sanitize(contrato.clientes?.nome || '')}</p>
      <p><strong>Objeto do Contrato:</strong> ${sanitize(contrato.objeto_contrato || '')}</p>
      <p><strong>Data de Início:</strong> ${formatDate(contrato.data_inicio)}</p>
      <p><strong>Data de Término:</strong> ${formatDate(contrato.data_fim)}</p>
      ${contrato.valor_contrato ? `<p><strong>Valor:</strong> ${formatMoney(contrato.valor_contrato)}</p>` : ''}
    </div>
    
    ${contrato.condicoes_pagamento ? `
      <h3 style="margin-top: 30px; margin-bottom: 15px;">Condições de Pagamento</h3>
      <div class="highlight">
        ${sanitize(contrato.condicoes_pagamento)}
      </div>
    ` : ''}
    
    ${contrato.observacoes ? `
      <h3 style="margin-top: 30px; margin-bottom: 15px;">Observações</h3>
      <p style="white-space: pre-line;">${sanitize(contrato.observacoes)}</p>
    ` : ''}
    
    <div class="highlight" style="margin-top: 30px;">
      <p><strong>⚠️ Atenção:</strong></p>
      <p>Este contrato está em anexo no formato PDF. Por favor, revise todos os termos e condições antes de assinar.</p>
    </div>
    
    <p style="margin-top: 30px;">
      Estamos à disposição para quaisquer dúvidas.
    </p>
  `;
  
  return getBaseTemplate(conteudo, empresa);
}

/**
 * Template para Proposta Comercial
 */
export function gerarTemplateProposta(data: EmailTemplateData): string {
  const { mensagem, empresa, dados: proposta } = data;
  
  const servicosHtml = proposta.itens?.map((item: any) => `
    <tr>
      <td>${sanitize(item.descricao || item.produto_nome || '')}</td>
      <td style="text-align: center;">${item.quantidade || 1}</td>
      <td style="text-align: right;">${formatMoney(item.valor_unitario || 0)}</td>
      <td style="text-align: right; font-weight: 600;">${formatMoney((item.quantidade || 1) * (item.valor_unitario || 0))}</td>
    </tr>
  `).join('') || '';
  
  const conteudo = `
    <h2 style="color: #111; margin-bottom: 20px;">${sanitize(proposta.titulo || 'Proposta Comercial')}</h2>
    
    <p style="white-space: pre-line; margin-bottom: 20px;">${sanitize(mensagem)}</p>
    
    <div class="info-box">
      <p><strong>Cliente:</strong> ${sanitize(proposta.clientes?.nome || proposta.contato_nome || '')}</p>
      <p><strong>Data:</strong> ${formatDate(proposta.created_at)}</p>
      ${proposta.validade_dias ? `<p><strong>Validade:</strong> ${proposta.validade_dias} dias</p>` : ''}
    </div>
    
    ${proposta.descricao ? `
      <h3 style="margin-top: 30px; margin-bottom: 15px;">Descrição do Projeto</h3>
      <p style="white-space: pre-line;">${sanitize(proposta.descricao)}</p>
    ` : ''}
    
    <h3 style="margin-top: 30px; margin-bottom: 15px;">Serviços/Produtos</h3>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align: center;">Qtd</th>
          <th style="text-align: right;">Valor Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${servicosHtml}
      </tbody>
      <tfoot>
        ${proposta.desconto > 0 ? `
          <tr>
            <td colspan="3" style="text-align: right;">Subtotal:</td>
            <td style="text-align: right;">${formatMoney(proposta.valor_total + proposta.desconto)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; color: #059669;">Desconto:</td>
            <td style="text-align: right; color: #059669;">- ${formatMoney(proposta.desconto)}</td>
          </tr>
        ` : ''}
        <tr style="background: #f9fafb;">
          <td colspan="3" style="text-align: right; font-weight: 600;">TOTAL:</td>
          <td style="text-align: right; font-weight: 700; font-size: 18px; color: #059669;">
            ${formatMoney(proposta.valor_total || 0)}
          </td>
        </tr>
      </tfoot>
    </table>
    
    ${proposta.condicoes_pagamento ? `
      <h3 style="margin-top: 30px; margin-bottom: 15px;">Condições de Pagamento</h3>
      <div class="highlight">
        ${sanitize(proposta.condicoes_pagamento)}
      </div>
    ` : ''}
    
    ${proposta.observacoes ? `
      <h3 style="margin-top: 30px; margin-bottom: 15px;">Observações</h3>
      <p style="white-space: pre-line;">${sanitize(proposta.observacoes)}</p>
    ` : ''}
    
    <p style="margin-top: 30px;">
      Aguardamos seu retorno e ficamos à disposição para esclarecimentos.
    </p>
  `;
  
  return getBaseTemplate(conteudo, empresa);
}

/**
 * Gera template de acordo com o tipo
 */
export function gerarEmailTemplate(tipo: 'orcamento' | 'contrato' | 'proposta', data: EmailTemplateData): string {
  switch (tipo) {
    case 'orcamento':
      return gerarTemplateOrcamento(data);
    case 'contrato':
      return gerarTemplateContrato(data);
    case 'proposta':
      return gerarTemplateProposta(data);
    default:
      return '';
  }
}
