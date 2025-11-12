import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface SimuladorFolhaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimuladorFolha({ open, onOpenChange }: SimuladorFolhaProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>('');
  const [dependentes, setDependentes] = useState<number>(0);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simular = async () => {
    if (!salarioBruto || parseFloat(salarioBruto) <= 0) {
      toast.error('Informe um salário válido');
      return;
    }

    setLoading(true);
    try {
      const valor = parseFloat(salarioBruto);
      
      // Calcular INSS
      const { data: inssData } = await supabase.rpc('fn_calcular_inss', {
        p_salario_bruto: valor
      });

      // Calcular IRRF (base = salário - INSS)
      const baseIRRF = valor - (inssData?.[0]?.valor_inss || 0);
      const { data: irrfData } = await supabase.rpc('fn_calcular_irrf', {
        p_base_calculo: baseIRRF,
        p_num_dependentes: dependentes
      });

      // Calcular FGTS
      const { data: fgtsData } = await supabase.rpc('fn_calcular_fgts', {
        p_salario_bruto: valor
      });

      // Calcular Encargos Patronais (INSS Patronal 20%)
      const inssPatronal = valor * 0.20;

      const salarioLiquido = valor - (inssData?.[0]?.valor_inss || 0) - (irrfData?.[0]?.valor_irrf || 0);
      const custoTotal = valor + (fgtsData || 0) + inssPatronal;

      setResultado({
        salarioBruto: valor,
        inss: inssData?.[0]?.valor_inss || 0,
        irrf: irrfData?.[0]?.valor_irrf || 0,
        salarioLiquido,
        fgts: fgtsData || 0,
        inssPatronal,
        custoTotal,
        aliquotaEfetivaINSS: inssData?.[0]?.aliquota_efetiva || 0,
        aliquotaEfetivaIRRF: irrfData?.[0]?.aliquota_efetiva || 0,
      });
    } catch (error) {
      console.error('Erro ao simular:', error);
      toast.error('Erro ao simular folha de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" height="xl" overflow="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Simulador de Folha de Pagamento
          </DialogTitle>
          <DialogDescription>
            Simule os custos de contratação antes de efetuar um novo cadastro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário Bruto (R$)</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={salarioBruto}
                onChange={(e) => setSalarioBruto(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dependentes">Número de Dependentes</Label>
              <Input
                id="dependentes"
                type="number"
                min="0"
                value={dependentes}
                onChange={(e) => setDependentes(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <Button onClick={simular} disabled={loading} className="w-full">
            {loading ? 'Calculando...' : 'Simular'}
          </Button>

          {/* Resultados */}
          {resultado && (
            <div className="space-y-4 animate-fade-in">
              {/* Salário Líquido */}
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Salário Líquido do Colaborador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {formatMoeda(resultado.salarioLiquido)}
                  </p>
                </CardContent>
              </Card>

              {/* Descontos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Descontos do Colaborador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      INSS ({resultado.aliquotaEfetivaINSS.toFixed(2)}%)
                    </span>
                    <span className="font-medium text-destructive">
                      - {formatMoeda(resultado.inss)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      IRRF ({resultado.aliquotaEfetivaIRRF.toFixed(2)}%)
                    </span>
                    <span className="font-medium text-destructive">
                      - {formatMoeda(resultado.irrf)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Encargos Patronais */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Encargos da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FGTS (8%)</span>
                    <span className="font-medium">{formatMoeda(resultado.fgts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">INSS Patronal (20%)</span>
                    <span className="font-medium">{formatMoeda(resultado.inssPatronal)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Custo Total */}
              <Card className="bg-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Custo Total para a Empresa
                  </CardTitle>
                  <CardDescription>
                    Inclui salário bruto + encargos (FGTS + INSS Patronal)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatMoeda(resultado.custoTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((resultado.custoTotal / resultado.salarioBruto - 1) * 100).toFixed(1)}% 
                    de encargos sobre o salário bruto
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
