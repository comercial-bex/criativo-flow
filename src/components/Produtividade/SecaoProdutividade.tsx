import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProdutividadeReflexao } from "@/hooks/useProdutividadeReflexao";
import { produtividadeTheme } from "@/styles/produtividade-theme";

// Lazy load dos componentes pesados
import { PomodoroTimer } from "./PomodoroTimer";
import { MetasSmart } from "./MetasSmart";
import { InsightsIA } from "./InsightsIA";
import { ReflexaoDiariaCompleta } from "./ReflexaoDiariaCompleta";
import { ChecklistGTD } from "./ChecklistGTD";
import { MatrizEisenhower } from "./MatrizEisenhower";
import { RadarChartSMART } from "./RadarChartSMART";
import { GraficoEnergiaDia } from "./GraficoEnergiaDia";
import { TimelineReflexoes } from "./TimelineReflexoes";

interface SecaoProdutividadeProps {
  setor: 'grs' | 'design' | 'audiovisual';
  defaultExpanded?: boolean;
}

export function SecaoProdutividade({ setor, defaultExpanded = false }: SecaoProdutividadeProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const { reflexaoHoje } = useProdutividadeReflexao(setor);

  return (
    <div className="relative my-6">
      {/* Background gradient sutil */}
      <div className={`absolute inset-0 bg-gradient-to-br ${produtividadeTheme.gradients.card} rounded-lg -z-10`} />
      
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="relative"
      >
        <CollapsibleTrigger className="group w-full">
          <div className={`flex items-center justify-between p-6 rounded-lg border ${produtividadeTheme.borders.primary} hover:${produtividadeTheme.borders.accent} transition-all duration-300 bg-card/50 backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Produtividade Pessoal
              </h2>
              <ChevronDown 
                className={`h-5 w-5 text-purple-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
            <Badge 
              variant="outline" 
              className={`${reflexaoHoje ? 'border-green-500 text-green-500' : 'border-muted-foreground'}`}
            >
              {reflexaoHoje ? '✓ Atualizado hoje' : 'Sem atividade'}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <AnimatePresence>
          {isOpen && (
            <CollapsibleContent forceMount>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  {/* Resumo Inteligente do Dia */}
                  {reflexaoHoje?.resumo_ia && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`p-4 rounded-lg border ${produtividadeTheme.borders.accent} bg-gradient-to-r ${produtividadeTheme.gradients.card}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <div>
                          <h3 className="font-semibold text-purple-400 mb-1">Resumo Inteligente do Dia</h3>
                          <p className="text-sm text-muted-foreground">{reflexaoHoje.resumo_ia}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Grid de Gráficos Principais */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <RadarChartSMART setor={setor} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <GraficoEnergiaDia setor={setor} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <TimelineReflexoes setor={setor} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <PomodoroTimer setor={setor} />
                    </Suspense>
                  </motion.div>

                  {/* Grid de Ferramentas Práticas */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <Suspense fallback={<Skeleton className="h-[400px]" />}>
                      <MetasSmart setor={setor} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[400px]" />}>
                      <ChecklistGTD setor={setor} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[400px]" />}>
                      <ReflexaoDiariaCompleta setor={setor} />
                    </Suspense>
                  </motion.div>

                  {/* Ferramentas Adicionais */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <MatrizEisenhower />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-[300px]" />}>
                      <InsightsIA setor={setor} />
                    </Suspense>
                  </motion.div>
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </div>
  );
}
