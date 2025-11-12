import { LucideIcon } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";
export type ToastPriority = "critical" | "high" | "normal" | "low";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  priority?: ToastPriority;
  duration?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  priority?: ToastPriority;
  duration?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}
