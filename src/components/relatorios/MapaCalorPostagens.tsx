import { motion } from 'framer-motion';

interface MapaCalorData {
  cliente: number[][];
  concorrente: number[][];
}

interface Props {
  dados: MapaCalorData;
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const horarios = ['6h', '9h', '12h', '15h', '18h', '21h'];

export function MapaCalorPostagens({ dados }: Props) {
  const getColor = (valor: number) => {
    if (valor === 0) return 'bg-gray-800';
    if (valor <= 2) return 'bg-yellow-900/50';
    if (valor <= 5) return 'bg-orange-600/50';
    return 'bg-green-500/50';
  };

  const getIntensidade = (valor: number) => {
    return Math.min(valor / 10, 1);
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-6 text-center">Mapa de Calor de Postagens</h3>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Cliente */}
        <div>
          <h4 className="text-sm font-semibold text-blue-400 mb-4 text-center">Você</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-12"></div>
              {horarios.map((h, idx) => (
                <div key={idx} className="w-12 text-center text-xs text-gray-400">{h}</div>
              ))}
            </div>
            {diasSemana.map((dia, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-12 text-xs text-gray-400">{dia}</div>
                {dados.cliente[i]?.map((valor, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * 6 + j) * 0.01 }}
                    className={`w-12 h-12 rounded ${getColor(valor)} flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform`}
                    style={{ opacity: getIntensidade(valor) }}
                    title={`${dia} ${horarios[j]}: ${valor} posts`}
                  >
                    {valor > 0 ? valor : ''}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Melhor Concorrente */}
        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-4 text-center">Melhor Concorrente</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-12"></div>
              {horarios.map((h, idx) => (
                <div key={idx} className="w-12 text-center text-xs text-gray-400">{h}</div>
              ))}
            </div>
            {diasSemana.map((dia, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-12 text-xs text-gray-400">{dia}</div>
                {dados.concorrente[i]?.map((valor, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * 6 + j) * 0.01 }}
                    className={`w-12 h-12 rounded ${getColor(valor)} flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform`}
                    style={{ opacity: getIntensidade(valor) }}
                    title={`${dia} ${horarios[j]}: ${valor} posts`}
                  >
                    {valor > 0 ? valor : ''}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="text-xs text-gray-400">Frequência:</span>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-800 rounded"></div>
            <span className="text-xs text-gray-400">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-900/50 rounded"></div>
            <span className="text-xs text-gray-400">1-2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-600/50 rounded"></div>
            <span className="text-xs text-gray-400">3-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500/50 rounded"></div>
            <span className="text-xs text-gray-400">6+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
