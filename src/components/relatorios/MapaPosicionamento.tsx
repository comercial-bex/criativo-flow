import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
  nome: string;
  alcance: number;
  engajamento: number;
  frequencia: number;
  tipo: 'cliente' | 'concorrente';
}

interface Props {
  dados: DataPoint[];
}

export function MapaPosicionamento({ dados }: Props) {
  const cliente = dados.find(d => d.tipo === 'cliente');
  const concorrentes = dados.filter(d => d.tipo === 'concorrente');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-6 border border-indigo-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">🎯 Mapa de Posicionamento Competitivo</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Alcance vs. Engajamento (tamanho = frequência de posts)</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          
          {/* Quadrantes de fundo */}
          <rect x="50%" y="0" width="50%" height="50%" fill="#10b98120" />
          <rect x="50%" y="50%" width="50%" height="50%" fill="#f59e0b20" />
          <rect x="0" y="0" width="50%" height="50%" fill="#3b82f620" />
          <rect x="0" y="50%" width="50%" height="50%" fill="#ef444420" />
          
          <XAxis
            type="number"
            dataKey="alcance"
            name="Seguidores"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
          >
            <Label value="Alcance (Seguidores)" offset={-40} position="insideBottom" style={{ fill: '#ffffff' }} />
          </XAxis>
          
          <YAxis
            type="number"
            dataKey="engajamento"
            name="Engajamento (%)"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
          >
            <Label value="Engajamento (%)" angle={-90} position="insideLeft" style={{ fill: '#ffffff' }} />
          </YAxis>
          
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Seguidores') return value.toLocaleString('pt-BR');
              if (name === 'Engajamento (%)') return `${value.toFixed(1)}%`;
              if (name === 'Posts/mês') return value;
              return value;
            }}
          />
          
          {/* Concorrentes */}
          <Scatter name="Concorrentes" data={concorrentes} fill="#8b5cf6">
            {concorrentes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#8b5cf680" />
            ))}
          </Scatter>
          
          {/* Cliente em destaque */}
          {cliente && (
            <Scatter name="Você" data={[cliente]} fill="#3b82f6">
              <Cell fill="#3b82f6" />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500/40 border-2 border-green-500" />
          <span className="text-gray-300">Quadrante Elite (Alto alcance + Alto engajamento)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500/40 border-2 border-orange-500" />
          <span className="text-gray-300">Crescimento (Alto alcance + Baixo engajamento)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/40 border-2 border-blue-500" />
          <span className="text-gray-300">Engajado (Baixo alcance + Alto engajamento)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500/40 border-2 border-red-500" />
          <span className="text-gray-300">Iniciante (Baixo alcance + Baixo engajamento)</span>
        </div>
      </div>
    </motion.div>
  );
}
