import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { LancarTituloUnificadoDialog } from "./LancarTituloUnificadoDialog";

export function FABLancamento() {
  return (
    <LancarTituloUnificadoDialog 
      trigger={
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </motion.div>
      }
    />
  );
}
