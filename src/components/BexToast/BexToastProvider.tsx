import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { BexToastContainer } from "./BexToastContainer";
import { Toast, ToastOptions } from "./types";
import { LucideIcon } from "lucide-react";
import { setToastInstance } from "./helpers";
import { toastSoundManager } from "./sounds";

interface BexToastContextType {
  showToast: (options: ToastOptions) => string;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  setPosition: (position: BexToastContextType["position"]) => void;
  maxVisible: number;
  setMaxVisible: (max: number) => void;
  queuedCount: number;
  // Sound controls
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  testSound: (variant?: any) => void;
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

// Peso das prioridades para ordenação
const priorityWeight = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export function BexToastProvider({ children }: { children: ReactNode }) {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);
  const [queuedToasts, setQueuedToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<BexToastContextType["position"]>("top-right");
  const [maxVisible, setMaxVisible] = useState(3); // Máximo de toasts visíveis simultaneamente
  const [soundEnabled, setSoundEnabledState] = useState(toastSoundManager.isEnabled());
  const [soundVolume, setSoundVolumeState] = useState(toastSoundManager.getVolume());

  // Sincronizar estado com sound manager
  const setSoundEnabled = useCallback((enabled: boolean) => {
    toastSoundManager.setEnabled(enabled);
    setSoundEnabledState(enabled);
  }, []);

  const setSoundVolume = useCallback((volume: number) => {
    toastSoundManager.setVolume(volume);
    setSoundVolumeState(volume);
  }, []);

  const testSound = useCallback((variant?: any) => {
    toastSoundManager.testSound(variant);
  }, []);

  // Processar queue quando há espaço
  useEffect(() => {
    if (visibleToasts.length < maxVisible && queuedToasts.length > 0) {
      // Ordenar por prioridade (maior primeiro) e então por timestamp
      const sorted = [...queuedToasts].sort((a, b) => {
        const priorityDiff = priorityWeight[b.priority || "normal"] - priorityWeight[a.priority || "normal"];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp; // FIFO para mesma prioridade
      });

      const toShow = sorted.slice(0, maxVisible - visibleToasts.length);
      const remaining = sorted.slice(maxVisible - visibleToasts.length);

      setVisibleToasts((prev) => [...prev, ...toShow]);
      setQueuedToasts(remaining);
    }
  }, [visibleToasts.length, queuedToasts.length, maxVisible]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const priority = options.priority || "normal";
    
    const toast: Toast = {
      id,
      ...options,
      priority,
      timestamp: Date.now(),
    };

    // Tocar som de notificação
    toastSoundManager.play(options.variant, options.priority);

    // Toasts críticos sempre aparecem imediatamente, removendo o toast mais antigo se necessário
    if (priority === "critical") {
      setVisibleToasts((prev) => {
        const newToasts = [...prev, toast];
        // Se exceder o limite, remover o toast de menor prioridade (ou mais antigo)
        if (newToasts.length > maxVisible) {
          const sorted = newToasts.sort((a, b) => {
            const priorityDiff = priorityWeight[a.priority || "normal"] - priorityWeight[b.priority || "normal"];
            if (priorityDiff !== 0) return priorityDiff;
            return a.timestamp - b.timestamp;
          });
          return sorted.slice(1); // Remove o primeiro (menor prioridade/mais antigo)
        }
        return newToasts;
      });
    } else if (visibleToasts.length < maxVisible) {
      setVisibleToasts((prev) => [...prev, toast]);
    } else {
      setQueuedToasts((prev) => [...prev, toast]);
    }

    return id;
  }, [visibleToasts.length, maxVisible]);

  const closeToast = useCallback((id: string) => {
    setVisibleToasts((prev) => prev.filter((toast) => toast.id !== id));
    setQueuedToasts((prev) => prev.filter((toast) => toast.id !== id));
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
    setVisibleToasts((prev) => 
      prev.map((toast) => 
        toast.id === id 
          ? { ...toast, ...options, timestamp: toast.timestamp } // Manter timestamp original
          : toast
      )
    );
    setQueuedToasts((prev) => 
      prev.map((toast) => 
        toast.id === id 
          ? { ...toast, ...options, timestamp: toast.timestamp }
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
    maxVisible,
    setMaxVisible,
    queuedCount: queuedToasts.length,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    testSound,
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
      <BexToastContainer toasts={visibleToasts} position={position} onClose={closeToast} />
      
      {/* Indicador de queue (opcional) */}
      {queuedToasts.length > 0 && (
        <div className="fixed bottom-4 left-4 z-[101] pointer-events-none">
          <div className="bg-card/90 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-muted-foreground">
              +{queuedToasts.length} notificação{queuedToasts.length > 1 ? "ões" : ""} na fila
            </p>
          </div>
        </div>
      )}
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
