import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Acao {
  titulo: string;
  descricao: string;
  prazo: string;
  status: 'feito' | 'em_andamento' | 'pendente';
}

interface Fase {
  titulo: string;
  periodo: string;
  acoes: Acao[];
}

interface Props {
  fases: Fase[];
}

export function TimelineAcoes({ fases }: Props) {
  const getIcon = (status: Acao['status']) => {
    switch (status) {
      case 'feito': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'em_andamento': return <Clock className="w-6 h-6 text-yellow-500" />;
      default: return <Circle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Acao['status']) => {
    switch (status) {
      case 'feito': return 'border-green-500 bg-green-500/10';
      case 'em_andamento': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-8 border border-purple-500/20">
      <h3 className="text-2xl font-bold text-white mb-8 text-center">Plano de Ação - 90 Dias</h3>
      
      <div className="space-y-12 relative">
        {/* Linha vertical conectando as fases */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-pink-500" />
        
        {fases.map((fase, faseIdx) => (
          <motion.div
            key={faseIdx}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: faseIdx * 0.2 }}
            className="relative pl-20"
          >
            {/* Indicador da fase */}
            <div className="absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xl border-4 border-gray-900">
              {faseIdx + 1}
            </div>
            
            {/* Conteúdo da fase */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-white">{fase.titulo}</h4>
                <p className="text-sm text-gray-400">{fase.periodo}</p>
              </div>
              
              {/* Ações da fase */}
              <div className="space-y-3">
                {fase.acoes.map((acao, acaoIdx) => (
                  <motion.div
                    key={acaoIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (faseIdx * 0.2) + (acaoIdx * 0.1) }}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(acao.status)} flex items-start gap-3`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(acao.status)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-white mb-1">{acao.titulo}</h5>
                      <p className="text-sm text-gray-300 mb-2">{acao.descricao}</p>
                      <span className="text-xs text-gray-400">⏱️ {acao.prazo}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
