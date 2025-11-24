import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCreativeIcon, getCreativeColor } from "@/lib/plano-editorial-helpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  descricao?: string;
  texto_estruturado?: string;
  tipo_conteudo?: string;
  arquivo_visual_url?: string;
  status_post?: string;
}

interface CalendarioEditorialProps {
  posts: Post[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPostClick?: (post: Post) => void;
}

export const CalendarioEditorial = ({ 
  posts, 
  currentDate,
  onDateChange,
  onPostClick 
}: CalendarioEditorialProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => {
      try {
        // Validar se data_postagem existe e é válida
        if (!post.data_postagem) return false;
        
        const postDate = parseISO(post.data_postagem);
        return isSameDay(postDate, day);
      } catch (error) {
        console.warn('Erro ao parsear data do post:', post.id, post.data_postagem);
        return false;
      }
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'a_fazer': return 'bg-gray-100 text-gray-800';
      case 'em_producao': return 'bg-blue-100 text-blue-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'publicado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {daysInMonth.map(day => {
          const dayPosts = getPostsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Card 
              key={day.toISOString()} 
              className={`min-h-[120px] ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''} ${isToday ? 'border-primary border-2' : ''}`}
            >
              <CardContent className="p-2">
                <div className="text-sm font-semibold mb-2">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayPosts.map(post => (
                    <TooltipProvider key={post.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => onPostClick?.(post)}
                            className={`${getCreativeColor(post.formato_postagem || 'post')} px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity truncate`}
                          >
                            <span className="mr-1">{getCreativeIcon(post.formato_postagem || 'post')}</span>
                            {post.titulo || 'Sem título'}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold">{post.titulo || 'Sem título'}</p>
                            {(post.descricao || post.texto_estruturado) && (
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {post.descricao || post.texto_estruturado}
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getStatusColor(post.status_post)} variant="secondary">
                                {post.status_post || 'a_fazer'}
                              </Badge>
                              {post.objetivo_postagem && (
                                <Badge variant="outline">
                                  {post.objetivo_postagem}
                                </Badge>
                              )}
                              {post.tipo_conteudo && (
                                <Badge variant="outline">
                                  {post.tipo_conteudo}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
