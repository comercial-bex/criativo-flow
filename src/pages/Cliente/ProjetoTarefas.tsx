import { useParams, useNavigate } from "react-router-dom";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TarefasKanban } from "@/components/TarefasKanban";

export default function ClienteProjetoTarefas() {
  const { projetoId } = useParams<{ projetoId: string }>();
  const navigate = useNavigate();
  const { clientProfile, projects } = useClientDashboard();

  const projeto = projects.find(p => p.id === projetoId);

  if (!clientProfile?.cliente_id) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Carregando dados do cliente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/cliente/painel?tab=projetos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {projeto?.titulo || 'Tarefas do Projeto'}
          </h1>
          <p className="text-muted-foreground">
            Visualização das tarefas do projeto (somente leitura)
          </p>
        </div>
      </div>

      {/* Kanban de Tarefas */}
      <TarefasKanban
        planejamento={{ id: projetoId }}
        clienteId={clientProfile.cliente_id}
        projetoId={projetoId}
      />
    </div>
  );
}
