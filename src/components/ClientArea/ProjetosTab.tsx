import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjetosTabProps {
  clienteId: string;
}

export function ProjetosTab({ clienteId }: ProjetosTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Projetos do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Listagem de projetos será implementada...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
