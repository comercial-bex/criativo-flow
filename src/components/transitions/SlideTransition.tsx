import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
}

const directionOffsets = {
  left: { x: -30, y: 0 },
  right: { x: 30, y: 0 },
  up: { x: 0, y: -30 },
  down: { x: 0, y: 30 },
};

export function SlideTransition({ 
  children, 
  direction = "up",
  delay = 0 
}: SlideTransitionProps) {
  const offset = directionOffsets[direction];

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: offset.x, 
        y: offset.y 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.4, 0, 0.2, 1] as const,
        }
      }}
      exit={{ 
        opacity: 0,
        x: -offset.x,
        y: -offset.y,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 1, 1] as const,
        }
      }}
    >
      {children}
    </motion.div>
  );
}
