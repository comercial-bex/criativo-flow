import React from 'react';

interface TaskCoverImageProps {
  coverUrl?: string | null;
  fallbackGradient: string;
  height?: string;
  children?: React.ReactNode;
}

export function TaskCoverImage({
  coverUrl,
  fallbackGradient,
  height = "h-20 sm:h-24",
  children
}: TaskCoverImageProps) {
  return (
    <div className={`relative ${height} overflow-hidden`}>
      {coverUrl ? (
        <>
          <img 
            src={coverUrl} 
            alt="Capa da tarefa"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20" />
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`} />
      )}
      
      {children && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </div>
  );
}
