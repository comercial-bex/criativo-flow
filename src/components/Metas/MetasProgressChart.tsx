import { MetaComHistorico } from '@/hooks/useMetasVisualizacao';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetasProgressChartProps {
  metas: MetaComHistorico[];
  compact?: boolean;
}

export function MetasProgressChart({ metas, compact = false }: MetasProgressChartProps) {
  // Preparar dados para o gráfico
  const dadosGrafico = prepararDadosGrafico(metas);

  if (dadosGrafico.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sem dados de histórico disponíveis
      </div>
    );
  }

  // Cores para cada meta
  const cores = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
  ];

  return (
    <ResponsiveContainer width="100%" height={compact ? "100%" : 300}>
      <LineChart data={dadosGrafico}>
        {!compact && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
        <XAxis 
          dataKey="data" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        {!compact && (
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => format(new Date(value), "dd 'de' MMMM", { locale: ptBR })}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progresso']}
          />
        )}
        {!compact && <Legend />}
        
        {metas.map((meta, index) => (
          <Line
            key={meta.id}
            type="monotone"
            dataKey={meta.id}
            name={compact ? undefined : meta.titulo}
            stroke={cores[index % cores.length]}
            strokeWidth={2}
            dot={!compact}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Função auxiliar para preparar dados
function prepararDadosGrafico(metas: MetaComHistorico[]) {
  // Coletar todas as datas únicas de todos os históricos
  const todasDatas = new Set<string>();
  
  metas.forEach(meta => {
    meta.historico?.forEach(h => {
      todasDatas.add(format(new Date(h.data_registro), 'yyyy-MM-dd'));
    });
  });

  // Ordenar datas
  const datasOrdenadas = Array.from(todasDatas).sort();

  // Criar estrutura de dados para o gráfico
  const dados = datasOrdenadas.map(data => {
    const ponto: any = { data };

    metas.forEach(meta => {
      // Encontrar o valor mais recente até esta data
      const historicoAteData = meta.historico
        ?.filter(h => format(new Date(h.data_registro), 'yyyy-MM-dd') <= data)
        .sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

      if (historicoAteData && historicoAteData.length > 0) {
        ponto[meta.id] = historicoAteData[0].progresso_percent;
      }
    });

    return ponto;
  });

  return dados;
}
