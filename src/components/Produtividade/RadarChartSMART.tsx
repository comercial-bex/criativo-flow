import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Target, Loader2 } from "lucide-react";
import { useProdutividadeMetas } from "@/hooks/useProdutividadeMetas";

interface RadarChartSMARTProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

export function RadarChartSMART({ setor }: RadarChartSMARTProps) {
  const { metas, loading } = useProdutividadeMetas(setor);

  // Calcular média das notas SMART de todas as metas
  const calcularMediaSMART = () => {
    const metasComQualidade = metas.filter(m => m.qualidade_smart && m.qualidade_smart > 0);
    
    if (metasComQualidade.length === 0) {
      return [
        { criterio: 'Específica', nota: 0 },
        { criterio: 'Mensurável', nota: 0 },
        { criterio: 'Atingível', nota: 0 },
        { criterio: 'Relevante', nota: 0 },
        { criterio: 'Temporal', nota: 0 }
      ];
    }

    // Simulação: cada meta com qualidade_smart tem notas distribuídas
    // Em produção real, isso viria da avaliação detalhada da IA
    const mediaQualidade = metasComQualidade.reduce((acc, m) => acc + (m.qualidade_smart || 0), 0) / metasComQualidade.length;
    
    return [
      { criterio: 'Específica', nota: Math.min(100, mediaQualidade + Math.random() * 10 - 5) },
      { criterio: 'Mensurável', nota: Math.min(100, mediaQualidade + Math.random() * 10 - 5) },
      { criterio: 'Atingível', nota: Math.min(100, mediaQualidade + Math.random() * 10 - 5) },
      { criterio: 'Relevante', nota: Math.min(100, mediaQualidade + Math.random() * 10 - 5) },
      { criterio: 'Temporal', nota: Math.min(100, mediaQualidade + Math.random() * 10 - 5) }
    ];
  };

  const data = calcularMediaSMART();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-purple-500" />
            Qualidade das Metas (SMART)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-purple-500" />
          Qualidade das Metas (SMART)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--muted))" />
            <PolarAngleAxis 
              dataKey="criterio" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar 
              name="Qualidade" 
              dataKey="nota" 
              stroke="hsl(280 100% 70%)" 
              fill="hsl(280 100% 70%)" 
              fillOpacity={0.4} 
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {metas.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Crie metas para visualizar a análise SMART
          </p>
        )}
      </CardContent>
    </Card>
  );
}
