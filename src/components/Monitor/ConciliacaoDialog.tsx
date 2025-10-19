import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { useCriarConciliacao, useAtualizarConciliacao, Conciliacao } from "@/hooks/useConciliacoes";

const conciliacaoSchema = z.object({
  conta_bancaria_id: z.string().uuid({ message: "Selecione uma conta bancária" }),
  mes_referencia: z.string().min(1, { message: "Selecione o mês de referência" }),
  saldo_inicial: z.coerce.number({ invalid_type_error: "Valor inválido" }),
  saldo_final_extrato: z.coerce.number({ invalid_type_error: "Valor inválido" }),
  observacoes: z.string().optional(),
});

type ConciliacaoFormValues = z.infer<typeof conciliacaoSchema>;

interface ConciliacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conciliacao?: Conciliacao;
  onSave?: () => void;
}

export function ConciliacaoDialog({
  open,
  onOpenChange,
  conciliacao,
  onSave,
}: ConciliacaoDialogProps) {
  const { contas } = useContasBancarias();
  const criarMutation = useCriarConciliacao();
  const atualizarMutation = useAtualizarConciliacao();

  const form = useForm<ConciliacaoFormValues>({
    resolver: zodResolver(conciliacaoSchema),
    defaultValues: {
      conta_bancaria_id: "",
      mes_referencia: "",
      saldo_inicial: 0,
      saldo_final_extrato: 0,
      observacoes: "",
    },
  });

  useEffect(() => {
    if (conciliacao) {
      form.reset({
        conta_bancaria_id: conciliacao.conta_bancaria_id,
        mes_referencia: conciliacao.mes_referencia.substring(0, 7),
        saldo_inicial: conciliacao.saldo_inicial,
        saldo_final_extrato: conciliacao.saldo_final_extrato,
        observacoes: conciliacao.observacoes || "",
      });
    } else {
      form.reset({
        conta_bancaria_id: "",
        mes_referencia: "",
        saldo_inicial: 0,
        saldo_final_extrato: 0,
        observacoes: "",
      });
    }
  }, [conciliacao, form]);

  const onSubmit = async (values: ConciliacaoFormValues) => {
    try {
      const mesReferencia = `${values.mes_referencia}-01`;
      
      if (conciliacao) {
        await atualizarMutation.mutateAsync({
          id: conciliacao.id,
          conta_bancaria_id: values.conta_bancaria_id,
          mes_referencia: mesReferencia,
          saldo_inicial: values.saldo_inicial,
          saldo_final_extrato: values.saldo_final_extrato,
          observacoes: values.observacoes || null,
        });
      } else {
        await criarMutation.mutateAsync({
          conta_bancaria_id: values.conta_bancaria_id,
          mes_referencia: mesReferencia,
          saldo_inicial: values.saldo_inicial,
          saldo_final_extrato: values.saldo_final_extrato,
          saldo_final_sistema: 0,
          diferenca: 0,
          status: 'pendente',
          observacoes: values.observacoes || null,
        });
      }
      
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar conciliação:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {conciliacao ? "Editar Conciliação" : "Nova Conciliação Bancária"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="conta_bancaria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta Bancária</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.nome} - {conta.banco || 'Caixa'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mes_referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês de Referência</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="saldo_inicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saldo_final_extrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Final (Extrato)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a conciliação..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {conciliacao ? "Atualizar" : "Criar Conciliação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
