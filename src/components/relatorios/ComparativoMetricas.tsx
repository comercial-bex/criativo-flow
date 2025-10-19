import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricaComparativa {
  nome: string;
  cliente: number;
  mediaConcorrentes: number;
  status: 'forte' | 'neutro' | 'vulneravel';
}

interface Props {
  metricas: MetricaComparativa[];
}

export function ComparativoMetricas({ metricas }: Props) {
  // Cores baseadas no status
  const getColor = (status: string) => {
    switch (status) {
      case 'forte': return '#10b981'; // Verde
      case 'neutro': return '#f59e0b'; // Amarelo
      case 'vulneravel': return '#ef4444'; // Vermelho
      default: return '#6b7280';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 text-center">Comparativo Competitivo</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metricas} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="nome" 
            tick={{ fill: '#ffffff', fontSize: 11 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: '#ffffff80', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }}
          />
          <Bar 
            dataKey="cliente" 
            fill="#3b82f6" 
            name="Você"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="mediaConcorrentes" 
            fill="#8b5cf6" 
            name="Média Concorrentes"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
