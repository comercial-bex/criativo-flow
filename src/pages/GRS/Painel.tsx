import { useAuth } from "@/hooks/useAuth";
import ReflexaoDiaria from "@/components/GRS/ReflexaoDiaria";
import MetricasRapidas from "@/components/GRS/MetricasRapidas";
import TabelaProjetos from "@/components/GRS/TabelaProjetos";
import TimelineAtividades from "@/components/GRS/TimelineAtividades";
import { SecaoProdutividade } from "@/components/Produtividade/SecaoProdutividade";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialButton } from "@/components/TutorialButton";

export default function PainelGRS() {
  const { user } = useAuth();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-painel');

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header com Boas-vindas e Reflexão Diária */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            🎯 Boas-vindas, {user?.user_metadata?.nome || 'GRS'}!
          </h1>
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        </div>
        <ReflexaoDiaria />
      </div>

      {/* Cards de Métricas Rápidas */}
      <div data-tour="metricas">
        <MetricasRapidas />
      </div>

      {/* Seção de Produtividade Pessoal */}
      <div data-tour="produtividade">
        <SecaoProdutividade setor="grs" defaultExpanded={false} />
      </div>

      {/* Projetos e Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="projetos">
          <TabelaProjetos />
        </div>
        <div data-tour="timeline">
          <TimelineAtividades />
        </div>
      </div>
    </div>
  );
}
