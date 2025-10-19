import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
  mes: string;
  alcance: number;
  engajamento: number;
  conversoes: number;
}

interface Props {
  dados: DataPoint[];
  projecao?: DataPoint[];
}

export function AreaEmpilhada({ dados, projecao }: Props) {
  const dadosCompletos = projecao ? [...dados, ...projecao] : dados;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-6 border border-cyan-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">📈 Evolução de Métricas Compostas</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Construção de resultados ao longo do tempo (empilhado)</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={dadosCompletos} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorEngajamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConversoes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          
          <XAxis
            dataKey="mes"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
          />
          
          <YAxis
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
            label={{ value: 'Métricas (índice)', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid #06b6d4',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => value.toLocaleString('pt-BR')}
          />
          
          <Legend
            wrapperStyle={{ color: '#ffffff' }}
            iconType="circle"
          />
          
          <Area
            type="monotone"
            dataKey="conversoes"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorConversoes)"
            name="Conversões"
          />
          <Area
            type="monotone"
            dataKey="engajamento"
            stackId="1"
            stroke="#8b5cf6"
            fill="url(#colorEngajamento)"
            name="Engajamento"
          />
          <Area
            type="monotone"
            dataKey="alcance"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorAlcance)"
            name="Alcance"
          />
        </AreaChart>
      </ResponsiveContainer>

      {projecao && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300 text-center">
            <strong>Projeção:</strong> Últimos {projecao.length} meses mostram tendência futura baseada no plano estratégico
          </p>
        </div>
      )}
    </motion.div>
  );
}
