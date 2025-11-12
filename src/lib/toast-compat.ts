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
}

class ToastCompat {
  private listeners: ((event: ToastEvent) => void)[] = [];

  subscribe(listener: (event: ToastEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: ToastEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  success(message: string, options?: { description?: string; duration?: number }) {
    this.emit({
      type: 'success',
      message,
      description: options?.description,
      duration: options?.duration || 3000,
    });
  }

  error(message: string, options?: { description?: string; duration?: number }) {
    this.emit({
      type: 'error',
      message,
      description: options?.description,
      duration: options?.duration || 5000,
    });
  }

  warning(message: string, options?: { description?: string; duration?: number }) {
    this.emit({
      type: 'warning',
      message,
      description: options?.description,
      duration: options?.duration || 4000,
    });
  }

  info(message: string, options?: { description?: string; duration?: number }) {
    this.emit({
      type: 'info',
      message,
      description: options?.description,
      duration: options?.duration || 3000,
    });
  }
}

export const toast = new ToastCompat();
export type { ToastEvent };
