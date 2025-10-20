import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCriarTitulo } from "@/hooks/useTitulosFinanceiros";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { smartToast } from "@/lib/smart-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const tituloSchema = z.object({
  tipo_documento: z.string().min(1, "Tipo obrigatório"),
  numero_documento: z.string().optional(),
  descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  valor_original: z.string().min(1, "Valor obrigatório"),
  data_vencimento: z.date({ required_error: "Data de vencimento obrigatória" }),
  data_competencia: z.date({ required_error: "Data de competência obrigatória" }),
  entidade_id: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type TituloFormData = z.infer<typeof tituloSchema>;

interface LancarTituloDialogProps {
  tipo: 'pagar' | 'receber';
}

export function LancarTituloDialog({ tipo }: LancarTituloDialogProps) {
  const [open, setOpen] = useState(false);
  const criarTitulo = useCriarTitulo();
  
  const form = useForm<TituloFormData>({
    resolver: zodResolver(tituloSchema),
    defaultValues: {
      tipo_documento: '',
      numero_documento: '',
      descricao: '',
      valor_original: '',
      data_vencimento: new Date(),
      data_competencia: new Date(),
      entidade_id: '',
      forma_pagamento: '',
      observacoes: '',
    },
  });
  
  // Buscar clientes ou fornecedores
  const { data: entidades } = useQuery({
    queryKey: [tipo === 'receber' ? 'clientes' : 'fornecedores'],
    queryFn: async () => {
      if (tipo === 'receber') {
        const { data } = await supabase
          .from('clientes')
          .select('id, nome')
          .order('nome');
        return data || [];
      } else {
        const { data } = await supabase
          .from('fornecedores')
          .select('id, nome')
          .order('nome');
        return data || [];
      }
    },
  });
  
  const handleSubmit = async (data: TituloFormData) => {
    try {
      const valorNumerico = parseFloat(data.valor_original.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const tituloData: any = {
        tipo,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento || null,
        descricao: data.descricao,
        valor_original: valorNumerico,
        valor_liquido: valorNumerico,
        valor_pago: 0,
        valor_desconto: 0,
        valor_juros: 0,
        valor_multa: 0,
        data_vencimento: format(data.data_vencimento, 'yyyy-MM-dd'),
        data_competencia: format(data.data_competencia, 'yyyy-MM-dd'),
        data_emissao: format(new Date(), 'yyyy-MM-dd'),
        forma_pagamento: data.forma_pagamento || null,
        observacoes: data.observacoes || null,
        status: 'pendente',
        dias_atraso: 0,
      };
      
      if (data.entidade_id) {
        if (tipo === 'receber') {
          tituloData.cliente_id = data.entidade_id;
        } else {
          tituloData.fornecedor_id = data.entidade_id;
        }
      }
      
      await criarTitulo.mutateAsync(tituloData);
      smartToast.success(`Título ${tipo === 'receber' ? 'a receber' : 'a pagar'} criado com sucesso`);
      setOpen(false);
      form.reset();
    } catch (error) {
      smartToast.error('Erro ao criar título', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Lançar {tipo === 'pagar' ? 'Conta a Pagar' : 'Conta a Receber'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Lançamento - {tipo === 'pagar' ? 'Conta a Pagar' : 'Conta a Receber'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <FormField
                control={form.control}
                name="tipo_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="recibo">Recibo</SelectItem>
                        <SelectItem value="fatura">Fatura</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Número do Documento */}
              <FormField
                control={form.control}
                name="numero_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o título..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Cliente/Fornecedor */}
              <FormField
                control={form.control}
                name="entidade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tipo === 'receber' ? 'Cliente' : 'Fornecedor'}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entidades?.map((entidade) => (
                          <SelectItem key={entidade.id} value={entidade.id}>
                            {entidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Valor Original */}
              <FormField
                control={form.control}
                name="valor_original"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Original</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = (Number(value) / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Data de Vencimento */}
              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
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
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione...</span>
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
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Data de Competência */}
              <FormField
                control={form.control}
                name="data_competencia"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Competência</FormLabel>
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
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione...</span>
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
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..." 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarTitulo.isPending}>
                {criarTitulo.isPending ? 'Criando...' : 'Lançar Título'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
