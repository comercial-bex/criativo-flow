import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface FormatoData {
  formato: string;
  cliente: number;
  concorrentes: number;
  performance: number;
}

interface Props {
  dados: FormatoData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export function FormatosConteudo({ dados }: Props) {
  const dadosCliente = dados.map(d => ({ name: d.formato, value: d.cliente }));
  const dadosConcorrentes = dados.map(d => ({ name: d.formato, value: d.concorrentes }));

  return (
    <div className="w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-6 text-center">Distribuição de Formatos de Conteúdo</h3>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Cliente */}
        <div>
          <h4 className="text-sm font-semibold text-blue-400 mb-4 text-center">Você</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosCliente}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosCliente.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Concorrentes */}
        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-4 text-center">Média Concorrentes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosConcorrentes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosConcorrentes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance por Formato */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Performance Média por Formato</h4>
        {dados.map((formato, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              ></div>
              <span className="text-sm text-white font-medium">{formato.formato}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Engajamento Médio</p>
                <p className="text-sm font-bold text-white">{formato.performance.toFixed(1)}%</p>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold ${
                formato.performance > 5 ? 'bg-green-900/50 text-green-400' :
                formato.performance > 3 ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {formato.performance > 5 ? '🔥 Alto' : formato.performance > 3 ? '⚡ Médio' : '📉 Baixo'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recomendação */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Recomendação:</strong> Aumente a produção de {dados.reduce((a, b) => a.performance > b.performance ? a : b).formato} 
          {' '}(formato com melhor engajamento no seu nicho).
        </p>
      </div>
    </div>
  );
}
