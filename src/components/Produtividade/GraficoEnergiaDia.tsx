import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Loader2 } from "lucide-react";
import { useProdutividadeInsights } from "@/hooks/useProdutividadeInsights";

interface GraficoEnergiaDiaProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

export function GraficoEnergiaDia({ setor }: GraficoEnergiaDiaProps) {
  const { insights, loading } = useProdutividadeInsights(setor);

  // Converter horários ideais em dados para o gráfico
  const gerarDadosEnergia = () => {
    if (!insights || !insights.horarios_ideais || insights.horarios_ideais.length === 0) {
      // Dados padrão se não houver insights
      return Array.from({ length: 24 }, (_, i) => ({
        hora: `${i}h`,
        energia: Math.random() * 50 + 25 // Valores aleatórios entre 25-75
      }));
    }

    // Criar array de 24 horas
    const dados = Array.from({ length: 24 }, (_, i) => {
      const hora = `${i}h`;
      const horaStr = i.toString().padStart(2, '0');
      
      // Verificar se essa hora está nos horários ideais
      const isHorarioIdeal = insights.horarios_ideais.some(h => 
        h.startsWith(horaStr) || h.includes(`:${horaStr}`)
      );
      
      // Energia média base + boost se for horário ideal
      const energiaBase = insights.energia_media || 60;
      const energia = isHorarioIdeal ? energiaBase + 20 : energiaBase - 10;
      
      return {
        hora,
        energia: Math.min(100, Math.max(0, energia + (Math.random() * 10 - 5)))
      };
    });

    return dados;
  };

  const data = gerarDadosEnergia();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-yellow-500" />
            Energia ao Longo do Dia
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
          <Zap className="h-5 w-5 text-yellow-500" />
          Energia ao Longo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280 100% 70%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(280 100% 70%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="hora" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval={2}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))' 
              }}
              formatter={(value: number) => [`${value.toFixed(0)}%`, 'Energia']}
            />
            <Area 
              type="monotone" 
              dataKey="energia" 
              stroke="hsl(280 100% 70%)" 
              fillOpacity={1} 
              fill="url(#colorEnergia)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        {insights && insights.horarios_ideais && insights.horarios_ideais.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Horários ideais: <span className="font-semibold text-purple-400">
              {insights.horarios_ideais.join(', ')}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
