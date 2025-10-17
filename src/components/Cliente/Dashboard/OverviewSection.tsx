import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, TrendingUp, Clock } from "lucide-react";

interface OverviewSectionProps {
  clienteId: string;
  counts: any;
  timeline: any[];
}

export function OverviewSection({ counts, timeline }: OverviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.postsPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planejamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.planejamentosPendentes}</div>
            <p className="text-xs text-muted-foreground">Para revisar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pagamentosVencendo}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Este Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeline.filter(t => t.status === 'entregue').length}</div>
            <p className="text-xs text-muted-foreground">de {timeline.length} planejadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeline.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'entregue' ? 'default' : 'secondary'}>
                    {item.tipo}
                  </Badge>
                  <span className="font-medium">{item.nome}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.data}</span>
              </div>
            ))}
            {timeline.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum item programado para este mês</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
