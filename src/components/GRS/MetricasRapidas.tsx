import { useProjetosGRS } from "@/hooks/useProjetosGRS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricasRapidas() {
  const { metricas, loading } = useProjetosGRS();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      titulo: "Projetos - Pendente",
      valor: metricas.projetosPendentes,
      cor: "bg-blue-500 text-white"
    },
    {
      titulo: "Tarefas - Novo",
      valor: metricas.tarefasNovo,
      cor: "bg-green-500 text-white"
    },
    {
      titulo: "Tarefas - Em andamento",
      valor: metricas.tarefasEmAndamento,
      cor: "bg-red-500 text-white"
    },
    {
      titulo: "Tarefas - Concluído",
      valor: metricas.tarefasConcluido,
      cor: "bg-orange-500 text-white"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className={card.cor}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              {card.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.valor}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
