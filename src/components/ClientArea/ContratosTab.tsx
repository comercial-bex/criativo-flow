import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContratosTabProps {
  clienteId: string;
}

export function ContratosTab({ clienteId }: ContratosTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contratos e Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de contratos será implementado...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
