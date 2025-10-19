import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CardsAcessoRapidoProps {
  onLancarReceita: () => void;
  onLancarDespesa: () => void;
}

export function CardsAcessoRapido({ onLancarReceita, onLancarDespesa }: CardsAcessoRapidoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          onClick={onLancarReceita}
          className="cursor-pointer border-2 border-success/20 hover:border-success hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-success/5 to-success/10"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-success group-hover:scale-105 transition-transform">
                ➕ Lançar Receita (Entrada)
              </CardTitle>
              <div className="p-3 bg-success/10 rounded-full group-hover:bg-success/20 transition-colors">
                <ArrowDownCircle className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Registre recebimentos, vendas e outras entradas de caixa
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card
          onClick={onLancarDespesa}
          className="cursor-pointer border-2 border-destructive/20 hover:border-destructive hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-destructive/5 to-destructive/10"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-destructive group-hover:scale-105 transition-transform">
                ➖ Lançar Despesa (Saída)
              </CardTitle>
              <div className="p-3 bg-destructive/10 rounded-full group-hover:bg-destructive/20 transition-colors">
                <ArrowUpCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Registre pagamentos, compras e outras saídas de caixa
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
