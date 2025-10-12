import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const BexAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    withGlow?: boolean;
    gaming?: boolean;
  }
>(({ className, withGlow, gaming, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      withGlow && "ring-2 ring-bex shadow-lg shadow-bex/30",
      gaming && "ring-2 ring-bex shadow-xl shadow-bex/40 hover:scale-110 transition-all duration-300 hover:ring-bex-light",
      className
    )}
    {...props}
  />
));
BexAvatar.displayName = AvatarPrimitive.Root.displayName;

const BexAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
BexAvatarImage.displayName = AvatarPrimitive.Image.displayName;

const BexAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
BexAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { BexAvatar, BexAvatarImage, BexAvatarFallback };
