import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  User, 
  Calendar,
  FileText,
  GripVertical,
  AlertCircle
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModernBadge } from "@/components/ui/modern-badge";
import { CircleProgress } from "@/components/ui/circle-progress";
import { ModernAvatar } from "@/components/ui/modern-avatar";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { TaskCoverImage } from "@/components/ui/task-cover-image";
import { useTaskCover } from "@/hooks/useTaskCover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface KanbanTask {
  id: string;
  title?: string;
  titulo?: string;
  description?: string;
  descricao?: string;
  status: string;
  priority?: "alta" | "média" | "baixa";
  prioridade?: "baixa" | "media" | "alta";
  executor_area?: string;
  executor_nome?: string;
  responsavel_nome?: string;
  responsavel_avatar?: string;
  cliente_nome?: string;
  prazo_executor?: string | null;
  prazo_conclusao?: string | null;
  data_prazo?: string;
  horas_trabalhadas?: number;
  horas_estimadas?: number;
  created_at?: string;
  capa_anexo_id?: string | null;
  comentarios_count?: number;
  anexos_count?: number;
  checklist_items?: number;
  checklist_completed?: number;
  etiquetas?: string[];
  area?: string[];
}

interface ModernKanbanCardProps {
  task: KanbanTask;
  onTaskClick: (task: KanbanTask) => void;
  isDragging?: boolean;
}

export const ModernKanbanCard = React.memo(({ 
  task, 
  onTaskClick,
  isDragging = false 
}: ModernKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Timer em tempo real
  const { formattedTime, status: deadlineStatus, isUrgent } = useTaskTimer(task.prazo_executor);
  const { coverUrl } = useTaskCover(task.id, task.capa_anexo_id);

  // Normalizar campos
  const taskTitle = task.title || task.titulo || "Sem título";
  const taskDescription = task.description || task.descricao;
  const taskPriority = task.priority || (task.prioridade === "media" ? "média" : task.prioridade);

  // Gradiente baseado na prioridade
  const coverGradient = useMemo(() => {
    switch (taskPriority) {
      case "alta":
        return "from-red-600 via-red-500 to-orange-500";
      case "média":
        return "from-amber-600 via-yellow-500 to-amber-400";
      case "baixa":
        return "from-green-600 via-emerald-500 to-green-400";
      default:
        return "from-blue-600 via-purple-500 to-blue-400";
    }
  }, [taskPriority]);

  // Badge de prioridade
  const priorityBadge = useMemo(() => {
    switch (taskPriority) {
      case "alta":
        return { variant: "red" as const, icon: <AlertTriangle />, label: "Alta" };
      case "média":
        return { variant: "amber" as const, icon: <Clock />, label: "Média" };
      case "baixa":
        return { variant: "green" as const, icon: <CheckCircle2 />, label: "Baixa" };
      default:
        return { variant: "gray" as const, icon: <Tag />, label: "Normal" };
    }
  }, [taskPriority]);

  // Cor do countdown
  const countdownColor = useMemo(() => {
    if (deadlineStatus === "vermelho") return "text-red-500";
    if (isUrgent) return "text-amber-500";
    return "text-bex";
  }, [deadlineStatus, isUrgent]);

  // Cálculo de progresso
  const progressPercentage = useMemo(() => {
    if (!task.horas_estimadas || task.horas_estimadas === 0) return 0;
    return Math.min((task.horas_trabalhadas || 0) / task.horas_estimadas * 100, 100);
  }, [task.horas_trabalhadas, task.horas_estimadas]);

  // Risk level
  const riskLevel = useMemo(() => {
    if (deadlineStatus === "vermelho") return { level: "high", color: "text-red-500", label: "Alto" };
    if (isUrgent) return { level: "medium", color: "text-amber-500", label: "Médio" };
    return { level: "low", color: "text-bex", label: "Baixo" };
  }, [deadlineStatus, isUrgent]);

  // Border color baseado no risk
  const borderColor = useMemo(() => {
    if (riskLevel.level === "high") return "border-red-500/50";
    if (riskLevel.level === "medium") return "border-amber-500/50";
    return "border-bex/30";
  }, [riskLevel.level]);

  const handleClick = () => {
    if (!isSortableDragging) {
      onTaskClick(task);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border-2 ${borderColor} rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-bex-glow hover:-translate-y-1 transition-all duration-200 ${isSortableDragging ? 'opacity-50 glass-bex' : ''}`}
      onClick={handleClick}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Cover com Gradiente ou Imagem */}
      <TaskCoverImage
        coverUrl={coverUrl}
        fallbackGradient={coverGradient}
        height="h-20 sm:h-24"
      >
        {/* Countdown Timer */}
        {task.prazo_executor && (
          <div className="absolute top-2 right-2">
            <div className={`bg-black/60 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-2 ${countdownColor}`}>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold">{formattedTime}</span>
            </div>
          </div>
        )}

        {/* Badge de Prioridade */}
        {taskPriority && (
          <div className="absolute top-2 left-8 sm:left-10">
            <ModernBadge variant={priorityBadge.variant} size="sm" icon={priorityBadge.icon}>
              {priorityBadge.label}
            </ModernBadge>
          </div>
        )}
      </TaskCoverImage>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Header com Avatar */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 truncate">
              {taskTitle}
            </h3>
            {taskDescription && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {taskDescription}
              </p>
            )}
          </div>
          <div className="hidden sm:block">
            <ModernAvatar 
              src={task.responsavel_avatar} 
              alt={task.responsavel_nome || "?"} 
              size={36}
            />
          </div>
        </div>

        {/* Tags e Status */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {task.executor_area && (
            <ModernBadge variant="blue-subtle" size="sm" icon={<Tag />}>
              {task.executor_area}
            </ModernBadge>
          )}
          <ModernBadge variant="bex-subtle" size="sm">
            {task.status}
          </ModernBadge>
        </div>

        {/* Progress Bar */}
        {task.horas_estimadas && task.horas_estimadas > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium">Progresso</span>
              <span className="text-foreground font-semibold">
                {task.horas_trabalhadas || 0}h / {task.horas_estimadas}h
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-bex to-emerald-500 rounded-full"
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {Math.round(progressPercentage)}% Completo
            </div>
          </div>
        )}

        {/* Detalhes Rápidos */}
        <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
          {task.responsavel_nome && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-bex" />
              <span className="truncate">{task.responsavel_nome}</span>
            </div>
          )}
          {task.prazo_executor && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-bex" />
              <span>
                {format(new Date(task.prazo_executor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}
          {taskDescription && (
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-bex" />
              <span className="truncate">Descrição disponível</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${riskLevel.color}`} />
            <span className="text-xs text-muted-foreground">
              Risco: <span className="font-semibold">{riskLevel.label}</span>
            </span>
          </div>
          {task.horas_estimadas && task.horas_estimadas > 0 && (
            <CircleProgress
              value={task.horas_trabalhadas || 0}
              maxValue={task.horas_estimadas}
              size={28}
              strokeWidth={3}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
});

ModernKanbanCard.displayName = "ModernKanbanCard";
