import { useState } from "react";
import { useProjetos } from "@/hooks/useProjetos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban, Plus, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjetosTabProps {
  clienteId: string;
}

export function ProjetosTab({ clienteId }: ProjetosTabProps) {
  const { projetos, loading } = useProjetos();
  const [filter, setFilter] = useState<string>("todos");

  const clienteProjetos = projetos.filter((p) => p.cliente_id === clienteId);

  const filteredProjetos =
    filter === "todos"
      ? clienteProjetos
      : clienteProjetos.filter((p) => p.status === filter);

  const stats = {
    total: clienteProjetos.length,
    em_andamento: clienteProjetos.filter((p) => p.status === "em_andamento").length,
    concluido: clienteProjetos.filter((p) => p.status === "concluido").length,
    pausado: clienteProjetos.filter((p) => p.status === "pausado").length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("todos")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("em_andamento")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Em Andamento</div>
            <div className="text-2xl font-bold text-blue-600">{stats.em_andamento}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("concluido")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Concluídos</div>
            <div className="text-2xl font-bold text-green-600">{stats.concluido}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("pausado")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pausados</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pausado}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {filter === "todos" ? "Todos os Projetos" : `Projetos - ${filter}`}
        </h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {filteredProjetos.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto encontrado"
          description="Crie um novo projeto para começar"
          action={{
            label: "Criar Projeto",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredProjetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{projeto.titulo}</CardTitle>
                  <Badge
                    variant={
                      projeto.status === "em_andamento"
                        ? "default"
                        : projeto.status === "concluido"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {projeto.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {projeto.descricao || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{projeto.profiles?.nome || "Sem responsável"}</span>
                </div>
                {projeto.data_prazo && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(projeto.data_prazo), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {projeto.progresso !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{projeto.progresso}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${projeto.progresso}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
