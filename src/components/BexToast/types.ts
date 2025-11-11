import { LucideIcon } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}
