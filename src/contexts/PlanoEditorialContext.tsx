import React, { createContext, useContext, ReactNode } from 'react';
import { usePlanoEditorialModals } from './PlanoEditorialModalsContext';

interface Post {
  id: string;
  [key: string]: any;
}

interface FilterState {
  formatos: string[];
  objetivos: string[];
  status: string[];
}

interface PlanoEditorialState {
  posts: Post[];
  editingPostId: string | null;
  filters: FilterState;
}

interface PlanoEditorialActions {
  updatePost: (id: string, updates: Partial<Post>) => void;
  setEditingPost: (id: string | null) => void;
  setFilter: (filter: keyof FilterState, value: string[]) => void;
  deletePost: (id: string) => void;
}

interface PlanoEditorialContextType {
  state: PlanoEditorialState;
  actions: PlanoEditorialActions;
}

const PlanoEditorialContext = createContext<PlanoEditorialContextType | null>(null);

interface PlanoEditorialProviderProps {
  children: ReactNode;
  posts: Post[];
  onPostsChange: (posts: Post[]) => void;
  editingPostId: string | null;
  onEditingPostIdChange: (id: string | null) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function PlanoEditorialProvider({
  children,
  posts,
  onPostsChange,
  editingPostId,
  onEditingPostIdChange,
  filters,
  onFiltersChange,
}: PlanoEditorialProviderProps) {
  const updatePost = (id: string, updates: Partial<Post>) => {
    const updatedPosts = posts.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    onPostsChange(updatedPosts);
  };

  const deletePost = (id: string) => {
    onPostsChange(posts.filter(p => p.id !== id));
  };

  const setFilter = (filter: keyof FilterState, value: string[]) => {
    onFiltersChange({ ...filters, [filter]: value });
  };

  const value: PlanoEditorialContextType = {
    state: {
      posts,
      editingPostId,
      filters,
    },
    actions: {
      updatePost,
      setEditingPost: onEditingPostIdChange,
      setFilter,
      deletePost,
    },
  };

  return (
    <PlanoEditorialContext.Provider value={value}>
      {children}
    </PlanoEditorialContext.Provider>
  );
}

export function usePlanoEditorial() {
  const context = useContext(PlanoEditorialContext);
  if (!context) {
    throw new Error('usePlanoEditorial must be used within PlanoEditorialProvider');
  }
  return context;
}
