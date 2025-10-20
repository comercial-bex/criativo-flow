import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, TrendingUp, TrendingDown, Paperclip, MessageSquare, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCriarTitulo } from "@/hooks/useTitulosFinanceiros";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { smartToast } from "@/lib/smart-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEntidades } from "@/hooks/useEntidades";
import { cn } from "@/lib/utils";

const tituloSchema = z.object({
  tipo: z.enum(['pagar', 'receber']),
  tipo_documento: z.string().min(1, "Tipo obrigatório"),
  numero_documento: z.string().optional(),
  descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  valor_original: z.string().min(1, "Valor obrigatório"),
  data_vencimento: z.date({ required_error: "Data de vencimento obrigatória" }),
  data_competencia: z.date({ required_error: "Data de competência obrigatória" }),
  entidade_id: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
  comprovante: z.instanceof(File).optional(),
});

type TituloFormData = z.infer<typeof tituloSchema>;

interface LancarTituloUnificadoDialogProps {
  trigger?: React.ReactNode;
}

async function uploadComprovante(file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `comprovantes/${fileName}`;
  
  const { error } = await supabase.storage
    .from('comprovantes-pagamento')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('comprovantes-pagamento')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

export function LancarTituloUnificadoDialog({ trigger }: LancarTituloUnificadoDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);
  const criarTitulo = useCriarTitulo();
  
  const form = useForm<TituloFormData>({
    resolver: zodResolver(tituloSchema),
    defaultValues: {
      tipo: 'pagar',
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
  
  const tipoSelecionado = form.watch('tipo');
  
  // Buscar clientes ou fornecedores usando hook separado
  const { data: entidades = [], error: entidadesError } = useEntidades(tipoSelecionado);
  
  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const url = await uploadComprovante(file);
      setComprovanteUrl(url);
      smartToast.success("Comprovante anexado com sucesso");
    } catch (error) {
      smartToast.error("Erro ao fazer upload do comprovante", error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (data: TituloFormData) => {
    try {
      const valorNumerico = parseFloat(data.valor_original.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const tituloData: any = {
        tipo: data.tipo,
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
        comprovante_url: comprovanteUrl,
        status: 'pendente',
        dias_atraso: 0,
      };
      
      if (data.entidade_id) {
        if (data.tipo === 'receber') {
          tituloData.cliente_id = data.entidade_id;
        } else {
          tituloData.fornecedor_id = data.entidade_id;
        }
      }
      
      await criarTitulo.mutateAsync(tituloData);
      smartToast.success(`${data.tipo === 'receber' ? 'Receita' : 'Despesa'} lançada com sucesso`);
      setOpen(false);
      form.reset();
      setComprovanteUrl(null);
    } catch (error) {
      smartToast.error('Erro ao criar lançamento', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Seletor de Tipo - ENTRADA/SAÍDA */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={field.value === 'receber' ? 'default' : 'outline'}
                      onClick={() => field.onChange('receber')}
                      className={cn(
                        "h-20 transition-all",
                        field.value === 'receber' && "bg-success hover:bg-success/90 text-white"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        <span className="font-semibold">💰 ENTRADA</span>
                        <span className="text-xs opacity-80">Receita / A Receber</span>
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      variant={field.value === 'pagar' ? 'default' : 'outline'}
                      onClick={() => field.onChange('pagar')}
                      className={cn(
                        "h-20 transition-all",
                        field.value === 'pagar' && "bg-destructive hover:bg-destructive/90 text-white"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <TrendingDown className="h-6 w-6" />
                        <span className="font-semibold">💸 SAÍDA</span>
                        <span className="text-xs opacity-80">Despesa / A Pagar</span>
                      </div>
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
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
                    <Input placeholder="Descreva o lançamento..." {...field} />
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
                    <FormLabel>{tipoSelecionado === 'receber' ? 'Cliente' : 'Fornecedor'}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={entidadesError !== null || !entidades || entidades.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              entidadesError 
                                ? "⚠️ Sem permissão" 
                                : entidades?.length === 0 
                                  ? "Nenhum cadastrado" 
                                  : "Selecione..."
                            } 
                          />
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
                    {entidadesError && (
                      <p className="text-xs text-destructive mt-1">
                        ⚠️ Você não tem permissão para acessar {tipoSelecionado === 'receber' ? 'clientes' : 'fornecedores'}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              {/* Valor Original */}
              <FormField
                control={form.control}
                name="valor_original"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
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
            
            {/* Upload de Comprovante */}
            <FormField
              control={form.control}
              name="comprovante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    📎 Comprovante de Pagamento
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                          handleFileUpload(file);
                        }}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && <Upload className="h-4 w-4 animate-pulse text-primary" />}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {comprovanteUrl && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-success/10 rounded-md">
                      <Paperclip className="h-4 w-4 text-success" />
                      <span className="text-sm text-success font-medium">✓ Comprovante anexado</span>
                    </div>
                  )}
                </FormItem>
              )}
            />
            
            {/* Observações / Anotações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5" />
                    📝 Anotações / Observações
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes do pagamento, motivo, observações importantes..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarTitulo.isPending || uploading}>
                {criarTitulo.isPending ? 'Criando...' : 'Lançar Título'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
