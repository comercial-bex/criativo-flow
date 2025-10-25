import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Activity, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface TaskCommentsProps {
  tarefaId: string;
}

export function TaskComments({ tarefaId }: TaskCommentsProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComentarios();

    // Realtime subscription
    const channel = supabase
      .channel(`comentarios:${tarefaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tarefa_comentarios',
          filter: `tarefa_id=eq.${tarefaId}`,
        },
        () => {
          fetchComentarios();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tarefaId]);

  const fetchComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('tarefa_comentarios')
        .select(`
          *,
          autor:pessoas!autor_id(nome, avatar_url)
        `)
        .eq('tarefa_id', tarefaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComentarios((data as Comentario[]) || []);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar comentários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tarefa_comentarios')
        .insert({
          tarefa_id: tarefaId,
          autor_id: user.id,
          conteudo: novoComentario,
          tipo: 'comentario',
        });

      if (error) throw error;

      setNovoComentario("");
      toast({
        title: "Sucesso",
        description: "Comentário adicionado!",
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar comentário",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

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

  if (loading) return <div className="text-center py-4">Carregando comentários...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form de novo comentário */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                enviarComentario();
              }
            }}
            className="min-h-[80px]"
          />
          <Button 
            onClick={enviarComentario} 
            disabled={sending || !novoComentario.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Pressione Ctrl+Enter para enviar
        </div>

        {/* Timeline de comentários */}
        <div className="space-y-4 mt-6">
          {comentarios.map((comentario) => (
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

          {comentarios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhum comentário ainda</p>
              <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
