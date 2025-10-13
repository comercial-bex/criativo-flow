import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DataSyncIndicator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingData = [] } = useQuery({
    queryKey: ['admin-temp-data-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_temp_data')
        .select('*, clientes(nome)')
        .is('used_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_temp_data')
        .update({ used_at: new Date().toISOString(), used_in_document_type: 'ignorado' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-temp-data-pending'] });
      toast({ title: 'Registro ignorado' });
    },
  });

  if (pendingData.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <Badge variant="secondary">{pendingData.length}</Badge>
          Pendentes
        </Button>
      </DialogTrigger>
      <DialogContent size="2xl" height="xl" overflow="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Dados Pendentes de Sincronização</DialogTitle>
          <DialogDescription>
            Registros criados em outros módulos aguardando sincronização
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingData.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.clientes?.nome || '-'}</TableCell>
                <TableCell>
                  {item.produto_nome}
                  {item.cargo_atual && ` - ${item.cargo_atual}`}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.origem}
                  </Badge>
                </TableCell>
                <TableCell>
                  R$ {(item.valor_unitario || item.salario_ou_fee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{format(new Date(item.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ignoreMutation.mutate(item.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Ignorar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
