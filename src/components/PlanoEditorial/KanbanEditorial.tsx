import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCreativeIcon, getCreativeColor, getObjetivoColor } from "@/lib/plano-editorial-helpers";
import { Eye, GripVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  descricao?: string;
  arquivo_visual_url?: string;
  status_post?: string;
  responsavel_id?: string;
}

interface KanbanEditorialProps {
  posts: Post[];
  onPostsChange: (posts: Post[]) => void;
  onPostClick?: (post: Post) => void;
  responsaveis: Array<{ id: string; nome: string }>;
}

const STATUS_COLUMNS = [
  { id: 'a_fazer', label: 'A Fazer', color: 'bg-gray-100' },
  { id: 'em_producao', label: 'Em Produção', color: 'bg-blue-100' },
  { id: 'pronto', label: 'Pronto', color: 'bg-green-100' },
  { id: 'publicado', label: 'Publicado', color: 'bg-purple-100' },
];

const SortablePostCard = ({ post, responsaveis, onPostClick }: { 
  post: Post; 
  responsaveis: Array<{ id: string; nome: string }>;
  onPostClick?: (post: Post) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: post.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const responsavel = responsaveis.find(r => r.id === post.responsavel_id);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-move">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm line-clamp-2">
                  {post.titulo || 'Sem título'}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPostClick?.(post)}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>

              {post.arquivo_visual_url && (
                <div className="rounded overflow-hidden">
                  {post.arquivo_visual_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img 
                      src={post.arquivo_visual_url} 
                      alt={post.titulo}
                      className="w-full h-32 object-cover"
                    />
                  ) : post.arquivo_visual_url.match(/\.(mp4|mov)$/i) ? (
                    <video 
                      src={post.arquivo_visual_url}
                      className="w-full h-32 object-cover"
                      muted
                    />
                  ) : null}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                <Badge className={getCreativeColor(post.formato_postagem)} variant="secondary">
                  {getCreativeIcon(post.formato_postagem)} {post.formato_postagem}
                </Badge>
                <Badge className={getObjetivoColor(post.objetivo_postagem)} variant="outline">
                  {post.objetivo_postagem}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                📅 {format(parseISO(post.data_postagem), "dd 'de' MMMM", { locale: ptBR })}
              </div>

              {responsavel && (
                <div className="text-xs text-muted-foreground">
                  👤 {responsavel.nome}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const KanbanEditorial = ({ posts, onPostsChange, onPostClick, responsaveis }: KanbanEditorialProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activePost = posts.find(p => p.id === active.id);
    const overColumnId = over.id as string;

    if (!activePost) return;

    // Se soltou em uma coluna (não em outro post)
    if (STATUS_COLUMNS.find(col => col.id === overColumnId)) {
      const updatedPosts = posts.map(post =>
        post.id === activePost.id
          ? { ...post, status_post: overColumnId }
          : post
      );
      onPostsChange(updatedPosts);
    }
  };

  const getPostsByStatus = (status: string) => {
    return posts.filter(post => (post.status_post || 'a_fazer') === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(column => {
          const columnPosts = getPostsByStatus(column.id);

          return (
            <Card key={column.id} className="h-fit">
              <CardHeader className={`${column.color} border-b`}>
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary" className="ml-2">
                    {columnPosts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 min-h-[400px]">
                <SortableContext
                  items={columnPosts.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnPosts.map(post => (
                    <SortablePostCard
                      key={post.id}
                      post={post}
                      responsaveis={responsaveis}
                      onPostClick={onPostClick}
                    />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DndContext>
  );
};
