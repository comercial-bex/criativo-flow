import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BexDialogContent, BexDialogHeader, BexDialogFooter, BexDialogTitle, BexDialogDescription } from './bex-dialog';

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// Re-export BEX Dialog components as default (Gaming theme)
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Auto-apply BEX Gaming variant to all DialogContent by default
const DialogContent = React.forwardRef<
  React.ElementRef<typeof BexDialogContent>,
  React.ComponentPropsWithoutRef<typeof BexDialogContent>
>((props, ref) => (
  <BexDialogContent ref={ref} variant="gaming" {...props} />
))
DialogContent.displayName = "DialogContent"

const DialogHeader = BexDialogHeader
const DialogFooter = BexDialogFooter  
const DialogTitle = BexDialogTitle
const DialogDescription = BexDialogDescription

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
