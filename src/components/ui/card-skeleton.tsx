import { Card, CardContent, CardHeader } from "./card";
import { BexSkeleton } from "./bex-skeleton";

interface CardSkeletonProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({ 
  showHeader = true, 
  lines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <BexSkeleton className="h-6 w-1/3" />
          <BexSkeleton className="h-4 w-2/3" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <BexSkeleton 
            key={i} 
            className="h-4"
            style={{ 
              width: `${70 + Math.random() * 30}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CardListSkeletonProps {
  count?: number;
  showHeader?: boolean;
  lines?: number;
}

export function CardListSkeleton({ 
  count = 3,
  showHeader = true,
  lines = 3 
}: CardListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton 
          key={i} 
          showHeader={showHeader} 
          lines={lines}
        />
      ))}
    </div>
  );
}
