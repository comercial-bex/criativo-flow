import { LucideIcon } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConnectionNodeProps {
  id: string;
  name: string;
  status: 'connected' | 'degraded' | 'disconnected' | 'paused';
  icon: LucideIcon;
  latency?: number;
  position: { x: number; y: number };
  onClick?: () => void;
  helpInfo?: {
    description: string;
    problems?: string[];
    solutions?: string[];
  };
}

export function ConnectionNode({
  name,
  status,
  icon: Icon,
  latency,
  position,
  onClick,
  helpInfo,
}: ConnectionNodeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20';
      case 'degraded':
        return 'border-amber-500 bg-amber-500/10 shadow-amber-500/20';
      case 'disconnected':
        return 'border-destructive bg-destructive/10 shadow-destructive/20';
      default:
        return 'border-muted bg-muted/10 shadow-muted/20';
    }
  };

  const getAnimationClass = () => {
    switch (status) {
      case 'connected':
        return 'animate-pulse-glow';
      case 'degraded':
        return 'animate-pulse';
      case 'disconnected':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        onClick={onClick}
        className={cn(
          'relative group cursor-pointer',
          'transition-all duration-300 hover:scale-110'
        )}
      >
        {/* Hexagonal node */}
        <div
          className={cn(
            'h-20 w-20 rounded-2xl border-2 flex flex-col items-center justify-center',
            'backdrop-blur-sm transition-all duration-300',
            getStatusColor(),
            getAnimationClass(),
            onClick && 'hover:shadow-lg'
          )}
        >
          <Icon className="h-8 w-8 mb-1" />
          
          {/* Status indicator */}
          <div
            className={cn(
              'absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background',
              status === 'connected' && 'bg-emerald-500',
              status === 'degraded' && 'bg-amber-500',
              status === 'disconnected' && 'bg-destructive',
              status === 'paused' && 'bg-muted'
            )}
          />

          {/* Latency badge */}
          {latency !== undefined && status === 'connected' && (
            <Badge 
              variant="secondary" 
              className="absolute -bottom-6 text-xs py-0 px-1.5 h-5"
            >
              {latency}ms
            </Badge>
          )}
        </div>

        {/* Label with help tooltip */}
        <div className="mt-8 flex items-center gap-1.5 justify-center min-w-max">
          <p className="text-xs font-medium text-center">{name}</p>
          {helpInfo && (
            <HelpTooltip
              title={name}
              description={helpInfo.description}
              problems={helpInfo.problems}
              solutions={helpInfo.solutions}
            />
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>
    </div>
  );
}
