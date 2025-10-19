import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContasBancarias, type ContaBancaria } from "@/hooks/useContasBancarias";

const contaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["caixa", "conta_corrente", "poupanca", "investimento"]),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  saldo_inicial: z.number().default(0),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
});

type ContaFormData = z.infer<typeof contaSchema>;

interface ContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: ContaBancaria | null;
}

export function ContaBancariaDialog({ open, onOpenChange, conta }: ContaBancariaDialogProps) {
  const { createConta, updateConta } = useContasBancarias();

  const form = useForm<ContaFormData>({
    resolver: zodResolver(contaSchema),
    defaultValues: {
      nome: "",
      tipo: "conta_corrente",
      saldo_inicial: 0,
      ativo: true,
    },
  });

  useEffect(() => {
    if (conta) {
      form.reset({
        nome: conta.nome,
        tipo: conta.tipo,
        banco: conta.banco,
        agencia: conta.agencia,
        conta: conta.conta,
        saldo_inicial: conta.saldo_inicial,
        observacoes: conta.observacoes,
        ativo: conta.ativo,
      });
    } else {
      form.reset({
        nome: "",
        tipo: "conta_corrente",
        saldo_inicial: 0,
        ativo: true,
      });
    }
  }, [conta, form]);

  const onSubmit = (data: ContaFormData) => {
    if (conta) {
      updateConta({ id: conta.id, ...data } as any);
    } else {
      createConta(data as any);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {conta ? "Editar Conta" : "Nova Conta Bancária"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Caixa Principal, Banco do Brasil" />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="caixa">Caixa</SelectItem>
                        <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="investimento">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Banco do Brasil" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <FormLabel>Conta Ativa</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Contas inativas não aparecem em seleções
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {conta ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
