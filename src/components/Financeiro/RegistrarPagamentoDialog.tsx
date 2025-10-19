import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload } from "lucide-react";
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
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const registrarPagamento = useRegistrarPagamento();

  const handleSubmit = async () => {
    if (!valorPago || !formaPagamento) return;

    await registrarPagamento.mutateAsync({
      titulo_id: tituloId,
      data_pagamento: format(dataPagamento, 'yyyy-MM-dd'),
      valor_pago: parseFloat(valorPago),
      forma_pagamento: formaPagamento,
      observacoes: observacoes || undefined,
    });

    onOpenChange(false);
  };

  const actionLabel = tipo === 'pagar' ? 'Pagamento' : 'Recebimento';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar {actionLabel}</DialogTitle>
          <DialogDescription>
            Informe os dados do {actionLabel.toLowerCase()} realizado
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
              placeholder="0,00"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de {actionLabel}</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Informações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!valorPago || !formaPagamento || registrarPagamento.isPending}
          >
            {registrarPagamento.isPending ? "Salvando..." : `Registrar ${actionLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
