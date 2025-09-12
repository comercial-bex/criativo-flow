import React, { useState } from 'react';
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
  const [analysis, setAnalysis] = useState<string>('');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Análise SWOT com IA</CardTitle>
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
      
      {analysis && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Análise Estratégica Gerada</span>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {formatAnalysis(analysis)}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Próximos Passos</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta análise foi gerada com base nos dados de onboarding. 
                Use estas informações para desenvolver estratégias de marketing e comunicação mais eficazes.
              </p>
            </div>
          </div>
        </CardContent>
      )}
      
      {!analysis && !loading && (
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Análise SWOT Inteligente</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão acima para gerar uma análise detalhada da matriz SWOT 
              baseada nos dados de onboarding do cliente.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Insights Estratégicos
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Pontos de Atenção
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Recomendações
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}