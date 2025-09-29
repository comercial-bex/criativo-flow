import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CnpjData {
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

export interface CnpjLookupResult {
  success: boolean;
  data?: CnpjData;
  fonte?: string;
  error?: string;
}

export function useCnpjLookup() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCnpj = (cnpj: string): boolean => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      return false;
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cleanCnpj[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let resto = soma % 11;
    let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
    
    if (parseInt(cleanCnpj[12]) !== digitoVerificador1) {
      return false;
    }
    
    // Segundo dígito verificador
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cleanCnpj[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    resto = soma % 11;
    let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
    
    return parseInt(cleanCnpj[13]) === digitoVerificador2;
  };

  const formatCnpj = (cnpj: string): string => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const lookupCnpj = useCallback(async (cnpj: string): Promise<CnpjLookupResult> => {
    setLoading(true);
    
    try {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      
      // Validar formato do CNPJ
      if (!validateCnpj(cleanCnpj)) {
        toast({
          title: "CNPJ Inválido",
          description: "O CNPJ informado não é válido.",
          variant: "destructive",
        });
        return { success: false, error: 'CNPJ inválido' };
      }

      // Verificar cache (consultas das últimas 24 horas)
      const { data: cacheData, error: cacheError } = await supabase
        .from('cnpj_consultas')
        .select('*')
        .eq('cnpj', cleanCnpj)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!cacheError && cacheData && cacheData.length > 0) {
        const cached = cacheData[0];
        const brasilApi = cached.dados_brasil_api as any;
        const receitaWs = cached.dados_receita_ws as any;
        
        const dadosCache: CnpjData = {
          cnpj: cached.cnpj,
          razao_social: brasilApi?.razao_social || receitaWs?.nome,
          nome_fantasia: brasilApi?.nome_fantasia || receitaWs?.fantasia,
          situacao_cadastral: cached.situacao_cadastral,
          data_situacao: cached.data_situacao,
          endereco: brasilApi?.endereco || {
            logradouro: receitaWs?.logradouro,
            numero: receitaWs?.numero,
            complemento: receitaWs?.complemento,
            bairro: receitaWs?.bairro,
            municipio: receitaWs?.municipio,
            uf: receitaWs?.uf,
            cep: receitaWs?.cep
          },
          cnae_principal: brasilApi?.cnae_fiscal_descricao || receitaWs?.atividade_principal?.[0]?.text
        };

        toast({
          title: "CNPJ Encontrado (Cache)",
          description: `Empresa: ${dadosCache.razao_social || 'Nome não disponível'}`,
        });

        return {
          success: true,
          data: dadosCache,
          fonte: cached.fonte_utilizada + ' (cache)'
        };
      }

      // Consultar via edge function
      const { data, error } = await supabase.functions.invoke('cnpj-lookup', {
        body: { cnpj: cleanCnpj }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        toast({
          title: "Erro na Consulta",
          description: "Erro interno. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return { success: false, error: 'Erro interno' };
      }

      if (!data.success) {
        toast({
          title: "CNPJ Não Encontrado",
          description: data.error || "Não foi possível validar o CNPJ.",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }

      toast({
        title: "CNPJ Encontrado",
        description: `Empresa: ${data.data.razao_social || 'Nome não disponível'}`,
      });

      return {
        success: true,
        data: data.data,
        fonte: data.fonte
      };

    } catch (error) {
      console.error('Erro inesperado na consulta CNPJ:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro ao consultar CNPJ. Tente novamente.",
        variant: "destructive",
      });
      return { success: false, error: 'Erro inesperado' };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    lookupCnpj,
    validateCnpj,
    formatCnpj
  };
}