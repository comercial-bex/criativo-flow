import { motion } from 'framer-motion';
import { TrendingUp, Hash, Target } from 'lucide-react';

interface HashtagData {
  hashtag: string;
  alcance_medio: number;
  uso_cliente: number;
  uso_concorrentes: number;
  oportunidade: 'alta' | 'media' | 'baixa';
}

interface Props {
  hashtags: HashtagData[];
}

export function HashtagsCompetitivas({ hashtags }: Props) {
  const getCorOportunidade = (oportunidade: string) => {
    switch (oportunidade) {
      case 'alta': return 'bg-green-900/50 text-green-400 border-green-500/30';
      case 'media': return 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-800/50 text-gray-400 border-gray-600';
    }
  };

  const hashtagsOportunidade = hashtags.filter(h => h.oportunidade === 'alta').slice(0, 5);

  return (
    <div className="w-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg p-6 border border-pink-500/20">
      <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
        <Hash className="w-5 h-5" />
        Análise Competitiva de Hashtags
      </h3>

      {/* Hashtags de Oportunidade */}
      <div className="mb-8 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Top 5 Hashtags de Oportunidade
        </h4>
        <div className="space-y-2">
          {hashtagsOportunidade.map((hashtag, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-400">#{idx + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{hashtag.hashtag}</p>
                  <p className="text-xs text-gray-400">Alcance médio: {hashtag.alcance_medio.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Uso concorrentes</p>
                <p className="text-sm font-bold text-purple-400">{hashtag.uso_concorrentes}x</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ranking Completo */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Ranking Completo de Hashtags do Nicho</h4>
        <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
          {hashtags.map((hashtag, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-lg p-3 border ${getCorOportunidade(hashtag.oportunidade)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-500">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{hashtag.hashtag}</p>
                    <p className="text-xs text-gray-400">
                      Alcance: {hashtag.alcance_medio.toLocaleString()} • Você usa: {hashtag.uso_cliente}x
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Concorrentes</p>
                    <p className="text-sm font-bold text-purple-400">{hashtag.uso_concorrentes}x</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    hashtag.oportunidade === 'alta' ? 'bg-green-900/50 text-green-400' :
                    hashtag.oportunidade === 'media' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-800/50 text-gray-400'
                  }`}>
                    {hashtag.oportunidade === 'alta' && <TrendingUp className="w-3 h-3" />}
                    {hashtag.oportunidade === 'alta' ? 'Alta' : hashtag.oportunidade === 'media' ? 'Média' : 'Baixa'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dica Estratégica */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Estratégia:</strong> Foque nas hashtags de "Alta Oportunidade" - elas têm bom alcance mas são pouco exploradas pelos concorrentes.
        </p>
      </div>
    </div>
  );
}
