import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bexCardVariants = cva(
  "rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm hover:shadow-md",
        glass: "backdrop-blur-sm bg-white/5 dark:bg-black/30 border border-white/10 hover:border-bex/30",
        glow: "bg-card border border-bex/30 shadow-lg shadow-bex/20 hover:shadow-xl hover:shadow-bex/40 hover:-translate-y-1",
        gaming: "relative backdrop-blur-md bg-black/40 border border-bex/20 hover:border-bex/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BexCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bexCardVariants> {
  withGlow?: boolean;
}

const BexCard = React.forwardRef<HTMLDivElement, BexCardProps>(
  ({ className, variant, withGlow, children, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Glow effect for gaming variant */}
        {withGlow && variant === "gaming" && (
          <div className="absolute -inset-1 bg-gradient-to-r from-bex/30 via-bex-light/30 to-bex-dark/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
        )}
        
        <div
          ref={ref}
          className={cn(bexCardVariants({ variant }), className)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
BexCard.displayName = "BexCard";

const BexCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
BexCardHeader.displayName = "BexCardHeader";

const BexCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
BexCardTitle.displayName = "BexCardTitle";

const BexCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BexCardDescription.displayName = "BexCardDescription";

const BexCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
BexCardContent.displayName = "BexCardContent";

const BexCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
BexCardFooter.displayName = "BexCardFooter";

export { BexCard, BexCardHeader, BexCardFooter, BexCardTitle, BexCardDescription, BexCardContent };
