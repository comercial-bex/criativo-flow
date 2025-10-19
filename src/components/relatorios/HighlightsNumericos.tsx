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
    <div className="w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-8 border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-8 text-center">Números-Chave</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {highlights.map((highlight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-6 rounded-xl bg-gradient-to-br ${highlight.cor} border-2 border-white/10 hover:border-white/30 transition-all hover:scale-105`}
          >
            {/* Ícone */}
            <div className="mb-4 opacity-80">
              {getIcon(highlight.icone)}
            </div>
            
            {/* Valor com animação */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">
                <CountUp
                  end={highlight.valor}
                  duration={2}
                  separator="."
                  decimals={highlight.unidade === '%' ? 1 : 0}
                />
              </span>
              <span className="text-xl text-white/80">{highlight.unidade}</span>
              {getTrendIcon(highlight.tendencia)}
            </div>
            
            {/* Label */}
            <p className="text-sm text-white/70 font-medium">
              {highlight.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
