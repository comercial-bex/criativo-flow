import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CnpjData {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  data_situacao?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  };
  cnae_principal?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { cnpj } = await req.json();
    
    if (!cnpj) {
      return new Response(
        JSON.stringify({ error: 'CNPJ é obrigatório' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Remove formatação do CNPJ
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      return new Response(
        JSON.stringify({ error: 'CNPJ deve ter 14 dígitos' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Iniciando consulta CNPJ: ${cleanCnpj}`);

    // Consulta BrasilAPI e ReceitaWS em paralelo
    const [brasilApiResponse, receitaWsResponse] = await Promise.allSettled([
      fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`),
      fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`)
    ]);

    let brasilApiData = null;
    let receitaWsData = null;

    // Processar resposta da BrasilAPI
    if (brasilApiResponse.status === 'fulfilled' && brasilApiResponse.value.ok) {
      try {
        brasilApiData = await brasilApiResponse.value.json();
        console.log('BrasilAPI: Dados obtidos com sucesso');
      } catch (error) {
        console.log('BrasilAPI: Erro ao processar JSON', error);
      }
    } else {
      console.log('BrasilAPI: Erro na requisição');
    }

    // Processar resposta da ReceitaWS
    if (receitaWsResponse.status === 'fulfilled' && receitaWsResponse.value.ok) {
      try {
        receitaWsData = await receitaWsResponse.value.json();
        console.log('ReceitaWS: Dados obtidos com sucesso');
      } catch (error) {
        console.log('ReceitaWS: Erro ao processar JSON', error);
      }
    } else {
      console.log('ReceitaWS: Erro na requisição');
    }

    // Se nenhuma API retornou dados
    if (!brasilApiData && !receitaWsData) {
      return new Response(
        JSON.stringify({ 
          error: 'Não foi possível validar o CNPJ. Tente novamente mais tarde.' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Determinar qual fonte usar (priorizar a mais recente)
    let fonteUtilizada = 'hibrida';
    let dadosFinais: CnpjData = { cnpj: cleanCnpj };

    if (brasilApiData && receitaWsData) {
      // Comparar datas de situação para escolher o mais recente
      const dataBrasil = new Date(brasilApiData.data_situacao_cadastral || '1900-01-01');
      const dataReceita = new Date(receitaWsData.data_situacao || '1900-01-01');
      
      if (dataBrasil >= dataReceita) {
        dadosFinais = processarBrasilApi(brasilApiData);
        fonteUtilizada = 'brasilapi';
      } else {
        dadosFinais = processarReceitaWs(receitaWsData);
        fonteUtilizada = 'receitaws';
      }
    } else if (brasilApiData) {
      dadosFinais = processarBrasilApi(brasilApiData);
      fonteUtilizada = 'brasilapi';
    } else if (receitaWsData) {
      dadosFinais = processarReceitaWs(receitaWsData);
      fonteUtilizada = 'receitaws';
    }

    // Salvar consulta no banco
    const { error: insertError } = await supabaseClient
      .from('cnpj_consultas')
      .insert({
        cnpj: cleanCnpj,
        dados_brasil_api: brasilApiData,
        dados_receita_ws: receitaWsData,
        fonte_utilizada: fonteUtilizada,
        situacao_cadastral: dadosFinais.situacao_cadastral,
        data_situacao: dadosFinais.data_situacao ? new Date(dadosFinais.data_situacao).toISOString().split('T')[0] : null
      });

    if (insertError) {
      console.error('Erro ao salvar consulta CNPJ:', insertError);
    } else {
      console.log('Consulta CNPJ salva com sucesso');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: dadosFinais,
        fonte: fonteUtilizada 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    console.error('Stack trace:', (error as Error)?.stack || 'No stack trace');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        details: (error as Error)?.message || 'Erro desconhecido'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function processarBrasilApi(data: any): CnpjData {
  return {
    cnpj: data.cnpj,
    razao_social: data.razao_social || data.nome_empresarial,
    nome_fantasia: data.nome_fantasia,
    situacao_cadastral: data.descricao_situacao_cadastral || data.situacao_cadastral,
    data_situacao: data.data_situacao_cadastral,
    endereco: {
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep
    },
    cnae_principal: data.cnae_fiscal_descricao || data.atividade_principal?.[0]?.text
  };
}

function processarReceitaWs(data: any): CnpjData {
  return {
    cnpj: data.cnpj,
    razao_social: data.nome,
    nome_fantasia: data.fantasia,
    situacao_cadastral: data.situacao,
    data_situacao: data.data_situacao,
    endereco: {
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep
    },
    cnae_principal: data.atividade_principal?.[0]?.text
  };
}