import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLancamentosContabeis } from '@/hooks/useLancamentosContabeis';
import { usePlanoContas } from '@/hooks/usePlanoContas';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function BalancoPatrimonial() {
  const { startTutorial, hasSeenTutorial } = useTutorial('financeiro-balanco');
  const { lancamentos } = useLancamentosContabeis();
  const { contas } = usePlanoContas();

  // Calcular saldos por tipo de conta
  const calcularSaldos = () => {
    const saldos: Record<string, number> = {};
    
    lancamentos.forEach((lanc: any) => {
      // Débito
      if (!saldos[lanc.conta_debito_id]) saldos[lanc.conta_debito_id] = 0;
      saldos[lanc.conta_debito_id] += Number(lanc.valor);
      
      // Crédito
      if (!saldos[lanc.conta_credito_id]) saldos[lanc.conta_credito_id] = 0;
      saldos[lanc.conta_credito_id] -= Number(lanc.valor);
    });
    
    return saldos;
  };

  const saldos = calcularSaldos();

  const ativo = contas
    .filter(c => c.tipo === 'ativo')
    .reduce((sum, c) => sum + (saldos[c.id] || 0), 0);

  const passivo = contas
    .filter(c => c.tipo === 'passivo')
    .reduce((sum, c) => sum + (saldos[c.id] || 0), 0);

  const patrimonio = ativo - passivo;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Balanço Patrimonial</h1>
        <p className="text-muted-foreground">Demonstração da posição patrimonial e financeira</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ativo Total</p>
              <p className="text-2xl font-bold text-primary">R$ {ativo.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Passivo Total</p>
              <p className="text-2xl font-bold text-destructive">R$ {passivo.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
              <p className="text-2xl font-bold">R$ {patrimonio.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8" />
          </div>
        </Card>
      </div>

      {/* Balanço Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATIVO */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            ATIVO
          </h2>
          
          <div className="space-y-3">
            {contas
              .filter(c => c.tipo === 'ativo' && c.nivel <= 3)
              .map((conta) => {
                const saldo = saldos[conta.id] || 0;
                return (
                  <div key={conta.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium" style={{ paddingLeft: `${(conta.nivel - 1) * 16}px` }}>
                        {conta.codigo} - {conta.nome}
                      </p>
                    </div>
                    <Badge variant={saldo > 0 ? 'default' : 'secondary'}>
                      R$ {saldo.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
            
            <div className="flex justify-between items-center pt-4 font-bold text-lg border-t-2">
              <span>TOTAL DO ATIVO</span>
              <span className="text-primary">R$ {ativo.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* PASSIVO + PATRIMÔNIO LÍQUIDO */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            PASSIVO E PATRIMÔNIO LÍQUIDO
          </h2>
          
          <div className="space-y-3">
            {contas
              .filter(c => c.tipo === 'passivo' && c.nivel <= 3)
              .map((conta) => {
                const saldo = saldos[conta.id] || 0;
                return (
                  <div key={conta.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium" style={{ paddingLeft: `${(conta.nivel - 1) * 16}px` }}>
                        {conta.codigo} - {conta.nome}
                      </p>
                    </div>
                    <Badge variant={saldo > 0 ? 'destructive' : 'secondary'}>
                      R$ {saldo.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
            
            <div className="flex justify-between items-center py-2 border-b">
              <p className="font-semibold">Patrimônio Líquido</p>
              <Badge>R$ {patrimonio.toFixed(2)}</Badge>
            </div>
            
            <div className="flex justify-between items-center pt-4 font-bold text-lg border-t-2">
              <span>TOTAL DO PASSIVO + PL</span>
              <span className="text-destructive">R$ {(passivo + patrimonio).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
