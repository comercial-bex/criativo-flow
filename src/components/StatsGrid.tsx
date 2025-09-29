import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className = '' }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.color || 'bg-primary/10 text-primary'}`}>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
            )}
            {stat.trend && (
              <Badge 
                variant={stat.trend.isPositive ? 'default' : 'destructive'}
                className="text-xs"
              >
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}