import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDeviceType } from '@/hooks/useDeviceType';

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

export function StatsGrid({ stats, columns, className = '' }: StatsGridProps) {
  const deviceType = useDeviceType();
  
  // Responsive columns based on device type and data length
  const getResponsiveColumns = () => {
    if (columns) return columns;
    
    const maxCols = Math.min(stats.length, 4);
    
    switch (deviceType) {
      case 'mobile-small':
      case 'mobile':
        return 1;
      case 'tablet':
        return Math.min(maxCols, 2);
      case 'tablet-large':
        return Math.min(maxCols, 3);
      case 'desktop':
      case 'desktop-large':
        return maxCols;
      default:
        return Math.min(maxCols, 2);
    }
  };

  const responsiveColumns = getResponsiveColumns();
  
  return (
    <div 
      className={`grid gap-3 mobile:gap-4 tablet:gap-6 ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))` 
      }}
    >
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-300">
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${
            deviceType === 'mobile-small' ? 'px-3 pt-3' : 
            deviceType === 'mobile' ? 'px-4 pt-4' : 'px-4 sm:px-6 pt-4 sm:pt-6'
          }`}>
            <CardTitle className={`${
              deviceType === 'mobile-small' ? 'text-xs' :
              deviceType === 'mobile' ? 'text-sm' : 'text-xs sm:text-sm'
            } font-medium text-muted-foreground`}>
              {stat.title}
            </CardTitle>
            <div className={`${
              deviceType === 'mobile-small' ? 'p-1' : 'p-1.5 sm:p-2'
            } rounded-lg ${stat.color || 'bg-primary/10 text-primary'}`}>
              <stat.icon className={`${
                deviceType === 'mobile-small' ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'
              }`} />
            </div>
          </CardHeader>
          <CardContent className={`${
            deviceType === 'mobile-small' ? 'px-3 pb-3' : 
            deviceType === 'mobile' ? 'px-4 pb-4' : 'px-4 sm:px-6 pb-4 sm:pb-6'
          }`}>
            <div className={`${
              deviceType === 'mobile-small' ? 'text-lg' :
              deviceType === 'mobile' ? 'text-xl' : 'text-xl sm:text-2xl'
            } font-bold mb-1`}>
              {stat.value}
            </div>
            {stat.description && (
              <p className={`${
                deviceType === 'mobile-small' ? 'text-xs' : 'text-xs'
              } text-muted-foreground mb-2`}>
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