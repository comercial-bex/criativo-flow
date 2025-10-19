import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FABLancamentoProps {
  onLancarReceita: () => void;
  onLancarDespesa: () => void;
}

export function FABLancamento({ onLancarReceita, onLancarDespesa }: FABLancamentoProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={onLancarReceita}
          className="cursor-pointer py-3 hover:bg-success/10"
        >
          <span className="text-success font-semibold">➕ Lançar Receita</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLancarDespesa}
          className="cursor-pointer py-3 hover:bg-destructive/10"
        >
          <span className="text-destructive font-semibold">➖ Lançar Despesa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
