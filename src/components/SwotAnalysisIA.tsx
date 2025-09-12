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
}

export function SwotAnalysisIA({ clienteId, clienteNome }: SwotAnalysisIAProps) {
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

  // Matriz SWOT deve vir vazia para novos onboardings
  // A análise só será gerada quando o usuário clicar no botão "Analisar com IA"

  const swotData = analysis ? extractSwotData(analysis) : null;

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
            <Button 
              onClick={analyzeSwot} 
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {loading ? 'Analisando...' : 'Analisar com IA'}
            </Button>
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

      {/* Análise Completa */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Análise Estratégica Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {formatAnalysis(analysis)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}