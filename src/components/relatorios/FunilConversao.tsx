import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FunilData {
  etapa: string;
  cliente: number;
  concorrentes: number;
  gap: number;
}

interface Props {
  dados: FunilData[];
}

export function FunilConversao({ dados }: Props) {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
      <h3 className="text-lg font-bold text-white mb-4 text-center">Funil de Conversão Digital</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <defs>
            <linearGradient id="colorCliente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConcorrentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="etapa" 
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
            formatter={(value: number) => `${value}%`}
          />
          <Legend wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="cliente" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorCliente)" 
            name="Você"
          />
          <Area 
            type="monotone" 
            dataKey="concorrentes" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorConcorrentes)" 
            name="Média Concorrentes"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Insights de Gap */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {dados.map((etapa, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{etapa.etapa}</p>
            <p className={`text-sm font-bold ${etapa.gap > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {etapa.gap > 0 ? '+' : ''}{etapa.gap}% vs concorrentes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
