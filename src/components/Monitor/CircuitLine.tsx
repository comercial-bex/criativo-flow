interface CircuitLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  status: 'connected' | 'degraded' | 'disconnected' | 'paused';
  animated?: boolean;
}

export function CircuitLine({ from, to, status, animated = true }: CircuitLineProps) {
  const getStrokeColor = () => {
    switch (status) {
      case 'connected':
        return 'hsl(var(--bex-green))';
      case 'degraded':
        return 'hsl(var(--warning))';
      case 'disconnected':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const getAnimationClass = () => {
    if (!animated) return '';
    switch (status) {
      case 'connected':
        return 'circuit-flow';
      case 'degraded':
        return 'circuit-warning';
      case 'disconnected':
        return 'circuit-error';
      default:
        return '';
    }
  };

  const pathD = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  return (
    <g className="circuit-line">
      {/* Base line */}
      <path
        d={pathD}
        stroke={getStrokeColor()}
        strokeWidth="2"
        fill="none"
        strokeDasharray={status === 'disconnected' ? '5,5' : undefined}
        opacity="0.6"
      />
      
      {/* Animated overlay */}
      {animated && status !== 'paused' && (
        <path
          d={pathD}
          stroke={getStrokeColor()}
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 20"
          className={getAnimationClass()}
          opacity="0.8"
        />
      )}

      {/* Flow particles */}
      {animated && status === 'connected' && (
        <circle r="3" fill={getStrokeColor()} opacity="0.8">
          <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
        </circle>
      )}
    </g>
  );
}
