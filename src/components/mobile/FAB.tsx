// Floating Action Button (FAB)
// Botão flutuante para ação principal em mobile

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FABProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'lg';
  className?: string;
}

export function FAB({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  variant = 'primary',
  size = 'default',
  className
}: FABProps) {
  const positionClass = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2'
  }[position];

  const variantClass = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md'
  }[variant];

  const sizeClass = {
    default: 'h-14 w-14',
    lg: 'h-16 w-16'
  }[size];

  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed z-40 rounded-full transition-all active:scale-95',
        positionClass,
        variantClass,
        sizeClass,
        label && 'px-6 w-auto gap-2',
        className
      )}
      size="icon"
    >
      <Icon className={iconSize} />
      {label && <span className="font-medium">{label}</span>}
    </Button>
  );
}

// FAB com menu expansível
interface FABMenuProps {
  mainIcon: LucideIcon;
  actions: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
  }>;
  position?: 'bottom-right' | 'bottom-left';
}

export function FABMenu({ mainIcon: MainIcon, actions, position = 'bottom-right' }: FABMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const positionClass = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  }[position];

  return (
    <div className={cn('fixed z-40', positionClass)}>
      {/* Menu Items */}
      <div
        className={cn(
          'absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="bg-background px-3 py-1 rounded-full text-sm font-medium shadow-md whitespace-nowrap">
              {action.label}
            </span>
            <Button
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="h-12 w-12 rounded-full bg-secondary hover:bg-secondary/90 shadow-md"
              size="icon"
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform',
          isOpen && 'rotate-45'
        )}
        size="icon"
      >
        <MainIcon className="h-5 w-5" />
      </Button>

      {/* Backdrop quando aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
