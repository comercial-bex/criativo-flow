import { useState } from 'react';
import { Bell, CheckCheck, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ActivityFeedSheetProps {
  defaultFilter?: 'all' | 'mine';
  executorArea?: string;
}

export function ActivityFeedSheet({ defaultFilter = 'all', executorArea }: ActivityFeedSheetProps) {
  const [filter, setFilter] = useState<'all' | 'mine'>(defaultFilter);
  const [open, setOpen] = useState(false);
  const { activities, loading, unreadCount, markAsRead, markAllAsRead } = useActivityFeed({
    filter,
    executorArea,
  });
  const navigate = useNavigate();

  const handleActivityClick = (activity: any) => {
    if (!activity.lida) {
      markAsRead(activity.id);
    }

    // Navegar para a tarefa
    if (activity.tarefa_id) {
      const areaPath = activity.executor_area === 'Criativo' ? '/design/tarefas' : '/admin/tarefas';
      navigate(`${areaPath}?tarefa=${activity.tarefa_id}`);
      setOpen(false);
    }
  };

  const unreadActivities = activities.filter((a) => !a.lida);
  const allActivities = activities;

  const renderActivity = (activity: any) => {
    const statusNovo = activity.metadata?.status_novo;
    const statusLabel = statusNovo ? statusLabels[statusNovo] : '';
    const statusColor = statusNovo ? statusColors[statusNovo] : 'bg-gray-500';

    return (
      <button
        key={activity.id}
        onClick={() => handleActivityClick(activity)}
        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border ${
          !activity.lida ? 'bg-primary/5' : ''
        }`}
      >
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
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
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {activity.conteudo}
            </p>

            {activity.tarefa_titulo && (
              <p className="text-xs text-foreground/70 mb-2">
                {activity.tarefa_titulo}
              </p>
            )}

            <div className="flex items-center gap-2">
              {statusLabel && (
                <Badge className={`${statusColor} text-white text-[10px] px-2 py-0.5`}>
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
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0" side="right">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Atividades Recentes</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription className="text-sm text-muted-foreground">
            Acompanhe as atualizações de tarefas em tempo real
          </SheetDescription>

          <div className="flex items-center gap-2 mt-4">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="h-9 w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tarefas</SelectItem>
                <SelectItem value="mine">Minhas tarefas</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="h-9 whitespace-nowrap"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="unread" className="flex-1">
          <TabsList className="w-full grid grid-cols-2 px-6 pt-4">
            <TabsTrigger value="unread" className="relative">
              Não Lida
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs bg-primary/20 text-primary">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Tudo</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-240px)]">
            <TabsContent value="unread" className="mt-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
                  Carregando...
                </div>
              ) : unreadActivities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma atividade não lida</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {unreadActivities.map(renderActivity)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
                  Carregando...
                </div>
              ) : allActivities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allActivities.map(renderActivity)}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
