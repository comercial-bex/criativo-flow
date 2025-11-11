import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeTransitionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeTransition({ 
  children, 
  delay = 0,
  duration = 0.4 
}: FadeTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: "easeOut",
        }
      }}
      exit={{ 
        opacity: 0,
        transition: {
          duration: duration * 0.75,
          ease: "easeIn",
        }
      }}
    >
      {children}
    </motion.div>
  );
}
