import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BexCard } from '@/components/ui/bex-card';
import { MessageSquare, Send, Clock, CheckCircle2, Paperclip, AlertCircle, RefreshCw, User, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { smartToast } from '@/lib/smart-toast';

interface Activity {
  id: string;
  tipo_atividade: string;
  conteudo: string;
  metadata: any;
  created_at: string;
  user_id: string;
  profiles?: {
    nome: string;
  };
}

interface TaskActivitiesProps {
  tarefaId: string;
  className?: string;
}

export function TaskActivities({ tarefaId, className }: TaskActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [needsToFollow, setNeedsToFollow] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    loadActivities();
    checkCanComment();
    
    // Subscription para updates em tempo real
    const channel = supabase
      .channel(`tarefa-atividades-${tarefaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tarefa_atividades',
          filter: `tarefa_id=eq.${tarefaId}`
        },
        () => {
          console.log('🔄 Nova atividade detectada, recarregando...');
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tarefaId]);

  const checkCanComment = async () => {
    try {
      setCheckingPermissions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanComment(false);
        setNeedsToFollow(true);
        return;
      }

      // Verificar se é responsável/executor/admin/GRS
      const { data: tarefa } = await supabase
        .from('tarefa')
        .select('responsavel_id, executor_id, cliente_id')
        .eq('id', tarefaId)
        .single();

      const isResponsible = tarefa?.responsavel_id === user.id;
      const isExecutor = tarefa?.executor_id === user.id;
      
      // Verificar se está seguindo
      const { data: seguindo } = await supabase
        .from('tarefa_seguidores')
        .select('id')
        .eq('tarefa_id', tarefaId)
        .eq('user_id', user.id)
        .maybeSingle();

      setCanComment(isResponsible || isExecutor || !!seguindo);
      setNeedsToFollow(!isResponsible && !isExecutor && !seguindo);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setCanComment(false);
      setNeedsToFollow(true);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase
        .from('tarefa_atividades')
        .select('*')
        .eq('tarefa_id', tarefaId)
        .order('created_at', { ascending: false });

      // Buscar nomes dos usuários separadamente
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(a => a.user_id))];
        const { data: profilesData } = await supabase
          .from('pessoas')
          .select('id, nome')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p.nome]) || []);
        
        setActivities(data.map(activity => ({
          ...activity,
          profiles: { nome: profilesMap.get(activity.user_id) || 'Usuário' }
        })));
        return;
      }

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      smartToast.error('Erro ao carregar atividades');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAddComentario = async () => {
    if (!comentario.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        smartToast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('tarefa_atividades')
        .insert({
          tarefa_id: tarefaId,
          user_id: user.id,
          tipo_atividade: 'comentario',
          conteudo: comentario.trim()
        });

      if (error) throw error;

      setComentario('');
      smartToast.success('Comentário adicionado');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      smartToast.error('Erro ao adicionar comentário');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mudanca_status':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'anexo_adicionado':
        return <Paperclip className="h-4 w-4 text-purple-500" />;
      case 'checklist_item':
        return <CheckCircle2 className="h-4 w-4 text-bex" />;
      case 'atribuicao':
        return <User className="h-4 w-4 text-orange-500" />;
      case 'prazo_alterado':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    if (activity.tipo_atividade === 'comentario') {
      return activity.conteudo;
    }

    if (activity.tipo_atividade === 'mudanca_status') {
      return `Status alterado: ${activity.metadata?.status_anterior} → ${activity.metadata?.status_novo}`;
    }

    return activity.metadata?.descricao || activity.conteudo || 'Atividade registrada';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Campo de comentário */}
      {checkingPermissions ? (
        <BexCard variant="glass">
          <div className="p-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </div>
        </BexCard>
      ) : needsToFollow ? (
        <BexCard variant="glass">
          <div className="p-4 text-center space-y-3">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="bex-body text-muted-foreground">
              Você precisa seguir esta tarefa para adicionar comentários
            </p>
            <Button 
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;

                  const { error } = await supabase
                    .from('tarefa_seguidores')
                    .insert({
                      tarefa_id: tarefaId,
                      user_id: user.id
                    });

                  if (error) throw error;

                  setCanComment(true);
                  setNeedsToFollow(false);
                  smartToast.success('✅ Agora você está seguindo esta tarefa!');
                  loadActivities();
                } catch (error) {
                  console.error('Erro ao seguir tarefa:', error);
                  smartToast.error('Erro ao seguir tarefa');
                }
              }}
              className="bg-bex hover:bg-bex-dark"
            >
              <Bell className="h-4 w-4 mr-2" />
              Seguir Tarefa para Comentar
            </Button>
          </div>
        </BexCard>
      ) : (
        <BexCard variant="glass">
          <div className="p-4 space-y-3">
            <label className="bex-body font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Escrever um comentário...
            </label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicione uma atualização, pergunta ou observação..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className="flex-1 resize-none"
                disabled={loading}
              />
              <Button
                onClick={handleAddComentario}
                disabled={!comentario.trim() || loading}
                className="self-end bg-bex hover:bg-bex-dark"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </BexCard>
      )}

      {/* Timeline de atividades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="bex-body font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Atividades
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActivities}
            disabled={loadingActivities}
          >
            <RefreshCw className={cn("h-4 w-4", loadingActivities && "animate-spin")} />
          </Button>
        </div>

        {loadingActivities ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-card rounded-lg border border-border/50 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {activities.map((activity) => (
              <BexCard 
                key={activity.id} 
                variant="glass"
                className="hover:border-bex/30 transition-all"
              >
                <div className="p-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-bex/20 text-bex text-xs">
                        {activity.profiles?.nome?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActivityIcon(activity.tipo_atividade)}
                        <span className="bex-body font-medium truncate">
                          {activity.profiles?.nome || 'Usuário'}
                        </span>
                        <span className="bex-text-muted">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      
                      <p className="bex-text-muted leading-relaxed break-words">
                        {getActivityDescription(activity)}
                      </p>
                    </div>
                  </div>
                </div>
              </BexCard>
            ))}
          </div>
        ) : (
          <BexCard variant="glass">
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="bex-text-muted">
                Nenhuma atividade registrada ainda.
              </p>
              <p className="bex-text-muted mt-1">
                Adicione o primeiro comentário acima!
              </p>
            </div>
          </BexCard>
        )}
      </div>
    </div>
  );
}
