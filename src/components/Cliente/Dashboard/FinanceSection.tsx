import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceSectionProps {
  clienteId: string;
}

export function FinanceSection({ clienteId }: FinanceSectionProps) {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [resumo, setResumo] = useState({ total: 0, pago: 0, pendente: 0 });

  useEffect(() => {
    fetchFinanceiro();
  }, [clienteId]);

  const fetchFinanceiro = async () => {
    const { data } = await supabase
      .from('transacoes_financeiras')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data_vencimento', { ascending: false })
      .limit(10);

    if (data) {
      setTransacoes(data);
      
      const total = data.reduce((sum, t) => sum + Number(t.valor), 0);
      const pago = data.filter(t => t.status === 'pago').reduce((sum, t) => sum + Number(t.valor), 0);
      const pendente = data.filter(t => t.status === 'pendente').reduce((sum, t) => sum + Number(t.valor), 0);
      
      setResumo({ total, pago, pendente });
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.total)}
            </div>
            <p className="text-xs text-muted-foreground">Valor total do contrato</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.pago)}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.pendente)}
            </div>
            <p className="text-xs text-muted-foreground">A vencer</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transacoes.map((transacao) => (
              <div key={transacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transacao.descricao || 'Pagamento'}</p>
                  <p className="text-xs text-muted-foreground">
                    Vencimento: {format(new Date(transacao.data_vencimento), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor)}
                  </span>
                  <Badge variant={transacao.status === 'pago' ? 'default' : 'secondary'}>
                    {transacao.status}
                  </Badge>
                </div>
              </div>
            ))}

            {transacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação registrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
