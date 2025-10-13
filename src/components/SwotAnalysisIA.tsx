import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Users, Award, Zap, BarChart3, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SwotAnalysisIAProps {
  clienteId: string;
  clienteNome: string;
  onSwotDataUpdate?: (swotData: {
    forcas: string;
    fraquezas: string;
    oportunidades: string;
    ameacas: string;
  }) => void;
  initialForcas?: string;
  initialFraquezas?: string;
  initialOportunidades?: string;
  initialAmeacas?: string;
}

export function SwotAnalysisIA({ 
  clienteId, 
  clienteNome, 
  onSwotDataUpdate,
  initialForcas,
  initialFraquezas,
  initialOportunidades,
  initialAmeacas
}: SwotAnalysisIAProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeSwot = async () => {
    setLoading(true);
    
    // ✅ FASE 1: Toast informativo
    toast({
      title: "🧠 Iniciando análise IA",
      description: "Analisando dados de onboarding... Isso pode levar até 30 segundos.",
    });
    
    console.log('🔍 [SWOT] Iniciando análise para cliente:', clienteId);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-swot', {
        body: { clienteId }
      });

      console.log('📊 [SWOT] Resposta recebida:', { success: data?.success, hasAnalysis: !!data?.analysis });

      if (error) {
        console.error('❌ [SWOT] Erro na edge function:', error);
        throw error;
      }

      if (data.success) {
        setAnalysis(data.analysis);
        
        // Extrair dados SWOT e salvar no banco
        const swotData = extractSwotData(data.analysis);
        const objetivosGerados = generateClientObjectives(swotData);

        // Salvar no banco de dados
        await salvarAnaliseSwot(swotData, data.analysis, objetivosGerados);
        
        // Passar dados para o componente pai
        if (onSwotDataUpdate) {
          onSwotDataUpdate({
            forcas: swotData.forcas.join('\n'),
            fraquezas: swotData.fraquezas.join('\n'),
            oportunidades: swotData.oportunidades.join('\n'),
            ameacas: swotData.ameacas.join('\n')
          });
        }
        
        toast({
          title: "Análise SWOT concluída",
          description: "A IA analisou os dados de onboarding e gerou insights estratégicos.",
        });
      } else {
        throw new Error(data.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('❌ [SWOT] Erro completo:', error);
      toast({
        title: "Erro na análise SWOT",
        description: error instanceof Error 
          ? `Detalhes: ${error.message}` 
          : 'Erro desconhecido. Verifique se os dados de onboarding estão preenchidos.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarAnaliseSwot = async (swotData: any, analiseTexto: string, objetivos: any) => {
    try {
      const dadosParaSalvar = {
        cliente_id: clienteId,
        analise_swot: swotData,
        analise_estrategica: analiseTexto,
        objetivos: {
          objetivos_gerados: objetivos,
          data_geracao: new Date().toISOString(),
          versao: 'nova_analise'
        }
      };

      console.log('Tentando salvar análise SWOT:', dadosParaSalvar);

      // Primeiro, tentar buscar registro existente sem usar .single() que pode gerar erro
      const { data: existingData, error: searchError } = await supabase
        .from('cliente_objetivos')
        .select('id')
        .eq('cliente_id', clienteId)
        .limit(1);

      if (searchError) {
        console.error('Erro ao buscar registro existente:', searchError);
      }

      let result;
      if (existingData && existingData.length > 0) {
        // Atualizar registro existente
        console.log('Atualizando registro existente:', existingData[0].id);
        result = await supabase
          .from('cliente_objetivos')
          .update(dadosParaSalvar)
          .eq('cliente_id', clienteId)
          .select();
      } else {
        // Inserir novo registro
        console.log('Inserindo novo registro para cliente:', clienteId);
        result = await supabase
          .from('cliente_objetivos')
          .insert(dadosParaSalvar)
          .select();
      }

      if (result.error) {
        console.error('Erro no Supabase:', result.error);
        throw result.error;
      }

      console.log('Análise SWOT salva com sucesso:', result.data);
      
      toast({
        title: "✅ Análise salva com sucesso",
        description: "A nova análise SWOT foi salva no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao salvar análise SWOT:', error);
      toast({
        title: "❌ Erro ao salvar análise",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const formatAnalysis = (text: string) => {
    // Divide o texto em seções de forma mais limpa
    const sections = text.split('\n').filter(line => line.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Detecta títulos principais (FORÇAS, OPORTUNIDADES, etc.)
      const isMainTitle = /^(FORÇAS|OPORTUNIDADES|FRAQUEZAS|AMEAÇAS|RECOMENDAÇÕES)$/i.test(trimmedSection);
      
      if (isMainTitle) {
        return (
          <h3 key={index} className="font-bold text-xl text-primary mt-6 mb-3 uppercase">
            {trimmedSection}
          </h3>
        );
      }
      
      // Detecta subtítulos
      const isSubTitle = /^[A-Z][^.!?]*:?\s*$/.test(trimmedSection) && trimmedSection.length < 80;
      
      if (isSubTitle && !trimmedSection.includes('.')) {
        return (
          <h4 key={index} className="font-semibold text-lg text-secondary-foreground mt-4 mb-2">
            {trimmedSection}
          </h4>
        );
      }
      
      // Texto normal em parágrafos
      return (
        <p key={index} className="mb-3 text-muted-foreground leading-relaxed text-justify">
          {trimmedSection}
        </p>
      );
    });
  };

  // Função para extrair dados SWOT da análise mais limpa
  const extractSwotData = (analysisText: string) => {
    const swotData = {
      forcas: [],
      oportunidades: [],
      fraquezas: [],
      ameacas: []
    };

    if (!analysisText) return swotData;

    const sections = analysisText.split('\n');
    let currentSection = '';

    sections.forEach(line => {
      const trimmedLine = line.trim();
      const lowerLine = trimmedLine.toLowerCase();
      
      // Detectar seções principais
      if (lowerLine === 'forças' || lowerLine.includes('forças')) {
        currentSection = 'forcas';
      } else if (lowerLine === 'oportunidades' || lowerLine.includes('oportunidades')) {
        currentSection = 'oportunidades';
      } else if (lowerLine === 'fraquezas' || lowerLine.includes('fraquezas')) {
        currentSection = 'fraquezas';
      } else if (lowerLine === 'ameaças' || lowerLine.includes('ameaças')) {
        currentSection = 'ameacas';
      } else if (lowerLine.includes('recomendações') || lowerLine.includes('estratégicas')) {
        currentSection = ''; // Parar de capturar
      } else if (trimmedLine && currentSection && swotData[currentSection] !== undefined) {
        // Capturar o conteúdo limpo, removendo marcadores se houver
        const cleanItem = trimmedLine
          .replace(/^[-•*]\s*/, '') // Remove marcadores de lista
          .replace(/^\d+\.\s*/, '') // Remove numeração
          .trim();
        
        if (cleanItem && cleanItem.length > 10) { // Apenas itens com conteúdo substancial
          swotData[currentSection].push(cleanItem);
        }
      }
    });

    return swotData;
  };

  // Função para extrair e gerar objetivos baseados na análise SWOT
  const generateClientObjectives = (swotData: any) => {
    const objectives = {
      crescimento_digital: [] as string[],
      fortalecimento_marca: [] as string[],
      aquisicao_leads: [] as string[],
      otimizacao_vendas: [] as string[]
    };

    // Usar dados SWOT para gerar objetivos
    const strengths = swotData.forcas || [];
    const opportunities = swotData.oportunidades || [];
    const strategies = [...strengths, ...opportunities];

    // Gerar objetivos baseados nas estratégias e insights
    strategies.forEach(strategy => {
      const lowerStrategy = strategy.toLowerCase();
      
      if (lowerStrategy.includes('seguidor') || lowerStrategy.includes('engajamento') || lowerStrategy.includes('redes sociais') || lowerStrategy.includes('conteúdo')) {
        objectives.crescimento_digital.push(`Aumentar seguidores: ${strategy}`);
      }
      
      if (lowerStrategy.includes('marca') || lowerStrategy.includes('posicionamento') || lowerStrategy.includes('diferenciação')) {
        objectives.fortalecimento_marca.push(`Fortalecer marca: ${strategy}`);
      }
      
      if (lowerStrategy.includes('lead') || lowerStrategy.includes('aquisição') || lowerStrategy.includes('conversão') || lowerStrategy.includes('captar')) {
        objectives.aquisicao_leads.push(`Gerar leads: ${strategy}`);
      }
      
      if (lowerStrategy.includes('venda') || lowerStrategy.includes('vendas') || lowerStrategy.includes('receita') || lowerStrategy.includes('ticket')) {
        objectives.otimizacao_vendas.push(`Otimizar vendas: ${strategy}`);
      }
    });

    // Adicionar objetivos baseados em oportunidades
    opportunities.forEach(opportunity => {
      const lowerOpp = opportunity.toLowerCase();
      
      if (lowerOpp.includes('nicho') || lowerOpp.includes('público') || lowerOpp.includes('audiência')) {
        objectives.crescimento_digital.push(`Explorar nicho: ${opportunity}`);
      }
      
      if (lowerOpp.includes('parceria') || lowerOpp.includes('colaboração')) {
        objectives.fortalecimento_marca.push(`Desenvolver parcerias: ${opportunity}`);
      }
      
      if (lowerOpp.includes('digital') || lowerOpp.includes('online') || lowerOpp.includes('conteúdo')) {
        objectives.aquisicao_leads.push(`Estratégia digital: ${opportunity}`);
      }
    });

    // Se não houver objetivos suficientes, gerar alguns padrão baseados nos pontos fortes
    if (objectives.crescimento_digital.length === 0) {
      objectives.crescimento_digital.push("Desenvolver estratégia de conteúdo para redes sociais");
      objectives.crescimento_digital.push("Implementar campanhas de engajamento orgânico");
    }
    
    if (objectives.fortalecimento_marca.length === 0) {
      objectives.fortalecimento_marca.push("Definir posicionamento único da marca");
      objectives.fortalecimento_marca.push("Criar identidade visual consistente");
    }
    
    if (objectives.aquisicao_leads.length === 0) {
      objectives.aquisicao_leads.push("Desenvolver funil de captação de leads");
      objectives.aquisicao_leads.push("Criar landing pages otimizadas");
    }
    
    if (objectives.otimizacao_vendas.length === 0) {
      objectives.otimizacao_vendas.push("Otimizar processo de vendas");
      objectives.otimizacao_vendas.push("Implementar CRM para gestão de leads");
    }

    return objectives;
  };

  // Carregar dados iniciais se existirem
  useEffect(() => {
    if (initialForcas || initialFraquezas || initialOportunidades || initialAmeacas) {
      // Reconstruir análise textual a partir dos dados salvos
      const savedAnalysis = buildAnalysisFromSavedData({
        forcas: initialForcas || '',
        fraquezas: initialFraquezas || '',
        oportunidades: initialOportunidades || '',
        ameacas: initialAmeacas || ''
      });
      setAnalysis(savedAnalysis);
    }
  }, [initialForcas, initialFraquezas, initialOportunidades, initialAmeacas]);

  // Função para reconstruir análise a partir dos dados salvos
  const buildAnalysisFromSavedData = (savedData: {
    forcas: string;
    fraquezas: string;
    oportunidades: string;
    ameacas: string;
  }) => {
    const sections = [];
    
    if (savedData.forcas) {
      sections.push("**FORÇAS:**");
      savedData.forcas.split('\n').forEach(item => {
        if (item.trim()) sections.push(`- ${item.trim()}`);
      });
    }
    
    if (savedData.oportunidades) {
      sections.push("\n**OPORTUNIDADES:**");
      savedData.oportunidades.split('\n').forEach(item => {
        if (item.trim()) sections.push(`- ${item.trim()}`);
      });
    }
    
    if (savedData.fraquezas) {
      sections.push("\n**FRAQUEZAS:**");
      savedData.fraquezas.split('\n').forEach(item => {
        if (item.trim()) sections.push(`- ${item.trim()}`);
      });
    }
    
    if (savedData.ameacas) {
      sections.push("\n**AMEAÇAS:**");
      savedData.ameacas.split('\n').forEach(item => {
        if (item.trim()) sections.push(`- ${item.trim()}`);
      });
    }
    
    return sections.length > 0 ? sections.join('\n') : null;
  };

  const swotData = analysis ? extractSwotData(analysis) : null;
  const hasInitialData = !!(initialForcas || initialFraquezas || initialOportunidades || initialAmeacas);

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho com botão de análise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Matriz FOFA com Análise IA</CardTitle>
              <Badge variant="secondary">
                <Lightbulb className="h-3 w-3 mr-1" />
                GPT-4.1
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {hasInitialData && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Análise Salva
                </Badge>
              )}
              <Button 
                onClick={analyzeSwot} 
                disabled={loading}
                className="gap-2"
                variant={hasInitialData ? "outline" : "default"}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                {loading ? 'Analisando...' : hasInitialData ? 'Nova Análise IA' : 'Analisar com IA'}
              </Button>
            </div>
          </div>
          <CardDescription>
            Análise inteligente da matriz SWOT baseada nos dados de onboarding de {clienteNome}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Matriz FOFA Visual */}
      {swotData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Forças */}
          <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-800 dark:text-green-200">Forças</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {swotData.forcas.length > 0 ? (
                  swotData.forcas.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0" />
                      <span className="text-green-800 dark:text-green-200">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-green-600 dark:text-green-400 italic">Execute a análise IA para ver as forças</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Oportunidades */}
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-blue-800 dark:text-blue-200">Oportunidades</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {swotData.oportunidades.length > 0 ? (
                  swotData.oportunidades.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0" />
                      <span className="text-blue-800 dark:text-blue-200">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-blue-600 dark:text-blue-400 italic">Execute a análise IA para ver as oportunidades</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Fraquezas */}
          <Card className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-800 dark:text-orange-200">Fraquezas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {swotData.fraquezas.length > 0 ? (
                  swotData.fraquezas.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 flex-shrink-0" />
                      <span className="text-orange-800 dark:text-orange-200">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-orange-600 dark:text-orange-400 italic">Execute a análise IA para ver as fraquezas</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Ameaças */}
          <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-800 dark:text-red-200">Ameaças</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {swotData.ameacas.length > 0 ? (
                  swotData.ameacas.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0" />
                      <span className="text-red-800 dark:text-red-200">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-red-600 dark:text-red-400 italic">Execute a análise IA para ver as ameaças</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Matriz FOFA Inteligente</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Clique em "Analisar com IA" para gerar uma análise detalhada da matriz SWOT 
                baseada nos dados de onboarding do cliente.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex flex-col items-center gap-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">Forças</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Oportunidades</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">Fraquezas</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-800 dark:text-red-200">Ameaças</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise Estratégica Completa - Visualização Profunda */}
      {analysis && (
        <div className="space-y-6">
          {/* Header da Análise Estratégica */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Análise Estratégica Profunda</CardTitle>
                    <CardDescription className="text-sm">
                      Insights focados em crescimento e resultados para {clienteNome}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Foco em ROI
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Estratégias Prioritárias - Destaque Principal */}
          {(() => {
            const strategiesMatch = analysis.match(/ESTRATÉGIAS PRIORITÁRIAS:([\s\S]*?)(?=\n\n|$)/);
            const strategies = strategiesMatch ? strategiesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '')) : [];
            
            return strategies.length > 0 && (
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-green-800 dark:text-green-200">Estratégias Prioritárias para Crescimento</CardTitle>
                  </div>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Ações imediatas para maximizar vendas e aquisição de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {strategies.map((strategy, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100 leading-relaxed">
                            {strategy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Matrix de Crescimento Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Oportunidades de Crescimento */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-blue-800 dark:text-blue-200">Oportunidades de Crescimento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {swotData?.oportunidades.length > 0 ? (
                  <div className="space-y-3">
                    {swotData.oportunidades.map((oportunidade, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-relaxed">
                            {oportunidade}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600 dark:text-blue-400 italic">Aguardando análise...</p>
                )}
              </CardContent>
            </Card>

            {/* Pontos de Melhoria Críticos */}
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-orange-800 dark:text-orange-200">Pontos de Melhoria Críticos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {swotData?.fraquezas.length > 0 ? (
                  <div className="space-y-3">
                    {swotData.fraquezas.map((fraqueza, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-orange-900 dark:text-orange-100 font-medium leading-relaxed">
                            {fraqueza}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-orange-600 dark:text-orange-400 italic">Aguardando análise...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Análise Textual Completa - Formatada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Relatório Completo da Análise
              </CardTitle>
              <CardDescription>
                Análise detalhada baseada nos dados de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                  {formatAnalysis(analysis)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos do Cliente - Baseados na Análise SWOT */}
          {(() => {
            const clientObjectives = generateClientObjectives(analysis);
            
            return (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-purple-800 dark:text-purple-200">Objetivos Estratégicos do Cliente</CardTitle>
                        <CardDescription className="text-purple-700 dark:text-purple-300">
                          Metas específicas baseadas na análise SWOT de {clienteNome}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Baseado em IA
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Crescimento Digital */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Crescimento Digital</h3>
                      </div>
                      <div className="space-y-2">
                        {clientObjectives.crescimento_digital.slice(0, 3).map((objective, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0" />
                            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{objective}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fortalecimento da Marca */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200">Fortalecimento da Marca</h3>
                      </div>
                      <div className="space-y-2">
                        {clientObjectives.fortalecimento_marca.slice(0, 3).map((objective, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 flex-shrink-0" />
                            <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">{objective}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aquisição de Leads */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-orange-800 dark:text-orange-200">Aquisição de Leads</h3>
                      </div>
                      <div className="space-y-2">
                        {clientObjectives.aquisicao_leads.slice(0, 3).map((objective, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 flex-shrink-0" />
                            <p className="text-sm text-orange-900 dark:text-orange-100 leading-relaxed">{objective}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Otimização de Vendas */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Otimização de Vendas</h3>
                      </div>
                      <div className="space-y-2">
                        {clientObjectives.otimizacao_vendas.slice(0, 3).map((objective, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 flex-shrink-0" />
                            <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">{objective}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resumo de Ações Prioritárias */}
                  <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Próximos Passos Recomendados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-800 dark:text-purple-200">Definir métricas de acompanhamento</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-800 dark:text-purple-200">Criar cronograma de implementação</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-800 dark:text-purple-200">Alocar recursos necessários</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-800 dark:text-purple-200">Estabelecer indicadores de sucesso</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}