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
    <div className="w-full h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
      <h3 className="text-lg font-bold text-white mb-4 text-center">Análise SWOT Visual</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#ffffff', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#ffffff80', fontSize: 10 }}
          />
          <Radar
            name="SWOT Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Legend 
            wrapperStyle={{ color: '#ffffff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
