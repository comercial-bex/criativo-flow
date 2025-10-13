import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: "default" | "glass" | "gaming";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      variant === "default" && "bg-black/80",
      variant === "glass" && "backdrop-blur-md bg-black/50",
      variant === "gaming" && "backdrop-blur-lg bg-black/60",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const bexDialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-background border",
        glass: "backdrop-blur-sm bg-white/5 dark:bg-black/30 border border-white/10",
        gaming: "backdrop-blur-md bg-black/40 border border-bex/20 shadow-2xl shadow-bex/20",
      },
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        "2xl": "max-w-6xl",
        full: "max-w-7xl",
        screen: "max-w-[95vw]",
      },
      height: {
        auto: "",
        md: "max-h-[70vh]",
        lg: "max-h-[80vh]",
        xl: "max-h-[90vh]",
        full: "h-[95vh]",
      },
      padding: {
        default: "p-6",
        none: "p-0",
        compact: "p-4",
      },
      overflow: {
        auto: "overflow-y-auto",
        hidden: "overflow-hidden",
        scroll: "overflow-y-scroll",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
      height: "auto",
      padding: "default",
      overflow: "auto",
    },
  }
);

const BexDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof bexDialogContentVariants>
>(({ className, variant, size, height, padding, overflow, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant === "gaming" ? "gaming" : variant === "glass" ? "glass" : "default"} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(bexDialogContentVariants({ variant, size, height, padding, overflow }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10",
        variant === "gaming" && "text-bex hover:text-bex-light hover:bg-bex/10"
      )}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
BexDialogContent.displayName = DialogPrimitive.Content.displayName;

const BexDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
BexDialogHeader.displayName = "BexDialogHeader";

const BexDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
BexDialogFooter.displayName = "BexDialogFooter";

const BexDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    gaming?: boolean;
  }
>(({ className, gaming, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      gaming && "text-bex",
      className
    )}
    {...props}
  />
));
BexDialogTitle.displayName = DialogPrimitive.Title.displayName;

const BexDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BexDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  BexDialogContent,
  BexDialogHeader,
  BexDialogFooter,
  BexDialogTitle,
  BexDialogDescription,
};
