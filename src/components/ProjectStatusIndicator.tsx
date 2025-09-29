import { Badge } from "@/components/ui/badge";
import { calculateProjectStatus, getStatusText, type ProjectWithTasks } from "@/utils/statusUtils";
import { AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react";

interface ProjectStatusIndicatorProps {
  project: ProjectWithTasks;
  showCriticalCount?: boolean;
}

export function ProjectStatusIndicator({ project, showCriticalCount = true }: ProjectStatusIndicatorProps) {
  const { status, color, criticalTasks } = calculateProjectStatus(project);
  
  const getIcon = () => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'pausado':
        return <Pause className="h-4 w-4" />;
      default:
        return criticalTasks > 0 ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    if (status === 'concluido') return 'success';
    if (criticalTasks > 0) return 'destructive';
    if (status === 'pausado') return 'secondary';
    return 'default';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getVariant() as any} className="flex items-center gap-1">
        {getIcon()}
        <span>{getStatusText(status)}</span>
      </Badge>
      {showCriticalCount && criticalTasks > 0 && (
        <Badge variant="destructive" className="text-xs">
          {criticalTasks} crítica{criticalTasks > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}