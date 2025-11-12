/**
 * Toast Compatibility Layer
 * Wrapper para migração gradual de sonner para BexToast
 * 
 * IMPORTANTE: Este é um wrapper temporário.
 * Idealmente, todos os componentes devem usar useBexToast() diretamente.
 * 
 * Para usar:
 * import { toast } from '@/lib/toast-compat';
 * 
 * toast.success('Mensagem de sucesso');
 * toast.error('Erro');
 * toast.warning('Aviso');
 * toast.info('Informação');
 */

// Este módulo NÃO pode importar React hooks diretamente
// Ele cria um sistema de eventos que o BexToastProvider escuta

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'critical';

interface ToastEvent {
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  id?: string; // Para suporte a dismiss/update
}

class ToastCompat {
  private listeners: ((event: ToastEvent) => void)[] = [];
  private activeToasts: Map<string, string> = new Map(); // id -> internalId

  subscribe(listener: (event: ToastEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: ToastEvent) {
    this.listeners.forEach(listener => listener(event));
    if (event.id) {
      this.activeToasts.set(event.id, event.id);
    }
  }

  success(message: string, options?: { description?: string; duration?: number; id?: string }) {
    this.emit({
      type: 'success',
      message,
      description: options?.description,
      duration: options?.duration || 3000,
      id: options?.id,
    });
  }

  error(message: string, options?: { description?: string; duration?: number; id?: string }) {
    this.emit({
      type: 'error',
      message,
      description: options?.description,
      duration: options?.duration || 5000,
      id: options?.id,
    });
  }

  warning(message: string, options?: { description?: string; duration?: number; id?: string }) {
    this.emit({
      type: 'warning',
      message,
      description: options?.description,
      duration: options?.duration || 4000,
      id: options?.id,
    });
  }

  info(message: string, options?: { description?: string; duration?: number; id?: string }) {
    this.emit({
      type: 'info',
      message,
      description: options?.description,
      duration: options?.duration || 3000,
      id: options?.id,
    });
  }

  loading(message: string, options?: { description?: string; id?: string }) {
    this.emit({
      type: 'info', // loading vira info visual
      message: `⏳ ${message}`,
      description: options?.description,
      duration: 99999999, // Muito longo até ser dismissed
      id: options?.id,
    });
  }

  dismiss(id?: string) {
    // Nota: este método não faz nada no compat layer
    // O BexToast vai gerenciar o dismiss automaticamente por duration
    if (id) {
      this.activeToasts.delete(id);
    }
  }
}

export const toast = new ToastCompat();
export type { ToastEvent };
