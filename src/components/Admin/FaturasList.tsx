import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFaturas } from "@/hooks/useFaturas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, CheckCircle, Clock, XCircle, Upload, ExternalLink } from "lucide-react";
import { UploadPDF } from "./UploadPDF";
import { useState } from "react";

interface FaturasListProps {
  contratoId: string;
  clienteId: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  pago: "bg-success/10 text-success border-success/20",
  atrasado: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export function FaturasList({ contratoId, clienteId }: FaturasListProps) {
  const { faturas, loading, marcarPago, uploadComprovante } = useFaturas(contratoId);
  const [uploadingFaturaId, setUploadingFaturaId] = useState<string | null>(null);

  if (loading) {
    return <div className="text-center p-4 text-muted-foreground">Carregando faturas...</div>;
  }

  if (faturas.length === 0) {
    return (
      <Card className="p-8 text-center">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma fatura gerada ainda</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use o botão "Gerar Faturas" na aba Ações
        </p>
      </Card>
    );
  }

  const handleUploadComprovante = async (faturaId: string, file: File): Promise<string> => {
    const url = await uploadComprovante(file);
    marcarPago({ id: faturaId, comprovante_url: url });
    setUploadingFaturaId(null);
    return url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Faturas Geradas ({faturas.length})</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground">
            Total: R$ {faturas.reduce((sum, f) => sum + Number(f.valor), 0).toFixed(2)}
          </span>
        </div>
      </div>

      {faturas.map((fatura) => {
        const vencimento = new Date(fatura.vencimento);
        const isAtrasado = vencimento < new Date() && fatura.status === "pendente";
        const status = isAtrasado ? "atrasado" : fatura.status;

        return (
          <Card key={fatura.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{fatura.descricao}</h4>
                  <Badge className={statusColors[status] || statusColors.pendente}>
                    {statusLabels[status] || status}
                  </Badge>
                </div>
                {fatura.numero && (
                  <p className="text-sm text-muted-foreground">#{fatura.numero}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  R$ {Number(fatura.valor).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-muted-foreground">Vencimento</p>
                <p className="font-medium">
                  {format(vencimento, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              {fatura.pago_em && (
                <div>
                  <p className="text-muted-foreground">Pago em</p>
                  <p className="font-medium">
                    {format(new Date(fatura.pago_em), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>

            {fatura.observacoes && (
              <div className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded">
                {fatura.observacoes}
              </div>
            )}

            {fatura.status === "pendente" && (
              <div className="space-y-3 mt-4">
                {uploadingFaturaId === fatura.id ? (
                  <div>
                    <UploadPDF
                      onUpload={(file) => handleUploadComprovante(fatura.id, file)}
                      label="Comprovante de Pagamento"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSizeMB={5}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadingFaturaId(null)}
                      className="mt-2 w-full"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => marcarPago({ id: fatura.id })}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Pago
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadingFaturaId(fatura.id)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Anexar Comprovante
                    </Button>
                  </div>
                )}
              </div>
            )}

            {fatura.comprovante_url && (
              <div className="mt-3">
                <a
                  href={fatura.comprovante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver comprovante de pagamento
                </a>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
