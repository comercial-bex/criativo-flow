import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Acao {
  titulo: string;
  urgencia: 'alta' | 'baixa';
  importancia: 'alta' | 'baixa';
}

interface Props {
  acoes: Acao[];
}

export function MatrizPriorizacao({ acoes }: Props) {
  const getQuadrante = (acao: Acao) => {
    if (acao.urgencia === 'alta' && acao.importancia === 'alta') return 'critico';
    if (acao.urgencia === 'baixa' && acao.importancia === 'alta') return 'estrategico';
    if (acao.urgencia === 'alta' && acao.importancia === 'baixa') return 'urgente';
    return 'eliminar';
  };

  const criticas = acoes.filter(a => getQuadrante(a) === 'critico');
  const estrategicas = acoes.filter(a => getQuadrante(a) === 'estrategico');
  const urgentes = acoes.filter(a => getQuadrante(a) === 'urgente');
  const eliminar = acoes.filter(a => getQuadrante(a) === 'eliminar');

  const QuadranteCard = ({ 
    titulo, 
    descricao, 
    acoes, 
    cor, 
    icone: Icone 
  }: { 
    titulo: string; 
    descricao: string; 
    acoes: Acao[]; 
    cor: string; 
    icone: any;
  }) => (
    <div className={`p-4 rounded-lg border-2 ${cor} bg-black/30 backdrop-blur-sm min-h-[200px] flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <Icone className="w-5 h-5" />
        <h4 className="font-bold text-white">{titulo}</h4>
      </div>
      <p className="text-xs text-gray-400 mb-4">{descricao}</p>
      <div className="space-y-2 flex-1">
        {acoes.map((acao, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-2 bg-white/5 rounded border border-white/10 text-sm text-gray-200"
          >
            {acao.titulo}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-6 border border-red-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">🎯 Matriz de Priorização (Eisenhower)</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Urgente vs. Importante - Onde focar primeiro?</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Quadrante 1: CRÍTICO (Urgente + Importante) */}
        <QuadranteCard
          titulo="🚨 Fazer Agora"
          descricao="Urgente E Importante - Prioridade máxima"
          acoes={criticas}
          cor="border-red-500/50 bg-red-500/10"
          icone={AlertCircle}
        />

        {/* Quadrante 2: ESTRATÉGICO (Não urgente + Importante) */}
        <QuadranteCard
          titulo="📅 Planejar"
          descricao="Importante mas NÃO urgente - Agendar"
          acoes={estrategicas}
          cor="border-blue-500/50 bg-blue-500/10"
          icone={TrendingUp}
        />

        {/* Quadrante 3: URGENTE (Urgente + Não importante) */}
        <QuadranteCard
          titulo="⏱️ Delegar"
          descricao="Urgente mas NÃO importante - Delegar/Automatizar"
          acoes={urgentes}
          cor="border-yellow-500/50 bg-yellow-500/10"
          icone={Clock}
        />

        {/* Quadrante 4: ELIMINAR (Não urgente + Não importante) */}
        <QuadranteCard
          titulo="❌ Eliminar"
          descricao="NÃO urgente E NÃO importante - Descartar"
          acoes={eliminar}
          cor="border-gray-500/50 bg-gray-500/10"
          icone={CheckCircle}
        />
      </div>

      <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-sm text-red-300 text-center">
          <strong>Regra de Ouro:</strong> Foque 70% do tempo no quadrante "Fazer Agora" e 25% no "Planejar"
        </p>
      </div>
    </motion.div>
  );
}
