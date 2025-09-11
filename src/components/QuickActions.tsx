import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActions({ 
  actions, 
  title = "Ações Rápidas", 
  columns = 3,
  className = '' 
}: QuickActionsProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {actions.map((action, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={action.disabled ? undefined : action.onClick}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg transition-colors ${
                  action.color || 'bg-primary/10 text-primary group-hover:bg-primary/20'
                } ${action.disabled ? 'opacity-50' : ''}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-medium">
                    {action.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {action.description}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!action.disabled) action.onClick();
                }}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}