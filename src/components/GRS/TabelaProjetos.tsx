import { useProjetosGRS } from "@/hooks/useProjetosGRS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function TabelaProjetos() {
  const { projetos, loading } = useProjetosGRS();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pendente': 'bg-yellow-500',
      'em_andamento': 'bg-blue-500',
      'concluido': 'bg-green-500',
      'cancelado': 'bg-red-500',
      'pausado': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'pausado': 'Pausado'
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">📅 Meus Projetos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : projetos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum projeto encontrado
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetos.map((projeto, idx) => (
                <TableRow
                  key={projeto.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/grs/cliente/${projeto.cliente_id}/projeto/${projeto.id}/tarefas`)}
                >
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-semibold">{projeto.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {projeto.cliente_nome}
                  </TableCell>
                  <TableCell>
                    {projeto.data_prazo
                      ? format(new Date(projeto.data_prazo), "dd/MM/yyyy", { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(projeto.status)}>
                      {getStatusLabel(projeto.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={projeto.progresso || 0} className="w-20" />
                      <span className="text-xs text-muted-foreground">
                        {projeto.progresso || 0}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
