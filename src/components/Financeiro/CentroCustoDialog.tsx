import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCentrosCusto, CentroCusto } from '@/hooks/useCentrosCusto';

const centroCustoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['operacional', 'administrativo', 'comercial', 'projetos']),
  orcamento_mensal: z.string().optional(),
  ativo: z.boolean().default(true),
});

type CentroCustoFormData = z.infer<typeof centroCustoSchema>;

interface CentroCustoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  centro?: CentroCusto | null;
}

export function CentroCustoDialog({ isOpen, onClose, centro }: CentroCustoDialogProps) {
  const { createCentro, updateCentro } = useCentrosCusto();

  const form = useForm<CentroCustoFormData>({
    resolver: zodResolver(centroCustoSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      tipo: 'operacional',
      orcamento_mensal: '',
      ativo: true,
    },
  });

  useEffect(() => {
    if (centro) {
      form.reset({
        codigo: centro.codigo,
        nome: centro.nome,
        descricao: centro.descricao || '',
        tipo: centro.tipo,
        orcamento_mensal: centro.orcamento_mensal?.toString() || '',
        ativo: centro.ativo,
      });
    } else {
      form.reset({
        codigo: '',
        nome: '',
        descricao: '',
        tipo: 'operacional',
        orcamento_mensal: '',
        ativo: true,
      });
    }
  }, [centro, form]);

  const onSubmit = (data: CentroCustoFormData) => {
    const payload: any = {
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao || null,
      tipo: data.tipo,
      orcamento_mensal: data.orcamento_mensal ? parseFloat(data.orcamento_mensal) : null,
      ativo: data.ativo,
    };

    if (centro) {
      updateCentro({ id: centro.id, ...payload });
    } else {
      createCentro(payload);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {centro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="CC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="projetos">Projetos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do centro de custo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do centro de custo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orcamento_mensal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Mensal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Centro de custo disponível para uso
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {centro ? 'Salvar Alterações' : 'Criar Centro de Custo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
