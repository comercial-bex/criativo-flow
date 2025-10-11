import { Layout } from '@/components/Layout';
import { PessoasManager } from '@/components/RH/PessoasManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pessoas() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <PessoasManager />
        
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
                  <CardDescription>Gerenciar lançamentos, folha de pagamento e transações</CardDescription>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
}
