import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateTaskFromPostButton } from "./CreateTaskFromPostButton";
import { GenerateCaptionButton } from "./GenerateCaptionButton";
import { SuggestObjectiveButton } from "./SuggestObjectiveButton";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanoEditorialPostRowProps {
  post: any;
  index: number;
  onRefresh: () => void;
}

export function PlanoEditorialPostRow({ post, index, onRefresh }: PlanoEditorialPostRowProps) {
  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      card: 'bg-blue-100 text-blue-700',
      reels: 'bg-pink-100 text-pink-700',
      carrossel: 'bg-purple-100 text-purple-700',
      story: 'bg-orange-100 text-orange-700',
      outro: 'bg-gray-100 text-gray-700'
    };
    return colors[tipo] || colors.outro;
  };

  const getObjetivoColor = (objetivo: string) => {
    const colors: Record<string, string> = {
      humanizar: 'bg-green-100 text-green-700',
      educar: 'bg-blue-100 text-blue-700',
      resolver: 'bg-yellow-100 text-yellow-700',
      entreter: 'bg-pink-100 text-pink-700',
      converter: 'bg-purple-100 text-purple-700'
    };
    return colors[objetivo] || colors.educar;
  };

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-bold text-muted-foreground">{String(index).padStart(2, '0')}</TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {new Date(post.data_postagem).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(post.data_postagem).toLocaleDateString('pt-BR', { weekday: 'short' })}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className={getTipoColor(post.tipo_criativo || 'outro')}>
          {post.tipo_criativo || 'Outro'}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={getObjetivoColor(post.objetivo_postagem || 'educar')}>
            {post.objetivo_postagem || 'Educar'}
          </Badge>
          <SuggestObjectiveButton postId={post.id} currentObjective={post.objetivo_postagem} onRefresh={onRefresh} />
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-[250px] truncate text-sm">
            {post.legenda || 'Sem legenda'}
          </div>
          <GenerateCaptionButton postId={post.id} onRefresh={onRefresh} />
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">{post.responsavel?.nome || 'Não atribuído'}</span>
      </TableCell>
      
      <TableCell>
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {post.contexto_estrategico || '-'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <CreateTaskFromPostButton post={post} onTaskCreated={onRefresh} />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
