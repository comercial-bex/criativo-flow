import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  formato_postagem: string;
  status?: string;
}

export function CalendarWidget() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingPosts();
  }, []);

  const fetchUpcomingPosts = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      const { data, error } = await supabase
        .from('posts_planejamento')
        .select('id, titulo, data_postagem, formato_postagem')
        .gte('data_postagem', format(today, 'yyyy-MM-dd'))
        .lte('data_postagem', format(nextWeek, 'yyyy-MM-dd'))
        .order('data_postagem', { ascending: true })
        .limit(5);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts próximos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post': return '📝';
      case 'story': return '📷';
      case 'reel': return '🎬';
      case 'carousel': return '🎠';
      default: return '📄';
    }
  };

  return (
    <Card data-intro="calendar-widget">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calendário Editorial</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{posts.length}</div>
              <p className="text-xs text-muted-foreground">
                Posts próximos 7 dias
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/grs/calendario-editorial')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agendar
            </Button>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Nenhum post agendado para os próximos 7 dias
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/grs/planejamentos')}
                data-intro="schedule-post"
              >
                Criar Planejamento
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFormatIcon(post.formato_postagem)}</span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {post.titulo}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {getDateLabel(post.data_postagem)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {post.formato_postagem}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}