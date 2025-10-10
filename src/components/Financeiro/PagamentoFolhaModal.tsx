import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { FolhaItem } from '@/hooks/useFolhaPagamento';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PagamentoFolhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FolhaItem | null;
  onConfirm: (data: {
    item_id: string;
    forma_pagamento: string;
    data_pagamento: string;
    comprovante_url?: string;
    observacoes?: string;
  }) => void;
  isLoading?: boolean;
}

export function PagamentoFolhaModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: PagamentoFolhaModalProps) {
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!item) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF ou imagem.');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `comprovante_${item.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('comprovantes-pagamento')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('comprovantes-pagamento')
        .getPublicUrl(data.path);

      setComprovanteUrl(urlData.publicUrl);
      toast.success('Comprovante enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar comprovante: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!dataPagamento) {
      toast.error('Informe a data do pagamento');
      return;
    }

    onConfirm({
      item_id: item.id,
      forma_pagamento: formaPagamento,
      data_pagamento: dataPagamento,
      comprovante_url: comprovanteUrl || undefined,
      observacoes: observacoes || undefined,
    });

    // Resetar form
    setFormaPagamento('pix');
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setObservacoes('');
    setComprovanteUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Colaborador */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Colaborador</p>
                  <p className="font-semibold text-lg">{item.colaborador?.nome_completo}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium">{item.colaborador?.cpf_cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">{item.colaborador?.cargo_atual || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regime</p>
                    <p className="font-medium uppercase">{item.colaborador?.regime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Proventos</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(item.total_proventos)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Descontos</span>
                  <span className="font-semibold text-red-600">
                    - {formatCurrency(item.total_descontos)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Encargos</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(item.total_encargos)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Líquido</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(item.liquido)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forma-pagamento" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Forma de Pagamento
                </Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger id="forma-pagamento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-pagamento" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data do Pagamento
                </Label>
                <Input
                  id="data-pagamento"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprovante" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Comprovante de Pagamento
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="comprovante"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {comprovanteUrl && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
              </div>
              {isUploading && (
                <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
              )}
              {comprovanteUrl && (
                <p className="text-sm text-green-600">Comprovante anexado com sucesso</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o pagamento..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isUploading || !dataPagamento}
            className="min-w-[120px]"
          >
            {isLoading ? 'Registrando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
