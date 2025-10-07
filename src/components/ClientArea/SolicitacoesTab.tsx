import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolicitacoesTabProps {
  clienteId: string;
}

export function SolicitacoesTab({ clienteId }: SolicitacoesTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de aprovações será implementado...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
