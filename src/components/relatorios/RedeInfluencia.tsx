import { motion } from 'framer-motion';
import { Users, UserPlus, TrendingUp } from 'lucide-react';

interface Conexao {
  nome: string;
  tipo: 'influencer' | 'parceiro' | 'mencao';
  forca: number; // 1-10
}

interface Props {
  cliente: string;
  conexoes: Conexao[];
}

export function RedeInfluencia({ cliente, conexoes }: Props) {
  const getTipoCor = (tipo: Conexao['tipo']) => {
    switch (tipo) {
      case 'influencer': return 'text-purple-400 border-purple-500/50';
      case 'parceiro': return 'text-blue-400 border-blue-500/50';
      case 'mencao': return 'text-green-400 border-green-500/50';
    }
  };

  const getTipoIcone = (tipo: Conexao['tipo']) => {
    const className = "w-4 h-4";
    switch (tipo) {
      case 'influencer': return <TrendingUp className={className} />;
      case 'parceiro': return <UserPlus className={className} />;
      case 'mencao': return <Users className={className} />;
    }
  };

  // Separar por força (top 3, médio, baixo)
  const topConexoes = conexoes.filter(c => c.forca >= 7).slice(0, 3);
  const medioConexoes = conexoes.filter(c => c.forca >= 4 && c.forca < 7).slice(0, 5);
  const baixoConexoes = conexoes.filter(c => c.forca < 4).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-lg p-6 border border-violet-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-2 text-center">🤝 Rede de Influência e Conexões</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">Mapeamento de menções, parcerias e influenciadores</p>
      
      <div className="relative min-h-[400px] flex items-center justify-center">
        {/* Cliente no centro */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute z-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center font-bold text-center p-2 shadow-xl shadow-blue-500/50 border-4 border-blue-300"
        >
          <span className="text-xs leading-tight">{cliente}</span>
        </motion.div>

        {/* Camada 1: Top conexões (mais próximas) */}
        <div className="absolute w-full h-full">
          {topConexoes.map((conexao, idx) => {
            const angle = (360 / topConexoes.length) * idx;
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={`top-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${getTipoCor(conexao.tipo)} border-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-1 shadow-lg`}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                {getTipoIcone(conexao.tipo)}
                {conexao.nome}
              </motion.div>
            );
          })}
        </div>

        {/* Camada 2: Médias conexões */}
        <div className="absolute w-full h-full">
          {medioConexoes.map((conexao, idx) => {
            const angle = (360 / medioConexoes.length) * idx + 20;
            const radius = 200;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={`medio-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + idx * 0.08 }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${getTipoCor(conexao.tipo)} border bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-medium flex items-center gap-1 opacity-80`}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                {getTipoIcone(conexao.tipo)}
                {conexao.nome}
              </motion.div>
            );
          })}
        </div>

        {/* Camada 3: Baixas conexões (mais distantes) */}
        <div className="absolute w-full h-full">
          {baixoConexoes.map((conexao, idx) => {
            const angle = (360 / baixoConexoes.length) * idx - 15;
            const radius = 270;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={`baixo-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1 + idx * 0.06 }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${getTipoCor(conexao.tipo)} border bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 text-[9px] flex items-center gap-1 opacity-60`}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                {conexao.nome}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">Influenciadores</span>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">Parceiros</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">Menções</span>
        </div>
      </div>
    </motion.div>
  );
}
