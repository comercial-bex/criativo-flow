import { useTimelineAtividades } from "@/hooks/useTimelineAtividades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TimelineAtividades() {
  const { atividades, loading } = useTimelineAtividades();

  const getInitials = (nome: string) => {
    if (!nome) return '?';
    const parts = nome.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getActionColor = (acao: string) => {
    const colors: Record<string, string> = {
      'criar_tarefa': 'bg-green-500',
      'atualizar_status': 'bg-blue-500',
      'aprovacao_planejamento': 'bg-purple-500',
      'criar_projeto': 'bg-orange-500',
      'comentario': 'bg-gray-500',
      'upload_arquivo': 'bg-cyan-500'
    };
    return colors[acao] || 'bg-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">🕐 Última Atividade</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : atividades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma atividade recente
          </p>
        ) : (
          <div className="space-y-4">
            {atividades.map((atividade) => (
              <div key={atividade.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={atividade.profile_avatar_url} />
                  <AvatarFallback>
                    {getInitials(atividade.profile_nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {atividade.profile_nome || 'Usuário'}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`${getActionColor(atividade.acao)} text-white text-xs`}
                    >
                      {atividade.acao.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {atividade.descricao}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(atividade.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
