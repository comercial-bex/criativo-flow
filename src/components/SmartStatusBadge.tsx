import { Badge } from "@/components/ui/badge";
import { calculateTaskSmartStatus, getStatusText, type TaskWithDeadline } from "@/utils/statusUtils";
import { Clock, AlertTriangle, CheckCircle, Circle } from "lucide-react";

interface SmartStatusBadgeProps {
  task: TaskWithDeadline;
  showIcon?: boolean;
}

export function SmartStatusBadge({ task, showIcon = true }: SmartStatusBadgeProps) {
  const { status, color, variant } = calculateTaskSmartStatus(task);
  
  const getIcon = () => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-3 w-3" />;
      case 'vencido':
        return <AlertTriangle className="h-3 w-3" />;
      case 'em_andamento':
        return <Clock className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  // Map variant to valid Badge variants
  const getBadgeVariant = () => {
    if (variant === 'success') return 'default';
    return variant;
  };

  return (
    <Badge variant={getBadgeVariant()} className={`flex items-center gap-1 ${
      status === 'concluido' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''
    }`}>
      {showIcon && getIcon()}
      <span>{getStatusText(status)}</span>
    </Badge>
  );
}