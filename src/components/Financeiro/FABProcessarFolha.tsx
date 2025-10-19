import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FABProcessarFolhaProps {
  onClick: () => void;
  className?: string;
}

export function FABProcessarFolha({ onClick, className }: FABProcessarFolhaProps) {
  return (
    <motion.div
      className={cn("fixed bottom-8 right-8 z-50", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Button
        size="lg"
        className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative group"
        onClick={onClick}
        aria-label="Processar nova folha de pagamento"
      >
        <Plus className="h-8 w-8" />
        <span className="absolute -top-2 -right-2 bg-success text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg animate-pulse">
          Novo
        </span>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap border">
          Processar Folha <kbd className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd>
        </div>
      </div>
    </motion.div>
  );
}
