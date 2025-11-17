import { useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function usePlanoEditorialDragDrop(
  posts: any[],
  onPostsChange: (posts: any[]) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = posts.findIndex(p => p.id === active.id);
    const newIndex = posts.findIndex(p => p.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPosts = arrayMove(posts, oldIndex, newIndex);
      onPostsChange(reorderedPosts);
    }
  };

  return { sensors, handleDragEnd };
}
