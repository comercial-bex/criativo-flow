import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Rocket, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CTATipo = 'informativo' | 'educacional' | 'persuasivo' | 'acao';

interface Props {
  tipo: CTATipo;
  texto: string;
  onClick?: () => void;
  linkExterno?: string;
}

export function CTAEstrategico({ tipo, texto, onClick, linkExterno }: Props) {
  const getConfig = (tipo: CTATipo) => {
    switch (tipo) {
      case 'informativo':
        return {
          icon: ArrowRight,
          colorClass: 'from-blue-500/20 to-blue-600/20 border-blue-500/40 text-blue-300',
          hoverClass: 'hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-500/60',
          iconColor: 'text-blue-400'
        };
      case 'educacional':
        return {
          icon: Lightbulb,
          colorClass: 'from-purple-500/20 to-purple-600/20 border-purple-500/40 text-purple-300',
          hoverClass: 'hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-500/60',
          iconColor: 'text-purple-400'
        };
      case 'persuasivo':
        return {
          icon: Rocket,
          colorClass: 'from-orange-500/20 to-yellow-500/20 border-orange-500/40 text-orange-300',
          hoverClass: 'hover:from-orange-500/30 hover:to-yellow-500/30 hover:border-orange-500/60',
          iconColor: 'text-orange-400'
        };
      case 'acao':
        return {
          icon: tipo === 'acao' ? Phone : CheckCircle,
          colorClass: 'from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-200',
          hoverClass: 'hover:from-green-500/40 hover:to-emerald-500/40 hover:border-green-500/70',
          iconColor: 'text-green-400',
          pulse: true
        };
    }
  };

  const config = getConfig(tipo);
  const Icon = config.icon;

  const handleClick = () => {
    if (linkExterno) {
      window.open(linkExterno, '_blank');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Button
        onClick={handleClick}
        className={`
          w-full p-6 h-auto
          bg-gradient-to-r ${config.colorClass}
          border-2 ${config.hoverClass}
          transition-all duration-300
          group relative overflow-hidden
          ${config.pulse ? 'animate-pulse' : ''}
        `}
        variant="outline"
      >
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-black/30 ${config.iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-left">{texto}</span>
          </div>
          <ArrowRight className={`w-6 h-6 ${config.iconColor} group-hover:translate-x-1 transition-transform`} />
        </div>
      </Button>
    </motion.div>
  );
}
