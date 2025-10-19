import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Instagram, Video, Linkedin, Youtube } from 'lucide-react';

interface Plataforma {
  plataforma: string;
  cliente: number;
  concorrentes: number;
}

interface Props {
  plataformas: Plataforma[];
}

export function ComparativoPlataformas({ plataformas }: Props) {
  const getIcon = (nome: string) => {
    const iconClass = "w-4 h-4";
    switch (nome.toLowerCase()) {
      case 'instagram': return <Instagram className={iconClass} />;
      case 'tiktok': return <Video className={iconClass} />;
      case 'linkedin': return <Linkedin className={iconClass} />;
      case 'youtube': return <Youtube className={iconClass} />;
      default: return null;
    }
  };

  const getCor = (nome: string) => {
    switch (nome.toLowerCase()) {
      case 'instagram': return '#E4405F';
      case 'tiktok': return '#000000';
      case 'linkedin': return '#0A66C2';
      case 'youtube': return '#FF0000';
      default: return '#8b5cf6';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-lg p-6 border border-pink-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">🌍 Comparativo Multi-Plataforma</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Presença e audiência por rede social (seguidores)</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={plataformas} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          
          <XAxis
            dataKey="plataforma"
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
          />
          
          <YAxis
            stroke="#ffffff80"
            tick={{ fill: '#ffffff' }}
            label={{ value: 'Seguidores', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid #ec4899',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => value.toLocaleString('pt-BR')}
          />
          
          <Legend
            wrapperStyle={{ color: '#ffffff' }}
            iconType="circle"
          />
          
          <Bar dataKey="cliente" fill="#3b82f6" name="Você" radius={[8, 8, 0, 0]} />
          <Bar dataKey="concorrentes" fill="#8b5cf6" name="Média Concorrentes" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {plataformas.map((plat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-white/10"
            style={{ borderColor: getCor(plat.plataforma) + '40' }}
          >
            <div style={{ color: getCor(plat.plataforma) }}>
              {getIcon(plat.plataforma)}
            </div>
            <span className="text-sm text-gray-300">{plat.plataforma}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
