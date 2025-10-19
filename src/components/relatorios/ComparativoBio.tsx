import { motion } from 'framer-motion';
import { Link, MessageCircle, Award, CheckCircle, XCircle } from 'lucide-react';

interface BioData {
  nome: string;
  tipo: 'cliente' | 'concorrente';
  bio_texto: string;
  cta_principal?: string;
  link_bio?: string;
  elementos_destaque: string[];
  pontos_fortes: string[];
  pontos_fracos: string[];
  score_otimizacao: number;
}

interface Props {
  bios: BioData[];
}

export function ComparativoBio({ bios }: Props) {
  const bioCliente = bios.find(b => b.tipo === 'cliente');
  const biosConcorrentes = bios.filter(b => b.tipo === 'concorrente');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
    return 'text-red-400 bg-red-900/30 border-red-500/30';
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-6 text-center">Comparativo de Bio e CTA</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bio do Cliente */}
        {bioCliente && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Você
              </h4>
              <div className={`px-3 py-1 rounded border ${getScoreColor(bioCliente.score_otimizacao)}`}>
                <span className="text-sm font-bold">{bioCliente.score_otimizacao}/100</span>
              </div>
            </div>

            {/* Bio Texto */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 min-h-[100px]">
              <p className="text-sm text-white italic">"{bioCliente.bio_texto}"</p>
            </div>

            {/* CTA e Link */}
            {bioCliente.cta_principal && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-300 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Call to Action
                </p>
                <p className="text-sm font-semibold text-white">{bioCliente.cta_principal}</p>
                {bioCliente.link_bio && (
                  <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    {bioCliente.link_bio}
                  </p>
                )}
              </div>
            )}

            {/* Elementos de Destaque */}
            {bioCliente.elementos_destaque.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Elementos de Destaque</p>
                <div className="flex flex-wrap gap-2">
                  {bioCliente.elementos_destaque.map((elem, idx) => (
                    <span key={idx} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                      {elem}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pontos Fortes */}
            <div className="mb-3">
              <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Pontos Fortes
              </p>
              <ul className="space-y-1">
                {bioCliente.pontos_fortes.map((ponto, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {ponto}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pontos Fracos */}
            {bioCliente.pontos_fracos.length > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Pontos a Melhorar
                </p>
                <ul className="space-y-1">
                  {bioCliente.pontos_fracos.map((ponto, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {ponto}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Bios dos Concorrentes */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-purple-400">Concorrentes</h4>
          {biosConcorrentes.slice(0, 3).map((bio, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/30 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-gray-300">{bio.nome}</h5>
                <div className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(bio.score_otimizacao)}`}>
                  {bio.score_otimizacao}/100
                </div>
              </div>

              <div className="bg-gray-900/50 rounded p-3 mb-3">
                <p className="text-xs text-gray-300 italic line-clamp-3">"{bio.bio_texto}"</p>
              </div>

              {bio.cta_principal && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2 mb-2">
                  <p className="text-xs text-purple-300">CTA: {bio.cta_principal}</p>
                </div>
              )}

              {bio.elementos_destaque.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bio.elementos_destaque.slice(0, 3).map((elem, i) => (
                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                      {elem}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recomendações */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Recomendações:</strong> {bioCliente && bioCliente.score_otimizacao < 70 
            ? 'Otimize sua bio incluindo um CTA claro, emojis estratégicos e um link de conversão.'
            : 'Sua bio está bem otimizada! Continue testando variações de CTA para maximizar conversões.'}
        </p>
      </div>
    </div>
  );
}
