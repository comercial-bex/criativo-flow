import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface Props {
  cliente: number[];
  concorrentes: number[];
  zonaIdeal: { min: number; max: number };
}

export function HistogramaEngajamento({ cliente, concorrentes, zonaIdeal }: Props) {
  // Criar bins de engajamento
  const bins = ['0-1%', '1-2%', '2-3%', '3-4%', '4-5%', '5%+'];
  
  const data = bins.map((bin, idx) => ({
    faixa: bin,
    voce: cliente[idx] || 0,
    media: concorrentes[idx] || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-6 border border-emerald-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">📊 Distribuição de Engajamento</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Frequência de posts por faixa de taxa de engajamento</p>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          
          {/* Zona ideal destacada */}
          <ReferenceLine
            x={zonaIdeal.min}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth={2}
          />
          <ReferenceLine
            x={zonaIdeal.max}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth={2}
          />
          
          <XAxis
            dataKey="faixa"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
          />
          <YAxis
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
            label={{ value: 'Quantidade de Posts', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          
          <Legend
            wrapperStyle={{ color: '#ffffff' }}
            iconType="circle"
          />
          
          <Bar dataKey="voce" fill="#3b82f6" name="Você" radius={[8, 8, 0, 0]} />
          <Bar dataKey="media" fill="#8b5cf6" name="Média Concorrentes" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300 text-center">
          <strong>Zona de Alta Performance:</strong> {zonaIdeal.min} - {zonaIdeal.max}
          <br />
          <span className="text-xs text-gray-400 mt-1 block">Posts nessa faixa geram até 3x mais conversões</span>
        </p>
      </div>
    </motion.div>
  );
}
