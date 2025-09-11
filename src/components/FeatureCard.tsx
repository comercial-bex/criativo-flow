import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  actionLabel?: string;
  onAction?: () => void;
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  children, 
  className = '',
  variant = 'default',
  actionLabel,
  onAction
}: FeatureCardProps) {
  const variants = {
    default: 'bg-card border border-border hover:shadow-md',
    elevated: 'bg-card shadow-lg border-0 hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-border hover:border-primary/50'
  };

  return (
    <Card className={`${variants[variant]} transition-all duration-300 group ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          {badge && (
            <Badge variant="secondary" className="ml-2">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
          {actionLabel && onAction && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button 
                onClick={onAction}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}