import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface UsePostEditorProps {
  post: any;
  onSave: (updatedPost: any) => void;
  autoSave?: boolean;
}

export function usePostEditor({ post, onSave, autoSave = true }: UsePostEditorProps) {
  const [editedPost, setEditedPost] = useState(post);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Detectar mudanças
  useEffect(() => {
    const changed = JSON.stringify(editedPost) !== JSON.stringify(post);
    setHasChanges(changed);
  }, [editedPost, post]);

  // Auto-save a cada 30 segundos se houver mudanças
  useEffect(() => {
    if (!autoSave || !hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, [editedPost, hasChanges, autoSave]);

  const updateField = (field: string, value: any) => {
    setEditedPost((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Salvar post
      if (editedPost.id && !editedPost.id.startsWith('temp-')) {
        const { error: postError } = await supabase
          .from('posts_planejamento')
          .update(editedPost)
          .eq('id', editedPost.id);

        if (postError) throw postError;

        // Sincronizar com tarefa vinculada se existir
        if (editedPost.tarefa_vinculada_id) {
          await sincronizarComTarefa(editedPost);
        }
      }

      setLastSaved(new Date());
      setHasChanges(false);
      onSave(editedPost);
      toast.success('Post atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const sincronizarComTarefa = async (postAtualizado: any) => {
    try {
      const statusTarefa = postAtualizado.status_post === 'publicado' ? 'concluido' : 'em_andamento';
      
      const { error } = await supabase
        .from('tarefa')
        .update({
          titulo: postAtualizado.titulo,
          descricao: postAtualizado.texto_estruturado,
          data_prazo: postAtualizado.data_postagem,
          status: statusTarefa
        })
        .eq('id', postAtualizado.tarefa_vinculada_id);

      if (error) throw error;
      
      console.log('✅ Tarefa sincronizada com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar tarefa:', error);
    }
  };

  const criarTarefaVinculada = async (clienteId: string, projetoId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const tarefaData = {
        titulo: editedPost.titulo,
        descricao: editedPost.texto_estruturado || 'Post do plano editorial',
        data_prazo: editedPost.data_postagem,
        responsavel_id: user.id,
        cliente_id: clienteId,
        projeto_id: projetoId || null,
        tipo_tarefa: 'Conteúdo' as const,
        status: 'a_fazer' as const,
        prioridade: 'media' as const
      };

      const { data: novaTarefa, error } = await supabase
        .from('tarefa')
        .insert([tarefaData])
        .select()
        .single();

      if (error) throw error;

      // Atualizar post com ID da tarefa
      updateField('tarefa_vinculada_id', novaTarefa.id);
      toast.success('Tarefa vinculada criada!');
      
      return novaTarefa;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa vinculada');
      return null;
    }
  };

  return {
    editedPost,
    updateField,
    handleSave,
    isSaving,
    hasChanges,
    lastSaved,
    criarTarefaVinculada,
    setEditedPost
  };
}
