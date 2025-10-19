import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCentrosCusto, CentroCusto } from '@/hooks/useCentrosCusto';
import { Skeleton } from '@/components/ui/skeleton';

interface CentrosCustoTableProps {
  centros: CentroCusto[];
  isLoading: boolean;
  onEdit: (centro: CentroCusto) => void;
}

const getTipoBadgeColor = (tipo: string) => {
  const colors: Record<string, string> = {
    operacional: 'bg-blue-500/10 text-blue-500',
    administrativo: 'bg-purple-500/10 text-purple-500',
    comercial: 'bg-green-500/10 text-green-500',
    projetos: 'bg-orange-500/10 text-orange-500',
  };
  return colors[tipo] || 'bg-gray-500/10 text-gray-500';
};

export function CentrosCustoTable({ centros, isLoading, onEdit }: CentrosCustoTableProps) {
  const { deleteCentro } = useCentrosCusto();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Orçamento Mensal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {centros.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Nenhum centro de custo cadastrado
            </TableCell>
          </TableRow>
        ) : (
          centros.map((centro) => (
            <TableRow key={centro.id}>
              <TableCell className="font-mono font-semibold">{centro.codigo}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{centro.nome}</p>
                  {centro.descricao && (
                    <p className="text-sm text-muted-foreground">{centro.descricao}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTipoBadgeColor(centro.tipo)}>
                  {centro.tipo}
                </Badge>
              </TableCell>
              <TableCell>
                {centro.orcamento_mensal
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(centro.orcamento_mensal)
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={centro.ativo ? 'default' : 'secondary'}>
                  {centro.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(centro)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Deseja realmente excluir este centro de custo?')) {
                      deleteCentro(centro.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
