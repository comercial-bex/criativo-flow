import { Card } from "@/components/ui/card";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface PropostaPreviewMiniProps {
  proposta: any;
  itens: any[];
}

export function PropostaPreviewMini({ proposta, itens }: PropostaPreviewMiniProps) {
  const subtotal = itens.reduce((acc, item) => acc + (item.subtotal_item || 0), 0);
  
  return (
    <Card className="p-4 bg-muted/30">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {proposta.descontos > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Descontos</span>
            <span className="font-medium text-green-600">- {formatCurrency(proposta.descontos)}</span>
          </div>
        )}
        
        {proposta.impostos > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Impostos</span>
            <span className="font-medium">{formatCurrency(proposta.impostos)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(proposta.total)}</span>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2">
          {itens.length} {itens.length === 1 ? 'item' : 'itens'}
        </div>
      </div>
    </Card>
  );
}
