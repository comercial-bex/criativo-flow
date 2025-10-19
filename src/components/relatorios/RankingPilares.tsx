import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface Pilar {
  pilar: string;
  engajamento: number;
  posts: number;
}

interface Props {
  pilares: Pilar[];
}

export function RankingPilares({ pilares }: Props) {
  // Ordenar por engajamento decrescente
  const dadosOrdenados = [...pilares].sort((a, b) => b.engajamento - a.engajamento);

  // Cores em gradiente verde -> amarelo -> vermelho
  const getCor = (engajamento: number) => {
    if (engajamento >= 4.5) return '#10b981'; // Verde
    if (engajamento >= 3.5) return '#84cc16'; // Verde-limão
    if (engajamento >= 2.5) return '#eab308'; // Amarelo
    if (engajamento >= 1.5) return '#f97316'; // Laranja
    return '#ef4444'; // Vermelho
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">🏆 Ranking de Pilares de Conteúdo</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Performance por tipo de conteúdo (taxa de engajamento %)</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={dadosOrdenados}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          
          <XAxis
            type="number"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
            label={{ value: 'Engajamento (%)', position: 'insideBottom', offset: -10, fill: '#ffffff' }}
          />
          
          <YAxis
            type="category"
            dataKey="pilar"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff', fontSize: 12 }}
            width={110}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid #eab308',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'engajamento') return [`${value.toFixed(1)}%`, 'Engajamento'];
              return value;
            }}
            labelFormatter={(label) => `${label} (${dadosOrdenados.find(p => p.pilar === label)?.posts || 0} posts)`}
          />
          
          <Bar dataKey="engajamento" radius={[0, 8, 8, 0]}>
            {dadosOrdenados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCor(entry.engajamento)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-300">Excelente (&gt;4.5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-300">Bom (2.5-4.5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-300">Requer atenção (&lt;2.5%)</span>
        </div>
      </div>
    </motion.div>
  );
}
