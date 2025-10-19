import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Users, Calendar, Zap } from 'lucide-react';
import CountUp from 'react-countup';

interface Highlight {
  label: string;
  valor: number;
  unidade: string;
  tendencia?: 'up' | 'down' | 'neutral';
  icone: 'trending' | 'target' | 'users' | 'calendar' | 'zap';
  cor: string;
}

interface Props {
  highlights: Highlight[];
}

export function HighlightsNumericos({ highlights }: Props) {
  const getIcon = (tipo: Highlight['icone']) => {
    const className = "w-8 h-8";
    switch (tipo) {
      case 'trending': return <TrendingUp className={className} />;
      case 'target': return <Target className={className} />;
      case 'users': return <Users className={className} />;
      case 'calendar': return <Calendar className={className} />;
      case 'zap': return <Zap className={className} />;
      default: return <TrendingUp className={className} />;
    }
  };

  const getTrendIcon = (tendencia?: Highlight['tendencia']) => {
    if (!tendencia || tendencia === 'neutral') return null;
    return tendencia === 'up' 
      ? <TrendingUp className="w-4 h-4 text-green-400" />
      : <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-8 border-2 border-gray-700">
      <h3 className="text-3xl font-bold text-white mb-2 text-center">📊 Resumo Executivo</h3>
      <p className="text-sm text-gray-400 mb-8 text-center">Principais métricas do seu desempenho digital</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {highlights.map((highlight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
            className={`relative p-6 rounded-xl bg-gradient-to-br ${highlight.cor} border-2 border-white/10 hover:border-white/40 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer group`}
          >
            {/* Brilho animado no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl" />
            
            {/* Ícone */}
            <div className="mb-4 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
              {getIcon(highlight.icone)}
            </div>
            
            {/* Valor com animação */}
            <div className="flex items-baseline gap-2 mb-2 relative z-10">
              <span className="text-5xl font-black text-white drop-shadow-lg">
                <CountUp
                  end={highlight.valor}
                  duration={2.5}
                  separator="."
                  decimals={highlight.unidade === '%' ? 1 : 0}
                />
              </span>
              <span className="text-2xl text-white/90 font-bold">{highlight.unidade}</span>
              {getTrendIcon(highlight.tendencia)}
            </div>
            
            {/* Label */}
            <p className="text-sm text-white/80 font-semibold leading-tight">
              {highlight.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
