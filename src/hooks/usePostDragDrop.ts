import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface UsePostDragDropOptions {
  posts: any[];
  setPosts: (posts: any[]) => void;
  onUndoAction?: (message: string) => void;
}

interface ReschedulePostData {
  postId: string;
  newDate: string;
  oldDate?: string;
}

export const usePostDragDrop = ({ posts, setPosts, onUndoAction }: UsePostDragDropOptions) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{ postId: string; oldDate: string; newDate: string }>>([]);

  // Optimistic update - updates UI immediately
  const optimisticUpdate = (postId: string, newDate: string) => {
    const oldPost = posts.find(p => p.id === postId);
    if (!oldPost) return null;

    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, data_postagem: newDate }
        : post
    );
    
    setPosts(updatedPosts);
    return oldPost.data_postagem; // Return old date for potential rollback
  };

  // Rollback function for failed updates
  const rollbackUpdate = (postId: string, originalDate: string) => {
    const revertedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, data_postagem: originalDate }
        : post
    );
    setPosts(revertedPosts);
  };

  // Validate business rules
  const validateReschedule = (postId: string, newDate: string): { valid: boolean; error?: string } => {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return { valid: false, error: 'Post não encontrado' };
    }

    // Check if post is published
    if (post.status === 'published') {
      return { valid: false, error: 'Posts publicados não podem ser reagendados' };
    }

    // Check if date is in the past (using Brazil timezone)
    const now = new Date();
    const newDateObj = new Date(newDate);
    const belomTimezone = 'America/Belem';
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: belomTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const todayInBelem = formatter.format(now);
    const newDateFormatted = formatter.format(newDateObj);
    
    if (newDateFormatted < todayInBelem) {
      return { valid: false, error: 'Não é possível reagendar para uma data no passado' };
    }

    return { valid: true };
  };

  // Main reschedule function
  const reschedulePost = async ({ postId, newDate, oldDate }: ReschedulePostData): Promise<{ success: boolean; error?: string; showUndo?: boolean }> => {
    // Validate before attempting
    const validation = validateReschedule(postId, newDate);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    setIsUpdating(postId);

    try {
      // Optimistic update
      const originalDate = optimisticUpdate(postId, newDate);
      if (!originalDate) {
        return { success: false, error: 'Post não encontrado' };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        rollbackUpdate(postId, originalDate);
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('reschedule-post', {
        body: {
          postId,
          newDate,
          oldDate: oldDate || originalDate,
          userId: user.id
        }
      });

      if (error) {
        rollbackUpdate(postId, originalDate);
        return { success: false, error: error.message || 'Erro ao reagendar post' };
      }

      if (!data.success) {
        rollbackUpdate(postId, originalDate);
        return { success: false, error: data.error || 'Erro desconhecido' };
      }

      // Add to undo stack
      setUndoStack(prev => [...prev, { postId, oldDate: originalDate, newDate }]);

      // Show success message with conflict warning if any
      const message = data.conflicts 
        ? `Post reagendado! ⚠️ ${data.conflicts.count} conflito(s) detectado(s)`
        : 'Post reagendado com sucesso!';

      return { success: true, showUndo: true };

    } catch (error) {
      // Rollback on any error
      const originalDate = posts.find(p => p.id === postId)?.data_postagem;
      if (originalDate) {
        rollbackUpdate(postId, originalDate);
      }
      
      console.error('Error rescheduling post:', error);
      return { success: false, error: 'Erro inesperado ao reagendar post' };
    } finally {
      setIsUpdating(null);
    }
  };

  // Undo last action
  const undoLastAction = async (): Promise<boolean> => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return false;

    try {
      const result = await reschedulePost({
        postId: lastAction.postId,
        newDate: lastAction.oldDate,
        oldDate: lastAction.newDate
      });

      if (result.success) {
        // Remove from undo stack
        setUndoStack(prev => prev.slice(0, -1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error undoing action:', error);
      return false;
    }
  };

  // Check for conflicts on a specific date
  const checkConflicts = (date: string, excludePostId?: string): any[] => {
    return posts.filter(post => 
      post.data_postagem === date && 
      post.id !== excludePostId
    );
  };

  return {
    reschedulePost,
    undoLastAction,
    checkConflicts,
    isUpdating,
    canUndo: undoStack.length > 0,
    validateReschedule
  };
};