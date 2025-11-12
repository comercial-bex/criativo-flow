import { ToastOptions } from "./types";

/**
 * Helper standalone para usar toasts sem precisar do hook
 * Útil para usar em funções utilitárias, callbacks, etc.
 * 
 * IMPORTANTE: Só funciona se BexToastProvider estiver montado!
 */

let toastInstance: {
  success: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  loading: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  update: (id: string, options: ToastOptions) => void;
  dismiss: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => Promise<T>;
} | null = null;

export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance;
}

/**
 * Helper para toasts rápidos
 * 
 * Uso:
 * ```typescript
 * toast.success("Salvo com sucesso!");
 * toast.error("Erro ao salvar", "Tente novamente");
 * 
 * const loadingId = toast.loading("Salvando...");
 * // ... depois
 * toast.update(loadingId, { title: "Salvo!", variant: "success" });
 * toast.dismiss(loadingId);
 * ```
 */
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastOptions>) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return "";
    }
    return toastInstance.success(title, description, options) || "";
  },
  
  error: (title: string, description?: string, options?: Partial<ToastOptions>) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return "";
    }
    return toastInstance.error(title, description, options) || "";
  },
  
  warning: (title: string, description?: string, options?: Partial<ToastOptions>) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return "";
    }
    return toastInstance.warning(title, description, options) || "";
  },
  
  info: (title: string, description?: string, options?: Partial<ToastOptions>) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return "";
    }
    return toastInstance.info(title, description, options) || "";
  },
  
  loading: (title: string, description?: string, options?: Partial<ToastOptions>) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return "";
    }
    return toastInstance.loading(title, description, options);
  },
  
  update: (id: string, options: ToastOptions) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return;
    }
    toastInstance.update(id, options);
  },
  
  dismiss: (id: string) => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return;
    }
    toastInstance.dismiss(id);
  },

  /**
   * Helper para promises - mostra loading, depois success ou error
   * 
   * Uso:
   * ```typescript
   * await toast.promise(
   *   saveData(),
   *   {
   *     loading: "Salvando dados...",
   *     success: "Dados salvos com sucesso!",
   *     error: "Erro ao salvar dados"
   *   }
   * );
   * ```
   */
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    if (!toastInstance) {
      console.warn("BexToast: Provider não está montado!");
      return promise;
    }

    const loadingId = toastInstance.loading(messages.loading);

    try {
      const data = await promise;
      const successMessage = typeof messages.success === "function" 
        ? messages.success(data) 
        : messages.success;
      
      toastInstance.update(loadingId, {
        title: successMessage,
        variant: "success",
        duration: 5000,
      });
      
      return data;
    } catch (error) {
      const errorMessage = typeof messages.error === "function" 
        ? messages.error(error) 
        : messages.error;
      
      toastInstance.update(loadingId, {
        title: errorMessage,
        variant: "error",
        duration: 7000,
      });
      
      throw error;
    }
  },
};
