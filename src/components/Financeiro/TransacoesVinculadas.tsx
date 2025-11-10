import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Calendar } from "lucide-react";

interface TransacoesVinculadasProps {
  orcamentoId: string;
}

export function TransacoesVinculadas({ orcamentoId }: TransacoesVinculadasProps) {
  const { data: transacoes, isLoading } = useQuery({
    queryKey: ["transacoes_orcamento", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes_financeiras")
        .select("*")
        .eq("orcamento_id", orcamentoId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Carregando transações...</p>;
  }

  const statusColors: Record<string, string> = {
    pendente: "bg-warning/10 text-warning border-warning/20",
    pago: "bg-success/10 text-success border-success/20",
    cancelado: "bg-destructive/10 text-destructive border-destructive/20",
    atrasado: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago",
    cancelado: "Cancelado",
    atrasado: "Atrasado",
  };

  return (
    <div className="space-y-3">
      {transacoes && transacoes.length > 0 ? (
        transacoes.map((t) => (
          <div key={t.id} className="flex justify-between items-start p-4 bg-muted/30 rounded-lg border">
            <div className="flex-1">
              <p className="font-medium mb-2">{t.descricao}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Vencimento: {format(new Date(t.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-success" />
                <p className="text-lg font-bold text-success">
                  R$ {Number(t.valor).toFixed(2)}
                </p>
              </div>
              <Badge className={statusColors[t.status] || "bg-muted"}>
                {statusLabels[t.status] || t.status}
              </Badge>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhuma transação vinculada ainda
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Transações serão criadas automaticamente quando o orçamento for aprovado
          </p>
        </div>
      )}
    </div>
  );
}
