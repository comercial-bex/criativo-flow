import { CheckCircle2, Download, Mail, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface FolhaEtapa3ConfirmacaoProps {
  competencia: string;
  totalColaboradores: number;
  totalLiquido: number;
  totalProventos: number;
  totalDescontos: number;
  onVoltar: () => void;
  onVerDetalhes: () => void;
}

export function FolhaEtapa3Confirmacao({
  competencia,
  totalColaboradores,
  totalLiquido,
  totalProventos,
  totalDescontos,
  onVoltar,
  onVerDetalhes,
}: FolhaEtapa3ConfirmacaoProps) {
  const formatarMesAno = (comp: string) => {
    const [ano, mes] = comp.split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center"
    >
      {/* Success Icon */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle2 className="w-24 h-24 text-success" />
        </motion.div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Folha Processada com Sucesso!</h2>
        <p className="text-muted-foreground">
          A folha de {formatarMesAno(competencia)} foi calculada e está pronta
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-success/20 bg-success/5">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="text-xl font-semibold">{formatarMesAno(competencia)}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Colaboradores</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{totalColaboradores}</p>
                <Badge variant="secondary">processados</Badge>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Proventos:</span>
              <span className="font-semibold text-success">{formatCurrency(totalProventos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Descontos:</span>
              <span className="font-semibold text-destructive">-{formatCurrency(totalDescontos)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Líquido:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalLiquido)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Baixar Holerites
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Enviar por Email
        </Button>
        <Button onClick={onVerDetalhes} className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Ver Detalhes
        </Button>
        <Button variant="secondary" onClick={onVoltar} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Voltar ao Início
        </Button>
      </div>
    </motion.div>
  );
}
