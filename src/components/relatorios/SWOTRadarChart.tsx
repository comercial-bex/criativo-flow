import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface SWOTData {
  forcas?: string;
  fraquezas?: string;
  oportunidades?: string;
  ameacas?: string;
}

interface Props {
  swotData: SWOTData;
}

export function SWOTRadarChart({ swotData }: Props) {
  // Calcular scores baseados no tamanho/quantidade de cada quadrante
  const calcularScore = (texto: string | undefined) => {
    if (!texto) return 0;
    const linhas = texto.split('\n').filter(l => l.trim());
    return Math.min(100, linhas.length * 20); // Cada ponto vale 20
  };

  const data = [
    {
      subject: '💪 Forças',
      score: calcularScore(swotData.forcas),
      fullMark: 100,
    },
    {
      subject: '🌟 Oportunidades',
      score: calcularScore(swotData.oportunidades),
      fullMark: 100,
    },
    {
      subject: '⚠️ Fraquezas',
      score: calcularScore(swotData.fraquezas),
      fullMark: 100,
    },
    {
      subject: '🚨 Ameaças',
      score: calcularScore(swotData.ameacas),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-6 border-2 border-blue-500/30">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">🎯 Análise SWOT Visual</h3>
      <p className="text-sm text-gray-400 mb-4 text-center">Radar estratégico da sua posição competitiva</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff30" strokeWidth={1.5} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#ffffff90', fontSize: 11 }}
          />
          <Radar
            name="Score SWOT"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <Legend 
            wrapperStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-300 font-semibold">💪 Forças: {calcularScore(swotData.forcas)}/100</p>
        </div>
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 font-semibold">🌟 Oportunidades: {calcularScore(swotData.oportunidades)}/100</p>
        </div>
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 font-semibold">⚠️ Fraquezas: {calcularScore(swotData.fraquezas)}/100</p>
        </div>
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300 font-semibold">🚨 Ameaças: {calcularScore(swotData.ameacas)}/100</p>
        </div>
      </div>
    </div>
  );
}
