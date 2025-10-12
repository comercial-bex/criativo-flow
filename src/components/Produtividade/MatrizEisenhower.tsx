import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3x3 } from "lucide-react";

export function MatrizEisenhower() {
  const quadrantes = [
    {
      titulo: "Urgente & Importante",
      cor: "border-red-500 bg-red-50 dark:bg-red-950/20",
      items: ["Crise em projeto X", "Deadline hoje"]
    },
    {
      titulo: "Não Urgente & Importante",
      cor: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
      items: ["Planejamento estratégico", "Capacitação"]
    },
    {
      titulo: "Urgente & Não Importante",
      cor: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
      items: ["Interrupções", "Reuniões não essenciais"]
    },
    {
      titulo: "Não Urgente & Não Importante",
      cor: "border-gray-500 bg-gray-50 dark:bg-gray-950/20",
      items: ["Distrações", "Atividades triviais"]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-indigo-500" />
          Matriz de Eisenhower
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quadrantes.map((quadrante, idx) => (
            <div 
              key={idx} 
              className={`p-3 border-2 rounded-lg ${quadrante.cor} min-h-[120px]`}
            >
              <h4 className="font-medium text-xs mb-2">{quadrante.titulo}</h4>
              <div className="space-y-1">
                {quadrante.items.map((item, i) => (
                  <Badge key={i} variant="secondary" className="text-xs block">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Organize suas tarefas por urgência e importância
        </p>
      </CardContent>
    </Card>
  );
}
