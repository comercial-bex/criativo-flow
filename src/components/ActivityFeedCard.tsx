import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  briefing: 'bg-blue-500',
  aprovacao: 'bg-yellow-500',
  produzindo: 'bg-purple-500',
  revisao: 'bg-orange-500',
  publicado: 'bg-green-500',
  em_andamento: 'bg-blue-500',
  concluido: 'bg-green-500',
  cancelado: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  briefing: 'BRIEFING',
  aprovacao: 'APROVAÇÃO',
  produzindo: 'PRODUZINDO',
  revisao: 'REVISÃO',
  publicado: 'PUBLICADO',
  em_andamento: 'EM ANDAMENTO',
  concluido: 'CONCLUÍDO',
  cancelado: 'CANCELADO',
};

interface ActivityFeedCardProps {
  filter?: 'all' | 'mine';
  executorArea?: string;
  limit?: number;
  title?: string;
}

export function ActivityFeedCard({
  filter = 'all',
  executorArea,
  limit = 10,
  title = 'Atividades Recentes',
}: ActivityFeedCardProps) {
  const { activities, loading, markAsRead } = useActivityFeed({ filter, executorArea, limit });
  const navigate = useNavigate();

  const handleActivityClick = (activity: any) => {
    if (!activity.lida) {
      markAsRead(activity.id);
    }

    if (activity.tarefa_id) {
      const areaPath = activity.executor_area === 'Criativo' ? '/design/tarefas' : '/admin/tarefas';
      navigate(`${areaPath}?tarefa=${activity.tarefa_id}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm">Carregando...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const statusNovo = activity.metadata?.status_novo;
                const statusLabel = statusNovo ? statusLabels[statusNovo] : '';
                const statusColor = statusNovo ? statusColors[statusNovo] : 'bg-gray-500';

                return (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className={`w-full p-3 text-left rounded-lg hover:bg-muted/50 transition-colors ${
                      !activity.lida ? 'bg-primary/5 border border-primary/20' : 'border border-border'
                    }`}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={activity.user_avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {activity.user_nome?.substring(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.user_nome}
                          </p>
                          {!activity.lida && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-1.5">
                          {activity.conteudo}
                        </p>

                        {activity.tarefa_titulo && (
                          <p className="text-xs text-foreground/60 mb-1.5 truncate">
                            {activity.tarefa_titulo}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          {statusLabel && (
                            <Badge className={`${statusColor} text-white text-[9px] px-1.5 py-0.5`}>
                              {statusLabel}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
