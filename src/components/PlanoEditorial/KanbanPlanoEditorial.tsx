import { UniversalKanbanBoard } from '@/components/UniversalKanbanBoard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface KanbanPlanoEditorialProps {
  posts: any[];
  onPostsChange: (posts: any[]) => void;
  onPostClick?: (post: any) => void;
}

export const KanbanPlanoEditorial = ({ posts, onPostsChange, onPostClick }: KanbanPlanoEditorialProps) => {
  const handlePostMove = async (postId: string, newStatus: string) => {
    try {
      // Validar tipo do status
      const validStatus = newStatus as 'a_fazer' | 'em_producao' | 'pronto' | 'publicado' | 'temporario';
      
      // Atualizar status do post no banco
      const { error } = await supabase
        .from('posts_planejamento')
        .update({ status_post: validStatus })
        .eq('id', postId);
      
      if (error) throw error;
      
      // Atualizar estado local
      onPostsChange(posts.map(p => 
        p.id === postId ? { ...p, status_post: validStatus } : p
      ));
      
      toast.success('Post movido com sucesso!');
    } catch (error) {
      console.error('Erro ao mover post:', error);
      toast.error('Erro ao mover post');
    }
  };
  
  return (
    <div className="h-full">
      <UniversalKanbanBoard
        tasks={posts}
        onTaskMove={handlePostMove}
        onTaskCreate={() => {}}
        onTaskClick={onPostClick || (() => {})}
        moduleType="grs"
      />
    </div>
  );
};
