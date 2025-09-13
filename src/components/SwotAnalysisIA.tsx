import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
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
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-swot', {
        body: { clienteId }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setAnalysis(data.analysis);
        
        // Extrair e passar dados SWOT para o formulário pai
        const swotData = extractSwotData(data.analysis);
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
      console.error('Erro ao analisar SWOT:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Divide o texto em seções baseadas em títulos ou quebras de linha
    const sections = text.split('\n').filter(line => line.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Detecta títulos (linhas que começam com número, maiúscula ou contêm palavras-chave)
      const isTitle = /^(\d+\.|[A-Z][A-Z\s]+:|\*\*[^*]+\*\*|#{1,3}\s|FORÇAS|FRAQUEZAS|OPORTUNIDADES|AMEAÇAS|ANÁLISE|RECOMENDAÇÕES|INSIGHTS)/.test(trimmedSection);
      
      if (isTitle) {
        return (
          <h3 key={index} className="font-semibold text-lg text-primary mt-4 mb-2">
            {trimmedSection.replace(/^\*\*|\*\*$/g, '').replace(/^#{1,3}\s/, '')}
          </h3>
        );
      }
      
      // Detecta listas (linhas que começam com -, *, ou números)
      const isList = /^[\-\*\•]\s/.test(trimmedSection);
      
      if (isList) {
        return (
          <li key={index} className="ml-4 mb-1 text-muted-foreground">
            {trimmedSection.replace(/^[\-\*\•]\s/, '')}
          </li>
        );
      }
      
      // Texto normal
      return (
        <p key={index} className="mb-3 text-muted-foreground leading-relaxed">
          {trimmedSection}
        </p>
      );
    });
  };

  // Função para extrair dados SWOT da análise
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
      const lowerLine = line.toLowerCase().trim();
      
      if (lowerLine.includes('forças') || lowerLine.includes('strengths')) {
        currentSection = 'forcas';
      } else if (lowerLine.includes('oportunidades') || lowerLine.includes('opportunities')) {
        currentSection = 'oportunidades';
      } else if (lowerLine.includes('fraquezas') || lowerLine.includes('weaknesses')) {
        currentSection = 'fraquezas';
      } else if (lowerLine.includes('ameaças') || lowerLine.includes('threats')) {
        currentSection = 'ameacas';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const item = line.trim().replace(/^[-•]\s*/, '');
        if (item && currentSection && swotData[currentSection]) {
          swotData[currentSection].push(item);
        }
      }
    });

    return swotData;
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
        </div>
      )}
    </div>
  );
}