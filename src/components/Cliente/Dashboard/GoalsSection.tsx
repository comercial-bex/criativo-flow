import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";
import { ClienteMeta } from "@/hooks/useClientMetas";

interface GoalsSectionProps {
  metas: ClienteMeta[];
}

export function GoalsSection({ metas }: GoalsSectionProps) {
  const getStatusColor = (progresso: number) => {
    if (progresso >= 100) return 'text-green-600';
    if (progresso >= 70) return 'text-blue-600';
    if (progresso >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metasAtivas = metas.filter(m => m.status === 'em_andamento');
  const metasConcluidas = metas.filter(m => m.status === 'concluida');

  return (
    <div className="space-y-6">
      {/* Resumo de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metasAtivas.length}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metasConcluidas.length}</div>
            <p className="text-xs text-muted-foreground">Alcançadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metas.length > 0 ? Math.round((metasConcluidas.length / metas.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">De aprovação</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {metasAtivas.map((meta) => (
            <div key={meta.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{meta.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                </div>
                <Badge variant="outline">{meta.tipo_meta}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={meta.progresso_percent} className="flex-1" />
                <span className={`text-sm font-bold ${getStatusColor(meta.progresso_percent)}`}>
                  {Math.round(meta.progresso_percent)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Atual: {meta.valor_atual} {meta.unidade}</span>
                <span>Meta: {meta.valor_alvo} {meta.unidade}</span>
              </div>
            </div>
          ))}

          {metasAtivas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma meta ativa no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas Concluídas */}
      {metasConcluidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Metas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metasConcluidas.map((meta) => (
                <div key={meta.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">{meta.titulo}</p>
                    <p className="text-xs text-muted-foreground">{meta.valor_atual} {meta.unidade} alcançados</p>
                  </div>
                  <Badge className="bg-green-600">✓ Concluída</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
