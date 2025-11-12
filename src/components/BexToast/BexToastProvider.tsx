import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { BexToastContainer } from "./BexToastContainer";
import { Toast, ToastOptions } from "./types";
import { LucideIcon } from "lucide-react";
import { setToastInstance } from "./helpers";

interface BexToastContextType {
  showToast: (options: ToastOptions) => string;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  setPosition: (position: BexToastContextType["position"]) => void;
  // Helper functions
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
}

const BexToastContext = createContext<BexToastContextType | undefined>(undefined);

export function BexToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<BexToastContextType["position"]>("top-right");

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = {
      id,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper: Success toast
  const success = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      title,
      description,
      variant: "success",
      ...options,
    });
  }, [showToast]);

  // Helper: Error toast
  const error = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      title,
      description,
      variant: "error",
      duration: 7000, // Erros ficam mais tempo
      ...options,
    });
  }, [showToast]);

  // Helper: Warning toast
  const warning = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      title,
      description,
      variant: "warning",
      ...options,
    });
  }, [showToast]);

  // Helper: Info toast
  const info = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      title,
      description,
      variant: "info",
      ...options,
    });
  }, [showToast]);

  // Helper: Loading toast (retorna ID para poder atualizar depois)
  const loading = useCallback((title: string, description?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      title,
      description,
      variant: "info",
      duration: 999999, // Não fecha automaticamente
      ...options,
    });
  }, [showToast]);

  // Helper: Update toast existente
  const update = useCallback((id: string, options: ToastOptions) => {
    setToasts((prev) => 
      prev.map((toast) => 
        toast.id === id 
          ? { ...toast, ...options }
          : toast
      )
    );
  }, []);

  // Helper: Dismiss toast específico
  const dismiss = useCallback((id: string) => {
    closeToast(id);
  }, [closeToast]);

  // Helper: Promise toast
  const promise = useCallback(async <T,>(
    promiseToResolve: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const loadingId = loading(messages.loading);

    try {
      const data = await promiseToResolve;
      const successMessage = typeof messages.success === "function" 
        ? messages.success(data) 
        : messages.success;
      
      update(loadingId, {
        title: successMessage,
        variant: "success",
        duration: 5000,
      });
      
      return data;
    } catch (error) {
      const errorMessage = typeof messages.error === "function" 
        ? messages.error(error) 
        : messages.error;
      
      update(loadingId, {
        title: errorMessage,
        variant: "error",
        duration: 7000,
      });
      
      throw error;
    }
  }, [loading, update]);

  const contextValue = {
    showToast, 
    position, 
    setPosition,
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    promise
  };

  // Configurar instância global para helpers standalone
  useEffect(() => {
    setToastInstance(contextValue);
  }, [contextValue]);

  return (
    <BexToastContext.Provider value={contextValue}>
      {children}
      <BexToastContainer toasts={toasts} position={position} onClose={closeToast} />
    </BexToastContext.Provider>
  );
}

export function useBexToast() {
  const context = useContext(BexToastContext);
  if (!context) {
    throw new Error("useBexToast must be used within BexToastProvider");
  }
  return context;
}
