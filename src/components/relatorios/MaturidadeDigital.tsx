import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface DimensaoMaturidade {
  dimensao: string;
  cliente: number;
  concorrentes: number;
  mercado: number;
}

interface Props {
  dimensoes: DimensaoMaturidade[];
}

export function MaturidadeDigital({ dimensoes }: Props) {
  const scoreCliente = Math.round(dimensoes.reduce((acc, d) => acc + d.cliente, 0) / dimensoes.length);
  const scoreConcorrentes = Math.round(dimensoes.reduce((acc, d) => acc + d.concorrentes, 0) / dimensoes.length);
  const scoreMercado = Math.round(dimensoes.reduce((acc, d) => acc + d.mercado, 0) / dimensoes.length);

  const getNivelMaturidade = (score: number) => {
    if (score >= 80) return { nivel: 'Excelente', cor: 'text-green-400', bg: 'bg-green-900/30' };
    if (score >= 60) return { nivel: 'Bom', cor: 'text-blue-400', bg: 'bg-blue-900/30' };
    if (score >= 40) return { nivel: 'Médio', cor: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { nivel: 'Iniciante', cor: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const nivelCliente = getNivelMaturidade(scoreCliente);

  const data = dimensoes.map(d => ({
    subject: d.dimensao,
    Você: d.cliente,
    Concorrentes: d.concorrentes,
    Mercado: d.mercado,
    fullMark: 100
  }));

  return (
    <div className="w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-6 border border-indigo-500/20">
      <h3 className="text-lg font-bold text-white mb-6 text-center">Scorecard de Maturidade Digital</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Score Cliente */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`${nivelCliente.bg} border border-${nivelCliente.cor.replace('text-', '')} rounded-lg p-4 text-center`}
        >
          <p className="text-xs text-gray-400 mb-2">Seu Score</p>
          <p className={`text-4xl font-bold ${nivelCliente.cor}`}>{scoreCliente}</p>
          <p className={`text-sm font-semibold ${nivelCliente.cor} mt-1`}>{nivelCliente.nivel}</p>
        </motion.div>

        {/* Score Concorrentes */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Concorrentes</p>
          <p className="text-4xl font-bold text-purple-400">{scoreConcorrentes}</p>
          <p className="text-sm text-purple-300 mt-1">{getNivelMaturidade(scoreConcorrentes).nivel}</p>
        </div>

        {/* Score Mercado */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Média Mercado</p>
          <p className="text-4xl font-bold text-gray-300">{scoreMercado}</p>
          <p className="text-sm text-gray-400 mt-1">{getNivelMaturidade(scoreMercado).nivel}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#ffffff', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#ffffff80', fontSize: 10 }}
          />
          <Radar
            name="Você"
            dataKey="Você"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            name="Concorrentes"
            dataKey="Concorrentes"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Radar
            name="Mercado"
            dataKey="Mercado"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.1}
          />
          <Legend wrapperStyle={{ color: '#ffffff' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Detalhamento por Dimensão */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Análise Detalhada por Dimensão</h4>
        {dimensoes.map((dim, idx) => {
          const gap = dim.cliente - dim.concorrentes;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">{dim.dimensao}</span>
                <span className={`text-sm font-bold ${gap > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gap > 0 ? '+' : ''}{gap} vs concorrentes
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${dim.cliente}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{dim.cliente}/100</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
