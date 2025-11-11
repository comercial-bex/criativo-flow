import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { BexToastContainer } from "./BexToastContainer";
import { Toast, ToastOptions } from "./types";

interface BexToastContextType {
  showToast: (options: ToastOptions) => void;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  setPosition: (position: BexToastContextType["position"]) => void;
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
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <BexToastContext.Provider value={{ showToast, position, setPosition }}>
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
