import { useAuth } from "@/hooks/useAuth";
import ReflexaoDiaria from "@/components/GRS/ReflexaoDiaria";
import MetricasRapidas from "@/components/GRS/MetricasRapidas";
import KitProdutividade from "@/components/GRS/KitProdutividade";
import TabelaProjetos from "@/components/GRS/TabelaProjetos";
import TimelineAtividades from "@/components/GRS/TimelineAtividades";
import { SecaoProdutividade } from "@/components/Produtividade/SecaoProdutividade";

export default function PainelGRS() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header com Boas-vindas e Reflexão Diária */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          🎯 Boas-vindas, {user?.user_metadata?.nome || 'GRS'}!
        </h1>
        <ReflexaoDiaria />
      </div>

      {/* Cards de Métricas Rápidas */}
      <MetricasRapidas />

      {/* Seção de Produtividade Pessoal */}
      <SecaoProdutividade setor="grs" defaultExpanded={false} />

      {/* Layout Principal: Kit de Produtividade + Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Coluna Esquerda: Kit de Produtividade */}
        <aside className="space-y-6">
          <KitProdutividade />
        </aside>

        {/* Coluna Direita: Projetos e Timeline */}
        <main className="space-y-6">
          {/* Tabela de Projetos */}
          <TabelaProjetos />

          {/* Timeline de Atividades */}
          <TimelineAtividades />
        </main>
      </div>
    </div>
  );
}
