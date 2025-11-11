import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
}

export function StaggerChildren({ 
  children, 
  staggerDelay = 0.1 
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  delay?: number;
}

export function StaggerItem({ children, delay = 0 }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20,
          scale: 0.95,
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            delay,
            ease: [0.4, 0, 0.2, 1] as const,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
