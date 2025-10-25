import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Activity, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comentario {
  id: string;
  conteudo: string;
  tipo: 'comentario' | 'atualizacao' | 'mudanca_status';
  created_at: string;
  autor_id: string;
  autor?: {
    nome: string;
    avatar_url?: string;
  };
}

interface InfiniteTaskCommentsProps {
  tarefaId: string;
}

export function InfiniteTaskComments({ tarefaId }: InfiniteTaskCommentsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['task-comments-infinite', tarefaId],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const { data, error } = await supabase
        .from('tarefa_comentarios')
        .select(`
          *,
          autor:pessoas!autor_id(nome, avatar_url)
        `)
        .eq('tarefa_id', tarefaId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (error) throw error;
      return (data as Comentario[]) || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
    initialPageParam: 0,
  });

  // Setup intersection observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allComments = data?.pages.flat() || [];

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return <MessageSquare className="h-4 w-4" />;
      case 'atualizacao':
        return <Activity className="h-4 w-4" />;
      case 'mudanca_status':
        return <History className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getBadgeForType = (tipo: string) => {
    switch (tipo) {
      case 'atualizacao':
        return <Badge variant="secondary" className="text-xs">Atualização</Badge>;
      case 'mudanca_status':
        return <Badge variant="outline" className="text-xs">Mudança de Status</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {allComments.map((comentario) => (
        <div key={comentario.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comentario.autor?.avatar_url} />
            <AvatarFallback>
              {comentario.autor?.nome?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comentario.autor?.nome || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comentario.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {getBadgeForType(comentario.tipo)}
            </div>

            <div className="bg-secondary/30 rounded-lg p-3 text-sm">
              {comentario.conteudo}
            </div>
          </div>
        </div>
      ))}

      {allComments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Nenhum comentário ainda</p>
          <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-1"></div>
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Role para ver mais</p>
          )}
        </div>
      )}
    </div>
  );
}
