import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface FolhaEtapa1CompetenciaProps {
  onContinuar: (competencia: string) => void;
}

export function FolhaEtapa1Competencia({ onContinuar }: FolhaEtapa1CompetenciaProps) {
  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState(mesAtual);
  const [modoManual, setModoManual] = useState(false);

  // Gerar últimos 12 meses
  const mesesDisponiveis = Array.from({ length: 12 }, (_, i) => {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    return data.toISOString().slice(0, 7);
  });

  const formatarMesAno = (competencia: string) => {
    const [ano, mes] = competencia.split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  return (
    <div className="space-y-6" data-tour="etapa-1">
      <div className="text-center space-y-2">
        <Calendar className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Qual mês você quer processar?</h2>
        <p className="text-muted-foreground">
          Selecione o período da folha de pagamento
        </p>
      </div>

      {!modoManual ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className="border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <CardHeader className="text-center pb-2">
              <CardDescription>Mês Atual</CardDescription>
              <CardTitle className="text-4xl">{formatarMesAno(mesAtual)}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Button
                size="lg"
                className="w-full max-w-xs"
                onClick={() => onContinuar(mesAtual)}
              >
                Continuar com {formatarMesAno(mesAtual)}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setModoManual(true)}
            >
              Ou escolher outro mês
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Mês/Ano:</label>
            <Select value={competenciaSelecionada} onValueChange={setCompetenciaSelecionada}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mesesDisponiveis.map((mes) => (
                  <SelectItem key={mes} value={mes}>
                    {formatarMesAno(mes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModoManual(false)}
            >
              Voltar
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => onContinuar(competenciaSelecionada)}
            >
              Continuar
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
