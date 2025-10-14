import { PessoasManager } from '@/components/RH/PessoasManager';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pessoas() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <PessoasManager />
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Link para Folha de Pagamento */}
        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/financeiro/folha')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Folha de Pagamento</CardTitle>
                  <CardDescription>Processar folha e gerar holerites</CardDescription>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        {/* Link para Financeiro */}
        <Card className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/financeiro')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Financeiro</CardTitle>
                  <CardDescription>Gerenciar lançamentos e transações</CardDescription>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
