import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useClientTimeline } from "@/hooks/useClientTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, XCircle, Clock, CheckCircle2, DollarSign, FileText, Briefcase } from "lucide-react";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIMELINE_ICONS = {
  projeto: Briefcase,
  tarefa: CheckCircle2,
  aprovacao: FileText,
  financeiro: DollarSign,
  conteudo: Activity,
};

const TIMELINE_COLORS = {
  projeto: 'text-blue-500',
  tarefa: 'text-green-500',
  aprovacao: 'text-purple-500',
  financeiro: 'text-yellow-500',
  conteudo: 'text-pink-500',
};

export default function ClienteTimeline() {
  const { user } = useAuth();
  const { getProfileById } = useProfileData();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: timeline, isLoading: timelineLoading } = useClientTimeline(clienteId || undefined);
  const { startTutorial, hasSeenTutorial } = useTutorial('cliente-timeline');

  useEffect(() => {
    const fetchClienteData = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await getProfileById(user.id);
        if (profile && 'cliente_id' in profile && profile.cliente_id) {
          setClienteId(profile.cliente_id as string);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClienteData();
  }, [user?.id, getProfileById]);

  if (loading || timelineLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando timeline unificada...</p>
        </div>
      </div>
    );
  }

  if (!clienteId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Não foi possível encontrar os dados do cliente. 
              Entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Histórico de Atividades
          </h1>
          <p className="text-muted-foreground">
            Timeline unificada: projetos, tarefas, aprovações, financeiro e conteúdo
          </p>
        </div>
      </div>

      {/* Timeline Unificada */}
      <div className="space-y-4">
        {!timeline || timeline.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Nenhuma atividade registrada ainda.
              </p>
            </CardContent>
          </Card>
        ) : (
          timeline.map((evento, idx) => {
            const Icon = TIMELINE_ICONS[evento.tipo];
            const colorClass = TIMELINE_COLORS[evento.tipo];

            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{evento.titulo}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {evento.tipo} • {evento.entidade}
                          </p>
                        </div>
                        
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(evento.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      {/* Metadata */}
                      {evento.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {evento.metadata.status && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              {evento.metadata.status}
                            </span>
                          )}
                          {evento.metadata.valor && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-600">
                              R$ {Number(evento.metadata.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          {evento.metadata.tipo && evento.tipo === 'aprovacao' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-600">
                              {evento.metadata.tipo}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}