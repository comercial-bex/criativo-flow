import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsuariosTabProps {
  clienteId: string;
}

export function UsuariosTab({ clienteId }: UsuariosTabProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Implementação da gestão de usuários será adicionada...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
