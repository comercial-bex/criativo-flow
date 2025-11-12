// Funções auxiliares para TabelaPlanoEditorial

export const getCreativeColor = (formato: string): string => {
  const colorMap: Record<string, string> = {
    reels: 'bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/20 text-blue-700 border-blue-400/50 shadow-sm',
    card: 'bg-gradient-to-br from-slate-500/20 via-gray-500/15 to-slate-600/20 text-gray-700 border-gray-400/50 shadow-sm',
    carrossel: 'bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-purple-600/20 text-purple-700 border-purple-400/50 shadow-sm',
    motion: 'bg-gradient-to-br from-orange-500/20 via-red-500/15 to-orange-600/20 text-orange-700 border-orange-400/50 shadow-sm',
    story: 'bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-pink-600/20 text-pink-700 border-pink-400/50 shadow-sm',
    post: 'bg-gradient-to-br from-cyan-500/20 via-teal-500/15 to-cyan-600/20 text-cyan-700 border-cyan-400/50 shadow-sm',
    outro: 'bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-teal-600/20 text-teal-700 border-teal-400/50 shadow-sm',
  };
  
  return colorMap[formato?.toLowerCase()] || colorMap.outro;
};

export const getCreativeIcon = (formato: string) => {
  const icons: Record<string, string> = {
    reels: '🎥',
    card: '🖼️',
    carrossel: '🧩',
    motion: '🎞️',
    story: '📸',
    post: '📱',
    outro: '📢',
  };
  return icons[formato?.toLowerCase()] || icons.outro;
};

export const getTipoConteudoColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    informar: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-400/50 dark:text-blue-300',
    inspirar: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-400/50 dark:text-purple-300',
    entreter: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-700 border-yellow-400/50 dark:text-yellow-300',
    vender: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-400/50 dark:text-green-300',
    posicionar: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-700 border-indigo-400/50 dark:text-indigo-300',
  };
  return colors[tipo?.toLowerCase()] || colors.informar;
};

export const getTipoConteudoIcon = (tipo: string): string => {
  const icons: Record<string, string> = {
    informar: '💡',
    inspirar: '✨',
    entreter: '🎭',
    vender: '💰',
    posicionar: '🎯',
  };
  return icons[tipo?.toLowerCase()] || '💡';
};

export const getTipoConteudoDescricao = (tipo: string): string => {
  const descricoes: Record<string, string> = {
    informar: 'Trazer conhecimento',
    inspirar: 'Gerar conexão emocional',
    entreter: 'Criar vínculo leve',
    vender: 'Converter ou gerar leads',
    posicionar: 'Reforçar identidade da marca',
  };
  return descricoes[tipo?.toLowerCase()] || '';
};

export const getObjetivoColor = (objetivo: string) => {
  const colors: Record<string, string> = {
    humanizar: 'bg-pink-100 text-pink-700 border-pink-300',
    educar: 'bg-blue-100 text-blue-700 border-blue-300',
    resolver: 'bg-green-100 text-green-700 border-green-300',
    entreter: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    converter: 'bg-red-100 text-red-700 border-red-300',
    engajamento: 'bg-purple-100 text-purple-700 border-purple-300',
    awareness: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    relacionamento: 'bg-orange-100 text-orange-700 border-orange-300',
    educacao: 'bg-blue-100 text-blue-700 border-blue-300',
    conversao: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[objetivo?.toLowerCase()] || colors.educar;
};

export const formatarDataPorExtenso = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  const diaSemana = diasSemana[date.getDay()];
  
  return `${diaSemana} – ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
};
