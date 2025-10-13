import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  badge, 
  icon: Icon, 
  action, 
  className = '' 
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-bex/10 text-bex">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="bex-title-primary">{title}</h1>
              {badge && (
                <Badge variant="secondary">{badge}</Badge>
              )}
            </div>
            {description && (
              <p className="bex-text-muted mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="flex items-center space-x-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          <span>{action.label}</span>
        </Button>
      )}
    </div>
  );
}