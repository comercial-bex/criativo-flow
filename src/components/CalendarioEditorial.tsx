import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Instagram, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePostDragDrop } from "@/hooks/usePostDragDrop";
import { toast } from "sonner";

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  anexo_url?: string;
  planejamento_id: string;
  created_at?: string;
  updated_at?: string;
  descricao?: string;
}

interface CalendarioEditorialProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onPostClick: (post: Post) => void;
  onPostsUpdate?: (posts: Post[]) => void;
}

export function CalendarioEditorial({ isOpen, onClose, posts, onPostClick, onPostsUpdate }: CalendarioEditorialProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);

  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Initialize drag and drop hook
  const { reschedulePost, isUpdating } = usePostDragDrop({
    posts: localPosts,
    setPosts: (updatedPosts) => {
      setLocalPosts(updatedPosts);
      onPostsUpdate?.(updatedPosts);
    }
  });

  const getPostsForDate = (date: Date) => {
    return localPosts.filter(post => 
      isSameDay(new Date(post.data_postagem), date)
    );
  };

  const getPostsForMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
      date: day,
      posts: getPostsForDate(day)
    }));
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post': return '📱';
      case 'story': return '📸';
      case 'reel': return '🎬';
      case 'carrossel': return '🎠';
      default: return '📱';
    }
  };

  const getFormatColor = (formato: string) => {
    switch (formato) {
      case 'post': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'story': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'reel': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'carrossel': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    
    if (!draggedPost) return;

    const newDateString = format(targetDate, 'yyyy-MM-dd');
    const oldDateString = draggedPost.data_postagem;

    // Skip if dropping on same date
    if (newDateString === oldDateString) {
      setDraggedPost(null);
      return;
    }

    // Perform reschedule
    const result = await reschedulePost({
      postId: draggedPost.id,
      newDate: newDateString,
      oldDate: oldDateString
    });

    if (result.success) {
      toast.success('Post reagendado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao reagendar post');
    }

    setDraggedPost(null);
  };

  const monthData = getPostsForMonth();
  const selectedDatePosts = getPostsForDate(selectedDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/20">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            Calendário Editorial
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(90vh-120px)]">
          {/* Calendar View */}
          <div className="lg:col-span-2 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Custom Calendar Grid */}
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {monthData.map(({ date, posts: datePosts }, index) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const hasContent = datePosts.length > 0;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                        ${!isCurrentMonth ? 'opacity-50' : ''}
                        ${hasContent ? 'bg-gradient-to-br from-primary/5 to-transparent' : ''}
                        ${draggedPost ? 'hover:border-primary hover:bg-primary/10' : ''}
                      `}
                      onClick={() => setSelectedDate(date)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(date, 'd')}
                      </div>
                      
                      {datePosts.length > 0 && (
                        <div className="space-y-1">
                          {datePosts.slice(0, 2).map((post, postIndex) => (
                            <div
                              key={post.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, post)}
                              className={`
                                text-xs px-1.5 py-0.5 rounded text-center truncate cursor-grab active:cursor-grabbing
                                ${getFormatColor(post.formato_postagem)}
                                ${isUpdating === post.id ? 'opacity-50 cursor-not-allowed' : ''}
                                ${draggedPost?.id === post.id ? 'opacity-50 scale-95' : ''}
                                hover:scale-105 transition-transform
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPostClick(post);
                              }}
                            >
                              {getFormatIcon(post.formato_postagem)} {post.titulo.slice(0, 10)}...
                            </div>
                          ))}
                          {datePosts.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{datePosts.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDatePosts.length} {selectedDatePosts.length === 1 ? 'postagem' : 'postagens'} programada{selectedDatePosts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {selectedDatePosts.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhuma postagem programada para este dia
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedDatePosts.map((post) => (
                  <Card 
                    key={post.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, post)}
                    className={`
                      p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all
                      ${isUpdating === post.id ? 'opacity-50 cursor-not-allowed' : ''}
                      ${draggedPost?.id === post.id ? 'opacity-50 scale-95' : ''}
                      hover:scale-[1.02]
                    `}
                  >
                    <div className="space-y-3">
                      {post.anexo_url && (
                        <div className={`relative overflow-hidden rounded-lg ${
                          post.formato_postagem === 'story' || post.formato_postagem === 'reel' 
                            ? 'aspect-[9/16]' 
                            : 'aspect-square'
                        }`}>
                          <img 
                            src={post.anexo_url} 
                            alt={post.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getFormatColor(post.formato_postagem)}>
                            {getFormatIcon(post.formato_postagem)} {post.formato_postagem.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {post.tipo_criativo === 'imagem' ? '🖼️' : '🎬'} {post.tipo_criativo}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium text-sm leading-relaxed">
                          {post.titulo}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            🎯 {post.objetivo_postagem.replace('_', ' ')}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => onPostClick(post)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}