import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: Date, formatStr: string) => {
  return format(date, formatStr, { locale: ptBR });
};

export const getDaysInMonth = (date: Date) => {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const getDaysInWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const getEmptyDaysForMonth = (date: Date) => {
  const startDate = startOfMonth(date);
  const firstDayOfWeek = getDay(startDate);
  return Array(firstDayOfWeek).fill(null);
};

export const getTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const isOverdue = (deadline?: string) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export const isUrgent = (deadline?: string) => {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - new Date().getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 && hours <= 24;
};

export const normalizeDateToLocal = (dateString: string): Date => {
  // Remove timezone e trata como horário local para evitar problemas de fuso
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
                  date.getHours(), date.getMinutes(), date.getSeconds());
};
