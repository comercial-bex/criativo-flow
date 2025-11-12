import { useEffect, useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import { Toast, ToastVariant } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BexToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  {
    gradient: string;
    icon: typeof CheckCircle2;
    borderColor: string;
    iconColor: string;
  }
> = {
  success: {
    gradient: "from-bex-500/20 via-bex-600/10 to-transparent",
    icon: CheckCircle2,
    borderColor: "border-bex-500/30",
    iconColor: "text-bex-500",
  },
  error: {
    gradient: "from-red-500/20 via-red-600/10 to-transparent",
    icon: XCircle,
    borderColor: "border-red-500/30",
    iconColor: "text-red-500",
  },
  warning: {
    gradient: "from-orange-500/20 via-orange-600/10 to-transparent",
    icon: AlertTriangle,
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-500",
  },
  info: {
    gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
    icon: Info,
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-500",
  },
  default: {
    gradient: "from-gray-500/20 via-gray-600/10 to-transparent",
    icon: Sparkles,
    borderColor: "border-border",
    iconColor: "text-foreground",
  },
};

export const BexToastItem = forwardRef<HTMLDivElement, BexToastItemProps>(
  ({ toast, onClose }, ref) => {
    const [progress, setProgress] = useState(100);
    const variant = toast.variant || "default";
    const config = variantConfig[variant];
    const Icon = toast.icon || config.icon;
    const duration = toast.duration || 5000;

    useEffect(() => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          onClose(toast.id);
        }
      }, 50);

      return () => clearInterval(interval);
    }, [toast.id, duration, onClose]);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 40,
        }}
        className="pointer-events-auto w-[380px] max-w-[calc(100vw-2rem)]"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border backdrop-blur-xl",
            "bg-gradient-to-br shadow-2xl",
            config.gradient,
            config.borderColor,
            "dark:bg-card/90 bg-card/95"
          )}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          <div className="relative p-4">
            <div className="flex gap-3">
              {/* Icon with glow effect */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.1,
                }}
                className={cn("flex-shrink-0 mt-0.5", config.iconColor)}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-semibold text-sm text-foreground leading-tight"
                  >
                    {toast.title}
                  </motion.h3>
                  
                  {toast.count && toast.count > 1 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "min-w-[1.25rem] h-5 px-1.5 rounded-full",
                        "text-xs font-bold",
                        "bg-foreground/10 text-foreground",
                        "border border-border/50"
                      )}
                    >
                      {toast.count}
                    </motion.span>
                  )}
                </div>

                {toast.description && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-1 text-xs text-muted-foreground leading-snug"
                  >
                    {toast.description}
                  </motion.p>
                )}

                {toast.action && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-3"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.action?.onClick();
                        onClose(toast.id);
                      }}
                      className="h-7 text-xs"
                    >
                      {toast.action.label}
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => onClose(toast.id)}
                className={cn(
                  "flex-shrink-0 rounded-md p-1 transition-colors",
                  "hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            className={cn("h-1", config.iconColor.replace("text-", "bg-"))}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }
);

BexToastItem.displayName = "BexToastItem";
