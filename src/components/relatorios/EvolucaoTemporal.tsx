import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EvolucaoData {
  mes: string;
  seguidores_cliente: number;
  seguidores_concorrentes: number;
  engajamento_cliente: number;
  engajamento_concorrentes: number;
  projecao_cliente?: number;
}

interface Props {
  dados: EvolucaoData[];
  metrica: 'seguidores' | 'engajamento';
}

export function EvolucaoTemporal({ dados, metrica }: Props) {
  const titulo = metrica === 'seguidores' ? 'Evolução de Seguidores' : 'Evolução de Engajamento';
  const dataKeyCliente = metrica === 'seguidores' ? 'seguidores_cliente' : 'engajamento_cliente';
  const dataKeyConcorrentes = metrica === 'seguidores' ? 'seguidores_concorrentes' : 'engajamento_concorrentes';

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20">
      <h3 className="text-lg font-bold text-white mb-4 text-center">{titulo} (Últimos 6 Meses)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <defs>
            <linearGradient id="lineCliente" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="mes" 
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
          <Legend wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }} />
          
          <Line 
            type="monotone" 
            dataKey={dataKeyCliente} 
            stroke="url(#lineCliente)" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Você"
          />
          
          <Line 
            type="monotone" 
            dataKey={dataKeyConcorrentes} 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#8b5cf6', r: 4 }}
            name="Média Concorrentes"
          />
          
          {/* Linha de projeção */}
          <Line 
            type="monotone" 
            dataKey="projecao_cliente" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
            name="Projeção (90 dias)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Análise de Crescimento */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
          <p className="text-xs text-blue-300 mb-1">Crescimento Atual</p>
          <p className="text-xl font-bold text-blue-400">+{Math.round((dados[dados.length - 1]?.[dataKeyCliente] / dados[0]?.[dataKeyCliente] - 1) * 100)}%</p>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
          <p className="text-xs text-purple-300 mb-1">Concorrentes</p>
          <p className="text-xl font-bold text-purple-400">+{Math.round((dados[dados.length - 1]?.[dataKeyConcorrentes] / dados[0]?.[dataKeyConcorrentes] - 1) * 100)}%</p>
        </div>
        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
          <p className="text-xs text-green-300 mb-1">Projeção 90 dias</p>
          <p className="text-xl font-bold text-green-400">+{Math.round(((dados.find(d => d.projecao_cliente)?.projecao_cliente || 0) / dados[dados.length - 1]?.[dataKeyCliente] - 1) * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
