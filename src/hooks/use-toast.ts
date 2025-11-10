/**
 * DEPRECATED: Este arquivo é mantido apenas para compatibilidade temporária
 * Use @/lib/smart-toast ao invés de @/hooks/use-toast
 * 
 * Este wrapper redireciona todas as chamadas para smartToast
 */
import { smartToast } from '@/lib/smart-toast';

// Interface para suportar chamadas diretas: toast({ title, description })
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Função toast que pode ser chamada diretamente
function toastFunction(options: ToastOptions) {
  const message = options.title || '';
  const description = options.description;
  const duration = options.duration;
  
  if (options.variant === 'destructive') {
    return smartToast.error(message, description, duration);
  }
  return smartToast.success(message, description, duration);
}

// Adiciona métodos ao objeto toast
export const toast = Object.assign(toastFunction, {
  success: (message: string, options?: { description?: string; duration?: number }) => 
    smartToast.success(message, options?.description, options?.duration),
  
  error: (message: string, options?: { description?: string; duration?: number }) => 
    smartToast.error(message, options?.description, options?.duration),
  
  loading: (message: string, options?: { duration?: number }) => 
    smartToast.loading(message, options?.duration),
  
  info: (message: string, options?: { description?: string; duration?: number }) => 
    smartToast.info(message, options?.description, options?.duration),
  
  dismiss: (toastId?: string | number) => 
    smartToast.dismiss(toastId),
  
  promise: smartToast.promise,
});

// Hook para compatibilidade com código antigo
export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => smartToast.dismiss(toastId),
  };
}
