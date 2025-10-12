import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bexButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        bex: "bg-bex text-white hover:bg-bex-dark shadow-lg shadow-bex/20 hover:shadow-xl hover:shadow-bex/40 hover:-translate-y-0.5",
        bexGaming: "relative bg-gradient-to-r from-bex via-bex-light to-bex-dark text-white shadow-xl shadow-bex/30 hover:shadow-2xl hover:shadow-bex/50 hover:-translate-y-1 overflow-hidden before:absolute before:inset-0 before:bg-white/10 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        bexOutline: "border-2 border-bex text-bex hover:bg-bex hover:text-white shadow-sm shadow-bex/10 hover:shadow-lg hover:shadow-bex/30",
        bexGhost: "text-bex hover:bg-bex/10 hover:text-bex-dark",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BexButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof bexButtonVariants> {
  asChild?: boolean;
}

const BexButton = React.forwardRef<HTMLButtonElement, BexButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(bexButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BexButton.displayName = "BexButton";

export { BexButton, bexButtonVariants };
