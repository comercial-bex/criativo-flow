import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';

interface DialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
}

export function DialogWrapper({ 
  open, 
  onOpenChange, 
  title, 
  description,
  size = 'md', 
  children 
}: DialogWrapperProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 px-1">
          <div className="pr-4">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
