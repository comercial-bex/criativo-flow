import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstagramPreview } from './InstagramPreview';
import { EditarPostModal } from './EditarPostModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';
import { getTipoConteudoIcon, getTipoConteudoColor, getCreativeIcon, getCreativeColor } from '@/lib/plano-editorial-helpers';
import { Eye, Edit, Trash2, Copy, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CartaoPlanoEditorialProps {
  posts: any[];
  onPostsChange: (posts: any[]) => void;
  onPostClick?: (post: any) => void;
  onEditPost?: (post: any) => void;
  clienteId: string;
  projetoId?: string;
  responsaveisData?: any[];
}

export const CartaoPlanoEditorial = ({ 
  posts, 
  onPostsChange, 
  onPostClick,
  onEditPost,
  clienteId,
  projetoId,
  responsaveisData = []
}: CartaoPlanoEditorialProps) => {
  const [responsaveis, setResponsaveis] = useState<Record<string, any>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Carregar responsáveis
  const loadResponsaveis = async () => {
    const responsaveisIds = [...new Set(posts.map(p => p.responsavel_id).filter(Boolean))];
    if (responsaveisIds.length > 0) {
      const { data } = await supabase
        .from('pessoas')
        .select('id, nome, avatar_url')
        .in('id', responsaveisIds);
      
      const map = data?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {};
      setResponsaveis(map);
    }
  };

  useState(() => {
    loadResponsaveis();
  });

  const handleDuplicarPost = async (postOriginal: any) => {
    try {
      const novoPost = {
        ...postOriginal,
        id: undefined,
        titulo: `${postOriginal.titulo} (Cópia)`,
        data_postagem: new Date().toISOString().split('T')[0],
        status_post: 'a_fazer',
        tarefa_vinculada_id: null,
        created_at: undefined,
        updated_at: undefined
      };

      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert(novoPost)
        .select()
        .single();

      if (error) throw error;

      toast.success('✅ Post duplicado com sucesso!');
      onPostsChange([...posts, data]);
    } catch (error) {
      console.error('Erro ao duplicar post:', error);
      toast.error('❌ Erro ao duplicar post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('posts_planejamento')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('✅ Post excluído com sucesso!');
      onPostsChange(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('❌ Erro ao excluir post');
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Crie novos posts usando o Wizard ou importe de tarefas.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <Card 
          key={post.id || post.temp_id} 
          className="relative overflow-hidden border-primary/20 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
        >
          {/* Badge de Status (Salvo/Rascunho) */}
          <div className="absolute top-3 right-3 z-10">
            <Badge variant={post.id ? 'default' : 'secondary'} className="shadow-lg">
              {post.id ? '✅ Salvo' : '📝 Rascunho'}
            </Badge>
          </div>

          {/* Preview Visual (Instagram Mock) */}
          <div className="w-full h-72 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full h-full max-w-[280px] mx-auto">
              <InstagramPreview post={post} />
            </div>
          </div>

          {/* Conteúdo */}
          <CardContent className="p-5 space-y-4 min-h-[280px] flex flex-col justify-between">
            {/* Título e Data */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem] max-h-[4rem] overflow-hidden">{post.titulo}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.data_postagem + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </div>
            </div>

            {/* Tipo de Conteúdo e Formato */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tipo de Conteúdo */}
              <Badge className={`${getTipoConteudoColor(post.tipo_conteudo)} border shadow-sm`}>
                <span className="mr-1">{getTipoConteudoIcon(post.tipo_conteudo)}</span>
                {post.tipo_conteudo || 'Informar'}
              </Badge>

              {/* Formato */}
              <Badge className={`${getCreativeColor(post.formato_postagem)} border`}>
                <span className="mr-1">{getCreativeIcon(post.formato_postagem)}</span>
                {post.formato_postagem}
              </Badge>
            </div>

            {/* Texto Estruturado */}
            {post.texto_estruturado && (
              <div className="bg-muted/50 p-3 rounded-lg border max-h-[5rem] overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1">Estrutura Textual</p>
                <p className="text-sm line-clamp-3 leading-relaxed overflow-hidden text-ellipsis">{post.texto_estruturado}</p>
              </div>
            )}

            {/* Responsável */}
            {post.responsavel_id && responsaveis[post.responsavel_id] && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {responsaveis[post.responsavel_id].nome}
                </span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPostClick?.(post)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPost(post);
                  setShowEditModal(true);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDuplicarPost(post)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeletePost(post.id)}
                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Modal de Edição */}
      {selectedPost && (
        <EditarPostModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          post={selectedPost}
          clienteId={clienteId}
          projetoId={projetoId}
          responsaveis={responsaveisData}
          onSave={(updatedPost) => {
            const updatedPosts = posts.map(p => 
              p.id === updatedPost.id ? updatedPost : p
            );
            onPostsChange(updatedPosts);
            setShowEditModal(false);
          }}
          onRefresh={() => {
            // Reload posts if needed
          }}
        />
      )}
    </div>
  );
};
