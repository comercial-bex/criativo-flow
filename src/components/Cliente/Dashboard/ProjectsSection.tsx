import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Calendar } from "lucide-react";
import { ProjectWithTasks } from "@/hooks/useClientDashboard";
import { useState } from "react";
import { ProjectTasksModal } from "./ProjectTasksModal";

interface ProjectsSectionProps {
  projects: ProjectWithTasks[];
  clienteId: string;
}

export function ProjectsSection({ projects, clienteId }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'em_andamento': 'bg-blue-500',
      'concluido': 'bg-green-500',
      'pausado': 'bg-yellow-500',
      'cancelado': 'bg-red-500'
    };
    return variants[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'pausado': 'Pausado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Meus Projetos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Nenhum projeto ativo</p>
              <p className="text-sm">Seus projetos aparecerão aqui</p>
            </div>
          ) : (
            projects.map((projeto) => (
              <Card key={projeto.id} className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  {/* Header do Projeto */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{projeto.titulo}</h3>
                    <Badge className={getStatusBadge(projeto.status)}>
                      {getStatusLabel(projeto.status)}
                    </Badge>
                  </div>

                  {/* Datas */}
                  {(projeto.data_inicio || projeto.data_fim) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {projeto.data_inicio && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {projeto.data_fim && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Término: {new Date(projeto.data_fim).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progresso de Tarefas */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tarefas: {projeto.tarefas_concluidas}/{projeto.total_tarefas}
                      </span>
                      <span className="font-semibold">{projeto.progresso}%</span>
                    </div>
                    <Progress value={projeto.progresso} className="h-2" />
                  </div>

                  {/* Botão Ver Tarefas */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedProject(projeto);
                      setIsModalOpen(true);
                    }}
                  >
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Ver Tarefas do Projeto
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <ProjectTasksModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          projeto={selectedProject}
          clienteId={clienteId}
        />
      )}
    </div>
  );
}
