import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRegistrarPagamento } from "@/hooks/useTitulosFinanceiros";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useComprovanteUpload } from "@/hooks/useComprovanteUpload";
import { ComprovanteUploader } from "@/components/Financeiro/ComprovanteUploader";
import { ComprovanteGallery } from "@/components/Financeiro/ComprovanteGallery";

// Schema de validação
const pagamentoSchema = z.object({
  valorPago: z.number()
    .positive({ message: "Valor deve ser maior que zero" })
    .max(999999999.99, { message: "Valor muito alto" }),
  formaPagamento: z.string()
    .min(1, { message: "Forma de pagamento é obrigatória" }),
  observacoes: z.string()
    .max(500, { message: "Observações devem ter no máximo 500 caracteres" })
    .optional(),
});

interface RegistrarPagamentoDialogProps {
  tituloId: string;
  tipo?: 'pagar' | 'receber';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrarPagamentoDialog({
  tituloId,
  tipo = 'pagar',
  open,
  onOpenChange,
}: RegistrarPagamentoDialogProps) {
  const { toast } = useToast();
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registrarPagamento = useRegistrarPagamento();
  const {
    arquivos,
    adicionarArquivos,
    removerArquivo,
    uploadTodos,
    limpar,
    uploading
  } = useComprovanteUpload();

  const handleSubmit = async () => {
    // Limpar erros anteriores
    setErrors({});

    // Validar inputs
    const validation = pagamentoSchema.safeParse({
      valorPago: parseFloat(valorPago),
      formaPagamento,
      observacoes: observacoes.trim() || undefined,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Verifique os campos e tente novamente",
      });
      return;
    }

    try {
      // Upload de comprovantes
      const comprovanteUrls = await uploadTodos();
      const comprovanteUrl = comprovanteUrls.length > 0 ? comprovanteUrls[0] : undefined;

      await registrarPagamento.mutateAsync({
        titulo_id: tituloId,
        data_pagamento: format(dataPagamento, 'yyyy-MM-dd'),
        valor_pago: validation.data.valorPago,
        forma_pagamento: validation.data.formaPagamento,
        observacoes: validation.data.observacoes,
        comprovante_url: comprovanteUrl,
      });

      // Limpar formulário
      setValorPago("");
      setFormaPagamento("");
      setObservacoes("");
      limpar();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: "Não foi possível salvar o pagamento",
      });
    }
  };

  const actionLabel = tipo === 'pagar' ? 'Pagamento' : 'Recebimento';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar {actionLabel}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar o {actionLabel.toLowerCase()} realizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data do {actionLabel}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataPagamento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataPagamento ? format(dataPagamento, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataPagamento}
                  onSelect={(date) => date && setDataPagamento(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Valor {tipo === 'pagar' ? 'Pago' : 'Recebido'}</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max="999999999.99"
              placeholder="0,00"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              className={errors.valorPago ? "border-destructive" : ""}
            />
            {errors.valorPago && (
              <p className="text-sm text-destructive">{errors.valorPago}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Forma de {actionLabel}</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger className={errors.formaPagamento ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {errors.formaPagamento && (
              <p className="text-sm text-destructive">{errors.formaPagamento}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Informações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={500}
              rows={3}
              className={errors.observacoes ? "border-destructive" : ""}
            />
            {errors.observacoes && (
              <p className="text-sm text-destructive">{errors.observacoes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {observacoes.length}/500 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label>Comprovantes</Label>
            <ComprovanteUploader
              onFilesChange={adicionarArquivos}
            />
            {arquivos.length > 0 && (
              <ComprovanteGallery
                files={arquivos.map(f => ({
                  url: f.url || f.preview || '',
                  nome: f.file?.name,
                  tipo: f.file?.type,
                  tamanho: f.file?.size
                }))}
                onRemove={(url) => {
                  const arq = arquivos.find(a => a.url === url || a.preview === url);
                  if (arq) removerArquivo(arq.id);
                }}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!valorPago || !formaPagamento || registrarPagamento.isPending || uploading}
          >
            {(registrarPagamento.isPending || uploading) ? "Salvando..." : `Registrar ${actionLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
