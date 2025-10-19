import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target } from 'lucide-react';

interface ROIData {
  cenario: string;
  investimento: number;
  retorno_estimado: number;
  roi_percent: number;
  prazo_meses: number;
}

interface Props {
  cenarios: ROIData[];
  valorPorSeguidor: number;
  custoAquisicaoOrganico: number;
  custoAquisicaoPago: number;
}

export function ROIPotencial({ cenarios, valorPorSeguidor, custoAquisicaoOrganico, custoAquisicaoPago }: Props) {
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="w-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-6 border border-emerald-500/20">
      <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
        <DollarSign className="w-5 h-5" />
        Projeção de ROI Potencial
      </h3>

      {/* Métricas Base */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-center"
        >
          <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 mb-1">Valor por Seguidor</p>
          <p className="text-2xl font-bold text-blue-400">R$ {valorPorSeguidor.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
          className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-center"
        >
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 mb-1">CAC Orgânico</p>
          <p className="text-2xl font-bold text-green-400">R$ {custoAquisicaoOrganico.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
          className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center"
        >
          <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 mb-1">CAC Pago</p>
          <p className="text-2xl font-bold text-purple-400">R$ {custoAquisicaoPago.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Gráfico de ROI por Cenário */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={cenarios} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="cenario" 
            tick={{ fill: '#ffffff', fontSize: 11 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: '#ffffff80', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value: number) => `R$ ${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ color: '#ffffff', paddingTop: '20px' }} />
          <Bar dataKey="investimento" fill="#ef4444" name="Investimento" radius={[8, 8, 0, 0]} />
          <Bar dataKey="retorno_estimado" name="Retorno Estimado" radius={[8, 8, 0, 0]}>
            {cenarios.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detalhamento de Cenários */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Análise Detalhada por Cenário</h4>
        {cenarios.map((cenario, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-white">{cenario.cenario}</h5>
              <div className={`px-3 py-1 rounded text-sm font-bold ${
                cenario.roi_percent >= 200 ? 'bg-green-900/50 text-green-400' :
                cenario.roi_percent >= 100 ? 'bg-blue-900/50 text-blue-400' :
                'bg-yellow-900/50 text-yellow-400'
              }`}>
                ROI: {cenario.roi_percent}%
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Investimento</p>
                <p className="text-sm font-bold text-red-400">R$ {cenario.investimento.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Retorno</p>
                <p className="text-sm font-bold text-green-400">R$ {cenario.retorno_estimado.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Lucro Líquido</p>
                <p className="text-sm font-bold text-blue-400">
                  R$ {(cenario.retorno_estimado - cenario.investimento).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Prazo</p>
                <p className="text-sm font-bold text-purple-400">{cenario.prazo_meses} meses</p>
              </div>
            </div>

            {/* Barra de ROI */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">ROI Visual</span>
                <span className="text-xs font-bold text-white">{cenario.roi_percent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((cenario.roi_percent / 300) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-full ${
                    cenario.roi_percent >= 200 ? 'bg-green-500' :
                    cenario.roi_percent >= 100 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparação Orgânico vs Pago */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-green-400 mb-2">Estratégia Orgânica</h5>
          <p className="text-xs text-gray-300 mb-2">
            Crescimento natural com conteúdo de qualidade e engajamento.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Custo/seguidor</span>
            <span className="text-sm font-bold text-green-400">R$ {custoAquisicaoOrganico.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
            <span className="text-xs text-green-400 font-bold">85% eficiência</span>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-purple-400 mb-2">Estratégia Paga</h5>
          <p className="text-xs text-gray-300 mb-2">
            Crescimento acelerado com anúncios segmentados.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Custo/seguidor</span>
            <span className="text-sm font-bold text-purple-400">R$ {custoAquisicaoPago.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '60%' }}></div>
            </div>
            <span className="text-xs text-purple-400 font-bold">60% eficiência</span>
          </div>
        </div>
      </div>

      {/* Recomendação Final */}
      <div className="mt-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
        <p className="text-sm text-emerald-300">
          <strong>💰 Recomendação:</strong> O melhor ROI está no cenário "{cenarios.reduce((a, b) => a.roi_percent > b.roi_percent ? a : b).cenario}" 
          com {cenarios.reduce((a, b) => a.roi_percent > b.roi_percent ? a : b).roi_percent}% de retorno em {cenarios.reduce((a, b) => a.roi_percent > b.roi_percent ? a : b).prazo_meses} meses.
        </p>
      </div>
    </div>
  );
}
