import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArquivosTabProps {
  clienteId: string;
  projetoId?: string;
}

export function ArquivosTab({ clienteId, projetoId }: ArquivosTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Arquivos e Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sistema de arquivos será implementado...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
