import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, DollarSign } from "lucide-react";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useCriarDivida, useAtualizarDivida, useRegistrarPagamentoParcela, Divida } from "@/hooks/useDividas";

const dividaSchema = z.object({
  tipo: z.enum(['pagar', 'receber'], { required_error: "Selecione o tipo" }),
  credor_devedor: z.string().min(3, { message: "Nome muito curto" }),
  centro_custo_id: z.string().uuid().optional(),
  descricao: z.string().min(3, { message: "Descrição muito curta" }),
  valor_total: z.coerce.number().positive({ message: "Valor deve ser maior que zero" }),
  numero_parcelas: z.coerce.number().int().min(1, { message: "Mínimo 1 parcela" }),
  data_primeiro_vencimento: z.date({ required_error: "Data obrigatória" }),
  observacoes: z.string().optional(),
});

type DividaFormValues = z.infer<typeof dividaSchema>;

interface DividaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  divida?: Divida;
  onSave?: () => void;
}

export function DividaDialog({
  open,
  onOpenChange,
  divida,
  onSave,
}: DividaDialogProps) {
  const { centros } = useCentrosCusto();
  const criarMutation = useCriarDivida();
  const atualizarMutation = useAtualizarDivida();
  const registrarPagamentoMutation = useRegistrarPagamentoParcela();
  
  const [showParcelas, setShowParcelas] = useState(false);
  const [parcelaSelecionada, setParcelaSelecionada] = useState<any>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());

  const form = useForm<DividaFormValues>({
    resolver: zodResolver(dividaSchema),
    defaultValues: {
      tipo: "pagar",
      credor_devedor: "",
      centro_custo_id: "",
      descricao: "",
      valor_total: 0,
      numero_parcelas: 1,
      data_primeiro_vencimento: new Date(),
      observacoes: "",
    },
  });

  useEffect(() => {
    if (divida) {
      form.reset({
        tipo: divida.tipo as 'pagar' | 'receber',
        credor_devedor: divida.credor_devedor,
        centro_custo_id: divida.centro_custo_id || "",
        descricao: divida.descricao,
        valor_total: divida.valor_total,
        numero_parcelas: divida.numero_parcelas,
        data_primeiro_vencimento: new Date(divida.data_emissao),
        observacoes: divida.observacoes || "",
      });
      setShowParcelas(true);
    } else {
      form.reset({
        tipo: "pagar",
        credor_devedor: "",
        centro_custo_id: "",
        descricao: "",
        valor_total: 0,
        numero_parcelas: 1,
        data_primeiro_vencimento: new Date(),
        observacoes: "",
      });
      setShowParcelas(false);
    }
  }, [divida, form]);

  const gerarParcelas = (valores: DividaFormValues) => {
    const parcelas = [];
    const valorParcela = valores.valor_total / valores.numero_parcelas;
    
    for (let i = 0; i < valores.numero_parcelas; i++) {
      parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        vencimento: format(addMonths(valores.data_primeiro_vencimento, i), 'yyyy-MM-dd'),
        status: 'pendente',
        valor_pago: 0,
        data_pagamento: null,
      });
    }
    
    return parcelas;
  };

  const onSubmit = async (values: DividaFormValues) => {
    try {
      if (divida) {
        await atualizarMutation.mutateAsync({
          id: divida.id,
          credor_devedor: values.credor_devedor,
          centro_custo_id: values.centro_custo_id || null,
          descricao: values.descricao,
          observacoes: values.observacoes || null,
        });
      } else {
        const parcelas = gerarParcelas(values);
        
        await criarMutation.mutateAsync({
          tipo: values.tipo,
          credor_devedor: values.credor_devedor,
          centro_custo_id: values.centro_custo_id || null,
          descricao: values.descricao,
          valor_total: values.valor_total,
          valor_pago: 0,
          numero_parcelas: values.numero_parcelas,
          parcelas: parcelas,
          data_emissao: format(new Date(), 'yyyy-MM-dd'),
          status: 'ativa',
          observacoes: values.observacoes || null,
        } as any);
      }
      
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
    }
  };

  const handleRegistrarPagamento = async () => {
    if (!parcelaSelecionada || !divida) return;
    
    try {
      await registrarPagamentoMutation.mutateAsync({
        divida_id: divida.id,
        parcela_numero: parcelaSelecionada.numero,
        valor_pago: parseFloat(valorPagamento),
        data_pagamento: format(dataPagamento, 'yyyy-MM-dd'),
      });
      
      setParcelaSelecionada(null);
      setValorPagamento("");
      onSave?.();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pendente: "destructive",
      parcial: "secondary",
      pago: "default",
    };
    return <Badge variant={variants[status] || "destructive"}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {divida ? "Gerenciar Dívida" : "Nova Dívida"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!divida}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pagar">A Pagar</SelectItem>
                      <SelectItem value="receber">A Receber</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credor_devedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("tipo") === "pagar" ? "Fornecedor" : "Cliente"}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor/cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="centro_custo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Custo (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o centro de custo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {centros.filter(c => c.ativo).map((centro) => (
                        <SelectItem key={centro.id} value={centro.id}>
                          {centro.codigo} - {centro.nome}
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
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da dívida" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!divida && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total</FormLabel>
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
                    name="numero_parcelas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
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
                  name="data_primeiro_vencimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Primeiro Vencimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a dívida..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {divida && showParcelas && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Parcelas</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(divida.parcelas) && divida.parcelas.map((parcela: any) => (
                      <TableRow key={parcela.numero}>
                        <TableCell>{parcela.numero}</TableCell>
                        <TableCell>
                          {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(parcela.valor_pago || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(parcela.status)}</TableCell>
                        <TableCell>
                          {parcela.status !== 'pago' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setParcelaSelecionada(parcela);
                                setValorPagamento(parcela.valor.toString());
                                setDataPagamento(new Date());
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {parcelaSelecionada && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium">Registrar Pagamento - Parcela {parcelaSelecionada.numero}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Valor Pago</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={valorPagamento}
                          onChange={(e) => setValorPagamento(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data do Pagamento</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(dataPagamento, "dd/MM/yyyy")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dataPagamento}
                              onSelect={(date) => date && setDataPagamento(date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleRegistrarPagamento}
                      >
                        Confirmar Pagamento
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setParcelaSelecionada(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {divida ? "Atualizar" : "Criar Dívida"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
