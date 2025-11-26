import { ChecklistItem } from '@/types/tarefa';

// Checklist padrão para Design
export const CHECKLIST_DESIGN: ChecklistItem[] = [
  { id: 'layout', text: 'Layout aprovado internamente', completed: false },
  { id: 'ortografia', text: 'Revisão ortográfica feita', completed: false },
  { id: 'identidade', text: 'Aplicou identidade visual correta', completed: false },
  { id: 'exportar', text: 'Exportou arquivo em formato final (JPG/PNG/PDF)', completed: false },
  { id: 'editavel', text: 'Upload dos arquivos editáveis (PSD/AI/Figma)', completed: false },
];

// Checklist padrão para Gravação
export const CHECKLIST_GRAVACAO: ChecklistItem[] = [
  { id: 'baterias', text: 'Carregar baterias', completed: false },
  { id: 'cartoes', text: 'Cartões de memória ok', completed: false },
  { id: 'audio', text: 'Checar áudio (microfone / lapela)', completed: false },
  { id: 'foco', text: 'Testar foco / exposição', completed: false },
  { id: 'termo', text: 'Assinar termo de uso de imagem', completed: false },
];

// Checklist padrão para Edição
export const CHECKLIST_EDICAO: ChecklistItem[] = [
  { id: 'corte_bruto', text: 'Corte bruto pronto', completed: false },
  { id: 'ritmo', text: 'Refinado / ritmo ajustado', completed: false },
  { id: 'cor', text: 'Tratamento de cor', completed: false },
  { id: 'audio_edit', text: 'Tratamento de áudio', completed: false },
  { id: 'legendas', text: 'Legendas', completed: false },
  { id: 'render', text: 'Render final', completed: false },
  { id: 'upload', text: 'Upload no drive/sistema', completed: false },
];

// Função helper para aplicar checklist baseado no tipo de tarefa
export function getChecklistByType(tipo: string, executor_area?: string): ChecklistItem[] | null {
  // Design
  if (executor_area === 'Criativo' || tipo?.includes('design') || tipo?.includes('arte')) {
    return [...CHECKLIST_DESIGN];
  }
  
  // Audiovisual - Gravação
  if (executor_area === 'Audiovisual' && (tipo?.includes('captacao') || tipo?.includes('gravacao'))) {
    return [...CHECKLIST_GRAVACAO];
  }
  
  // Audiovisual - Edição
  if (executor_area === 'Audiovisual' && (tipo?.includes('edicao') || tipo?.includes('pos'))) {
    return [...CHECKLIST_EDICAO];
  }
  
  return null;
}
