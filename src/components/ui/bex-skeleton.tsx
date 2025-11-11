import { cn } from "@/lib/utils";

interface BexSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
}

export function BexSkeleton({ 
  className, 
  variant = "default",
  ...props 
}: BexSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-muted via-muted/50 to-muted",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-bex/10 before:to-transparent",
        "before:animate-shimmer",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-md",
        variant === "default" && "rounded-md",
        className
      )}
      style={{
        backgroundSize: '200% 100%',
      }}
      {...props}
    />
  );
}
