import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinanceiroTabProps {
  clienteId: string;
}

export function FinanceiroTab({ clienteId }: FinanceiroTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Módulo financeiro será implementado...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
