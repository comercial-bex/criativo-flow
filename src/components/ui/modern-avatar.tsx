import * as React from "react";

interface ModernAvatarProps {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}

export const ModernAvatar = ({ 
  size = 24, 
  src, 
  alt = "Avatar",
  className = ""
}: ModernAvatarProps) => {
  return (
    <span
      className={`rounded-full inline-block overflow-hidden border border-gray-300 dark:border-gray-600 duration-200 hover:scale-110 transition-transform ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-bex to-bex-dark flex items-center justify-center text-white text-xs font-semibold">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </span>
  );
};
