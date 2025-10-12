import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PomodoroTimer } from "@/components/Produtividade/PomodoroTimer";
import { MetasSmart } from "@/components/Produtividade/MetasSmart";
import { InsightsIA } from "@/components/Produtividade/InsightsIA";
import { ChecklistGTD } from "@/components/Produtividade/ChecklistGTD";
import { MatrizEisenhower } from "@/components/Produtividade/MatrizEisenhower";
import { ReflexaoDiariaCompleta } from "@/components/Produtividade/ReflexaoDiariaCompleta";
import { RadarChartSMART } from "@/components/Produtividade/RadarChartSMART";
import { GraficoEnergiaDia } from "@/components/Produtividade/GraficoEnergiaDia";
import { TimelineReflexoes } from "@/components/Produtividade/TimelineReflexoes";
import { TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProdutividadeReflexao } from "@/hooks/useProdutividadeReflexao";
import { motion } from "framer-motion";

export default function DashboardProdutividade() {
  const { user } = useAuth();
  const setor = user?.user_metadata?.especialidade || 'grs';
  const { reflexaoHoje } = useProdutividadeReflexao(setor);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Dashboard de Produtividade
          </h1>
        </div>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho, metas e insights inteligentes em tempo real
        </p>
      </motion.div>

      {/* Resumo Semanal IA - Card Grande */}
      {reflexaoHoje?.resumo_ia && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Resumo Inteligente do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {reflexaoHoje.resumo_ia}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grid 2x2: Gráficos Principais */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <RadarChartSMART setor={setor} />
        <GraficoEnergiaDia setor={setor} />
        <TimelineReflexoes setor={setor} />
        <PomodoroTimer setor={setor} />
      </motion.div>

      {/* Grid 3 Colunas: Ferramentas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="space-y-6">
          <MetasSmart setor={setor} />
        </div>
        
        <div className="space-y-6">
          <ChecklistGTD setor={setor} />
          <MatrizEisenhower />
        </div>
        
        <div className="space-y-6">
          <ReflexaoDiariaCompleta setor={setor} />
          <InsightsIA setor={setor} />
        </div>
      </motion.div>
    </div>
  );
}
