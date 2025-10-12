import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bexBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        bex: "border-transparent bg-bex text-white shadow-sm shadow-bex/20 hover:bg-bex-dark hover:shadow-md hover:shadow-bex/30",
        bexOutline: "border-bex text-bex hover:bg-bex/10",
        bexGlow: "border-bex/50 bg-bex/20 text-bex shadow-md shadow-bex/30 animate-pulse-glow",
        bexGaming: "border-transparent bg-gradient-to-r from-bex to-bex-light text-white shadow-lg shadow-bex/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BexBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bexBadgeVariants> {}

function BexBadge({ className, variant, ...props }: BexBadgeProps) {
  return <div className={cn(bexBadgeVariants({ variant }), className)} {...props} />;
}

export { BexBadge, bexBadgeVariants };
