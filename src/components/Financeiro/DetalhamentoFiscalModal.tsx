import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Calculator, TrendingUp, Shield, PiggyBank, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { FolhaItem } from '@/hooks/useFolhaPagamento';

interface DetalhamentoFiscalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FolhaItem | null;
}

export function DetalhamentoFiscalModal({
  open,
  onOpenChange,
  item,
}: DetalhamentoFiscalModalProps) {
  const [inssData, setInssData] = useState<any>(null);
  const [irrfData, setIrrfData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && item?.colaborador?.regime === 'clt') {
      calcularImpostos();
    }
  }, [open, item]);

  const calcularImpostos = async () => {
    if (!item) return;
    
    setLoading(true);
    try {
      const salarioBruto = item.colaborador?.salario_base || item.colaborador?.fee_mensal || item.base_calculo || 0;
      const competencia = new Date().toISOString().slice(0, 10);

      // Calcular INSS
      const { data: inssResult, error: inssError } = await supabase.rpc(
        'fn_calcular_inss',
        {
          p_salario_bruto: salarioBruto,
          p_competencia: competencia,
        }
      );

      if (inssError) throw inssError;
      setInssData(inssResult[0]);

      // Calcular IRRF (base = salário - INSS)
      const baseIRRF = salarioBruto - (inssResult[0]?.valor_inss || 0);
      const { data: irrfResult, error: irrfError } = await supabase.rpc(
        'fn_calcular_irrf',
        {
          p_base_calculo: baseIRRF,
          p_num_dependentes: 0,
          p_competencia: competencia,
        }
      );

      if (irrfError) throw irrfError;
      setIrrfData(irrfResult[0]);
    } catch (error) {
      console.error('Erro ao calcular impostos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const regime = item.colaborador?.regime || 'clt';
  const salarioBruto = item.colaborador?.salario_base || item.colaborador?.fee_mensal || item.base_calculo || 0;
  const colaboradorNome = item.colaborador?.nome || 'Colaborador';
  const competencia = new Date().toISOString().slice(0, 10);

  const fgts = salarioBruto * 0.08; // 8%
  const inssPatronal = salarioBruto * 0.2; // 20%
  const totalEncargos = fgts + inssPatronal;

  const valorINSS = inssData?.valor_inss || 0;
  const valorIRRF = irrfData?.valor_irrf || 0;
  const salarioLiquido = salarioBruto - valorINSS - valorIRRF;

  if (regime !== 'clt') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Detalhamento Fiscal
            </DialogTitle>
            <DialogDescription>{colaboradorNome}</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Detalhamento fiscal disponível apenas para colaboradores CLT.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Detalhamento Fiscal Completo
          </DialogTitle>
          <DialogDescription>
            {colaboradorNome} • Competência: {new Date(competencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Calculando impostos...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Resumo da Folha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Salário Bruto</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(salarioBruto)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salário Líquido</p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(salarioLiquido)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">INSS:</span>
                    <span className="font-semibold text-destructive">
                      - {formatCurrency(valorINSS)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IRRF:</span>
                    <span className="font-semibold text-destructive">
                      - {formatCurrency(valorIRRF)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhamento INSS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Card className="shadow-md">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    INSS - Progressivo por Faixas
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">
                      Alíquota Efetiva: {inssData?.aliquota_efetiva?.toFixed(2)}%
                    </Badge>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Total: {formatCurrency(valorINSS)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {inssData?.faixas_aplicadas && (
                    <div className="space-y-3">
                      {inssData.faixas_aplicadas.map((faixa: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              Faixa {faixa.faixa}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {formatCurrency(faixa.base)} × {faixa.aliquota}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Base tributável
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-destructive">
                              {formatCurrency(faixa.valor)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Detalhamento IRRF */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    IRRF - Imposto de Renda Retido na Fonte
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">
                      Faixa {irrfData?.faixa_aplicada || 0}
                    </Badge>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Total: {formatCurrency(valorIRRF)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Salário Bruto:</span>
                      <span className="font-semibold">{formatCurrency(salarioBruto)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">(-) INSS:</span>
                      <span className="font-semibold text-destructive">
                        - {formatCurrency(valorINSS)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">Base de Cálculo IRRF:</span>
                      <span className="text-primary">
                        {formatCurrency(salarioBruto - valorINSS)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Encargos Patronais */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <Card className="shadow-md border-t-4 border-t-warning">
                <CardHeader className="bg-warning/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-warning" />
                    Encargos Patronais (Custo da Empresa)
                  </CardTitle>
                  <div className="mt-2">
                    <Badge className="bg-warning/10 text-warning border-warning/20">
                      Total: {formatCurrency(totalEncargos)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-foreground">FGTS</p>
                        <p className="text-xs text-muted-foreground">8% sobre salário bruto</p>
                      </div>
                      <p className="text-lg font-bold text-warning">
                        {formatCurrency(fgts)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-foreground">INSS Patronal</p>
                        <p className="text-xs text-muted-foreground">20% sobre salário bruto</p>
                      </div>
                      <p className="text-lg font-bold text-warning">
                        {formatCurrency(inssPatronal)}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold pt-2">
                      <span className="text-foreground">Custo Total para Empresa:</span>
                      <span className="text-xl text-warning">
                        {formatCurrency(salarioBruto + totalEncargos)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nota Informativa */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Nota:</strong> Cálculos baseados nas tabelas fiscais
                vigentes em {new Date(competencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
                Valores podem sofrer alterações de acordo com mudanças na legislação.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
