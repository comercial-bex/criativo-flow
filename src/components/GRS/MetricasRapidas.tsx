import { useProjetosGRS } from "@/hooks/useProjetosGRS";
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from "@/components/ui/bex-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricasRapidas() {
  const { metricas, loading } = useProjetosGRS();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <BexCard key={i} variant="gaming">
            <BexCardHeader>
              <Skeleton className="h-4 w-24" />
            </BexCardHeader>
            <BexCardContent>
              <Skeleton className="h-10 w-16" />
            </BexCardContent>
          </BexCard>
        ))}
      </div>
    );
  }

  const cards = [
    {
      titulo: "Projetos - Pendente",
      valor: metricas.projetosPendentes,
      corTitulo: "text-blue-400"
    },
    {
      titulo: "Tarefas - Novo",
      valor: metricas.tarefasNovo,
      corTitulo: "text-bex"
    },
    {
      titulo: "Tarefas - Em andamento",
      valor: metricas.tarefasEmAndamento,
      corTitulo: "text-red-400"
    },
    {
      titulo: "Tarefas - Concluído",
      valor: metricas.tarefasConcluido,
      corTitulo: "text-orange-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <BexCard key={idx} variant="gaming" className="group">
          <BexCardHeader className="pb-2">
            <BexCardTitle className={`text-sm font-medium ${card.corTitulo}`}>
              {card.titulo}
            </BexCardTitle>
          </BexCardHeader>
          <BexCardContent>
            <p className="text-3xl font-bold text-white">{card.valor}</p>
          </BexCardContent>
        </BexCard>
      ))}
    </div>
  );
}
