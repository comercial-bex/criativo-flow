import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Target, 
  ListChecks, 
  Grid2X2, 
  Workflow, 
  Coffee,
  Timer,
  ClipboardList,
  Lightbulb,
  Clock,
  CheckSquare,
  Brain
} from "lucide-react";

export default function KitProdutividade() {
  const metodos = [
    {
      id: "smart",
      icon: Target,
      titulo: "🎯 Metas SMART",
      descricao: "Specific, Measurable, Achievable, Relevant, Time-bound"
    },
    {
      id: "duas-listas",
      icon: ListChecks,
      titulo: "📋 Duas Listas",
      descricao: "Priorize tarefas importantes vs urgentes"
    },
    {
      id: "eisenhower",
      icon: Grid2X2,
      titulo: "⏱️ Matriz de Eisenhower",
      descricao: "Urgente x Importante em um grid 2x2"
    },
    {
      id: "gtd",
      icon: Workflow,
      titulo: "🚀 Método GTD",
      descricao: "Getting Things Done: Capture, Organize, Execute"
    },
    {
      id: "sapo",
      icon: Coffee,
      titulo: "🐸 Coma o Sapo",
      descricao: "Faça a tarefa mais difícil primeiro"
    },
    {
      id: "pomodoro",
      icon: Timer,
      titulo: "🍅 Pomodoro",
      descricao: "25 minutos de foco + 5 minutos de pausa"
    },
    {
      id: "ivy-lee",
      icon: ClipboardList,
      titulo: "📝 Método Ivy Lee",
      descricao: "6 tarefas mais importantes do dia"
    },
    {
      id: "reflexao",
      icon: Lightbulb,
      titulo: "💭 Reflexão Diária",
      descricao: "Mensagem inspiradora gerada por IA"
    },
    {
      id: "blocos",
      icon: Clock,
      titulo: "⏰ Bloco de Tempo",
      descricao: "Organize sua agenda em blocos dedicados"
    },
    {
      id: "checklist",
      icon: CheckSquare,
      titulo: "✅ Checklist",
      descricao: "Listas de verificação personalizáveis"
    },
    {
      id: "mapa",
      icon: Brain,
      titulo: "🧠 Mapa Mental",
      descricao: "Visualize conexões entre projetos e tarefas"
    }
  ];

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Kit de Produtividade</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {metodos.map((metodo) => {
            const Icon = metodo.icon;
            return (
              <AccordionItem key={metodo.id} value={metodo.id}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{metodo.titulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {metodo.descricao}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
