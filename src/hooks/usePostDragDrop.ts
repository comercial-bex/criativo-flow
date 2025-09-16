import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingMove {
  postId: string;
  originalDate: string;
  originalTime: string;
  targetDate: string;
  targetTime: string;
}

interface UsePostDragDropProps {
  posts: any[];
  onPostsUpdate: (posts: any[]) => void;
}

export const usePostDragDrop = ({ posts, onPostsUpdate }: UsePostDragDropProps) => {
  const [pendingMoves, setPendingMoves] = useState<Map<string, PendingMove>>(new Map());
  const [isDragging, setIsDragging] = useState(false);

  // Utility to convert date to America/Belem timezone
  const withBelemTimezone = (date: Date): Date => {
    const belemOffset = -3 * 60; // UTC-3 in minutes
    return new Date(date.getTime() + (belemOffset * 60000));
  };

  // Check if date is in the past
  const isPastDate = useCallback((targetDate: string): boolean => {
    const target = new Date(targetDate);
    const now = withBelemTimezone(new Date());
    return target < now;
  }, []);

  // Check if post can be dragged
  const canDragPost = useCallback((post: any): boolean => {
    return post.status !== 'published';
  }, []);

  // Calculate target date and time
  const calculateTargetDateTime = useCallback((targetDay: number, currentMonth: Date, originalPost?: any): { date: string, time: string } => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), targetDay);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Use original time if available, otherwise default to 09:00
    const timeStr = originalPost?.hora_postagem || '09:00';
    
    return { date: dateStr, time: timeStr };
  }, []);

  // Optimistic update
  const applyOptimisticUpdate = useCallback((postId: string, newDate: string, newTime: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, data_postagem: newDate, hora_postagem: newTime }
        : post
    );
    onPostsUpdate(updatedPosts);
  }, [posts, onPostsUpdate]);

  // Rollback update
  const rollbackUpdate = useCallback((postId: string, originalDate: string, originalTime: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, data_postagem: originalDate, hora_postagem: originalTime }
        : post
    );
    onPostsUpdate(updatedPosts);
  }, [posts, onPostsUpdate]);

  // Handle drag start
  const handleDragStart = useCallback((postId: string) => {
    setIsDragging(true);
    const post = posts.find(p => p.id === postId);
    if (post && canDragPost(post)) {
      // Store original data for potential rollback
      setPendingMoves(prev => new Map(prev.set(postId, {
        postId,
        originalDate: post.data_postagem,
        originalTime: post.hora_postagem || '09:00',
        targetDate: '',
        targetTime: ''
      })));
    }
  }, [posts, canDragPost]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (postId: string, targetDay: number, currentMonth: Date) => {
    const post = posts.find(p => p.id === postId);
    const pendingMove = pendingMoves.get(postId);
    
    if (!post || !pendingMove || !canDragPost(post)) {
      return false;
    }

    const { date: targetDate, time: targetTime } = calculateTargetDateTime(targetDay, currentMonth, post);
    
    // Validate target date
    if (isPastDate(targetDate)) {
      toast.error('Não é possível agendar posts no passado');
      return false;
    }

    // Check daily limit (example: 5 posts per day)
    const dailyLimit = 5;
    const postsOnTargetDay = posts.filter(p => 
      p.id !== postId && p.data_postagem === targetDate
    ).length;
    
    if (postsOnTargetDay >= dailyLimit) {
      toast.error(`Limite de ${dailyLimit} posts por dia atingido`);
      return false;
    }

    // Apply optimistic update
    applyOptimisticUpdate(postId, targetDate, targetTime);

    try {
      // Call API to reschedule
      const response = await supabase.functions.invoke('reschedule-post', {
        body: {
          post_id: postId,
          scheduled_date: `${targetDate}T${targetTime}:00-03:00`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      // Handle different response codes
      if (result.code === 'SLOT_CONFLICT') {
        // Show conflict dialog
        const useNextSlot = confirm(
          `Conflito de horário detectado. Deseja usar o próximo horário disponível: ${new Date(result.next_available).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}?`
        );
        
        if (useNextSlot) {
          // Reschedule to next available slot
          const nextSlotResponse = await supabase.functions.invoke('reschedule-post', {
            body: {
              post_id: postId,
              scheduled_date: result.next_available
            }
          });
          
          if (nextSlotResponse.error) {
            throw new Error(nextSlotResponse.error.message);
          }
          
          const nextSlotDate = new Date(result.next_available);
          const newDate = nextSlotDate.toISOString().split('T')[0];
          const newTime = nextSlotDate.toTimeString().split(' ')[0];
          
          applyOptimisticUpdate(postId, newDate, newTime);
          
          // Show undo toast
          const undo = () => {
            rollbackUpdate(postId, pendingMove.originalDate, pendingMove.originalTime);
            handleUndo(postId);
          };
          
          toast.success(`Post movido para ${newDate} às ${newTime}`, {
            action: {
              label: 'Desfazer',
              onClick: undo
            },
            duration: 10000
          });
        } else {
          // Rollback
          rollbackUpdate(postId, pendingMove.originalDate, pendingMove.originalTime);
        }
        
        return true;
      }

      // Success case
      toast.success(`Post movido para ${targetDate} às ${targetTime}`, {
        action: {
          label: 'Desfazer',
          onClick: () => {
            rollbackUpdate(postId, pendingMove.originalDate, pendingMove.originalTime);
            handleUndo(postId);
          }
        },
        duration: 10000
      });

      // Clear pending move
      setPendingMoves(prev => {
        const newMap = new Map(prev);
        newMap.delete(postId);
        return newMap;
      });

      return true;

    } catch (error: any) {
      console.error('Error rescheduling post:', error);
      
      // Rollback optimistic update
      rollbackUpdate(postId, pendingMove.originalDate, pendingMove.originalTime);
      
      // Show error toast
      if (error.message.includes('PAST_DATE')) {
        toast.error('Não é possível agendar posts no passado');
      } else if (error.message.includes('PUBLISHED_LOCKED')) {
        toast.error('Posts publicados não podem ser reagendados');
      } else {
        toast.error('Erro ao mover post. Tente novamente.');
      }
      
      return false;
    }
  }, [posts, pendingMoves, canDragPost, calculateTargetDateTime, isPastDate, applyOptimisticUpdate, rollbackUpdate]);

  // Handle undo
  const handleUndo = useCallback(async (postId: string) => {
    const pendingMove = pendingMoves.get(postId);
    if (!pendingMove) return;

    try {
      await supabase.functions.invoke('reschedule-post', {
        body: {
          post_id: postId,
          scheduled_date: `${pendingMove.originalDate}T${pendingMove.originalTime}:00-03:00`
        }
      });

      toast.success('Movimento desfeito com sucesso');
    } catch (error) {
      console.error('Error undoing move:', error);
      toast.error('Erro ao desfazer movimento');
    }
  }, [pendingMoves]);

  // Check if day is droppable
  const isDroppable = useCallback((day: number, currentMonth: Date): boolean => {
    const { date } = calculateTargetDateTime(day, currentMonth);
    return !isPastDate(date);
  }, [calculateTargetDateTime, isPastDate]);

  return {
    isDragging,
    canDragPost,
    isDroppable,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleUndo
  };
};