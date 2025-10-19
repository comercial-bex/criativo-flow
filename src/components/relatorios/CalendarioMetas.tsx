import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Meta {
  titulo: string;
  valor_atual: number;
  valor_alvo: number;
  progresso_percent: number;
  periodo_fim: string;
  status: 'em_andamento' | 'concluida' | 'atrasada';
  unidade: string;
}

interface Props {
  metas: Meta[];
  postsAgendados: number;
  proximaCaptacao?: string;
}

export function CalendarioMetas({ metas, postsAgendados, proximaCaptacao }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-900/50 text-green-400 border-green-500/30';
      case 'em_andamento': return 'bg-blue-900/50 text-blue-400 border-blue-500/30';
      case 'atrasada': return 'bg-red-900/50 text-red-400 border-red-500/30';
      default: return 'bg-gray-800/50 text-gray-400 border-gray-600';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-blue-500';
    if (percent >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-6 border border-cyan-500/20">
      <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
        <Calendar className="w-5 h-5" />
        Metas e Agenda BEX
      </h3>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 text-center"
        >
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-400">{metas.length}</p>
          <p className="text-xs text-gray-400 mt-1">Metas Ativas</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center"
        >
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-400">{postsAgendados}</p>
          <p className="text-xs text-gray-400 mt-1">Posts Agendados (30d)</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 text-center"
        >
          <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-orange-400">
            {proximaCaptacao ? format(new Date(proximaCaptacao), "dd 'de' MMM", { locale: ptBR }) : 'N/A'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Próxima Captação</p>
        </motion.div>
      </div>

      {/* Timeline de Metas */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Progresso das Metas</h4>
        {metas.map((meta, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-lg p-4 border ${getStatusColor(meta.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-white mb-1">{meta.titulo}</h5>
                <p className="text-xs text-gray-400">
                  Prazo: {format(new Date(meta.periodo_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {meta.valor_atual}<span className="text-sm text-gray-400">/{meta.valor_alvo}</span>
                </p>
                <p className="text-xs text-gray-400">{meta.unidade}</p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Progresso</span>
                <span className="text-xs font-bold text-white">{meta.progresso_percent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(meta.progresso_percent, 100)}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-full ${getProgressColor(meta.progresso_percent)} transition-all`}
                ></motion.div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                meta.status === 'concluida' ? 'bg-green-900/50 text-green-400' :
                meta.status === 'em_andamento' ? 'bg-blue-900/50 text-blue-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {meta.status === 'concluida' ? '✓ Concluída' :
                 meta.status === 'em_andamento' ? '⏳ Em Andamento' :
                 '⚠️ Atrasada'}
              </span>

              {meta.status === 'em_andamento' && (
                <span className="text-xs text-gray-400">
                  Faltam {meta.valor_alvo - meta.valor_atual} {meta.unidade}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Próximas Entregas */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>📅 Agenda:</strong> Você tem {postsAgendados} posts agendados para os próximos 30 dias.
          {proximaCaptacao && ` Próxima captação em ${format(new Date(proximaCaptacao), "dd/MM/yyyy")}.`}
        </p>
      </div>
    </div>
  );
}
