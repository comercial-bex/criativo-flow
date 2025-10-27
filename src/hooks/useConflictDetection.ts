import { useMemo } from 'react';
import { EventoUnificado } from './useCalendarioUnificado';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Conflito {
  responsavel: string;
  responsavel_id: string;
  eventos: EventoUnificado[];
  tipo: 'sobreposicao' | 'sobrecarga';
  severidade: 'alta' | 'media' | 'baixa';
  dia?: string;
  quantidade?: number;
  mensagem: string;
}

export const useConflictDetection = (eventos: EventoUnificado[]) => {
  const conflitos = useMemo(() => {
    const conflicts: Conflito[] = [];

    // Agrupar eventos por responsável
    const eventosPorResponsavel: Record<string, EventoUnificado[]> = {};
    
    eventos.forEach(evento => {
      if (!evento.responsavel_id) return;
      
      const key = evento.responsavel_id;
      if (!eventosPorResponsavel[key]) {
        eventosPorResponsavel[key] = [];
      }
      eventosPorResponsavel[key].push(evento);
    });

    // Verificar conflitos para cada responsável
    Object.entries(eventosPorResponsavel).forEach(([responsavelId, eventosResp]) => {
      // Ordenar por data de início
      const sortedEventos = [...eventosResp].sort((a, b) => 
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );

      // 1. Detectar sobreposição de horários
      for (let i = 0; i < sortedEventos.length - 1; i++) {
        const current = sortedEventos[i];
        const next = sortedEventos[i + 1];
        
        const currentEnd = new Date(current.data_fim);
        const nextStart = new Date(next.data_inicio);

        if (currentEnd > nextStart) {
          conflicts.push({
            responsavel: current.responsavel?.nome || 'Sem nome',
            responsavel_id: responsavelId,
            eventos: [current, next],
            tipo: 'sobreposicao',
            severidade: 'alta',
            mensagem: `Conflito de horário entre "${current.titulo}" e "${next.titulo}"`
          });
        }
      }

      // 2. Detectar sobrecarga diária (>3 eventos no mesmo dia)
      const eventosPorDia: Record<string, EventoUnificado[]> = {};
      
      sortedEventos.forEach(evento => {
        const dia = format(parseISO(evento.data_inicio), 'yyyy-MM-dd');
        if (!eventosPorDia[dia]) {
          eventosPorDia[dia] = [];
        }
        eventosPorDia[dia].push(evento);
      });

      Object.entries(eventosPorDia).forEach(([dia, eventosNoDia]) => {
        if (eventosNoDia.length > 3) {
          conflicts.push({
            responsavel: eventosNoDia[0].responsavel?.nome || 'Sem nome',
            responsavel_id: responsavelId,
            eventos: eventosNoDia,
            tipo: 'sobrecarga',
            severidade: eventosNoDia.length > 5 ? 'alta' : 'media',
            dia,
            quantidade: eventosNoDia.length,
            mensagem: `${eventosNoDia.length} eventos em ${format(parseISO(dia), "d 'de' MMMM", { locale: ptBR })}`
          });
        }
      });
    });

    return conflicts;
  }, [eventos]);

  const conflitosAlta = conflitos.filter(c => c.severidade === 'alta');
  const conflitosMedia = conflitos.filter(c => c.severidade === 'media');
  const hasConflitos = conflitos.length > 0;

  return {
    conflitos,
    conflitosAlta,
    conflitosMedia,
    hasConflitos,
    totalConflitos: conflitos.length
  };
};
