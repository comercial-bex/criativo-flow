// Funções auxiliares para TabelaPlanoEditorial

export const getCreativeColor = (formato: string) => {
  const colors: Record<string, string> = {
    reels: 'bg-blue-100 text-blue-700 border-blue-300',
    card: 'bg-gray-100 text-gray-700 border-gray-300',
    carrossel: 'bg-purple-100 text-purple-700 border-purple-300',
    motion: 'bg-orange-100 text-orange-700 border-orange-300',
    story: 'bg-pink-100 text-pink-700 border-pink-300',
    post: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    outro: 'bg-teal-100 text-teal-700 border-teal-300',
  };
  return colors[formato?.toLowerCase()] || colors.outro;
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
