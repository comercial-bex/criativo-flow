import { CofreCredenciais } from "./CofreCredenciais";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";

interface DetalhesTabProps {
  clienteId: string;
  projetoId?: string;
}

export function DetalhesTab({ clienteId, projetoId }: DetalhesTabProps) {
  const { role } = usePermissions();

  // Atendimento não vê o cofre
  const canViewVault = role === 'admin' || role === 'gestor';

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprovações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credenciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Cofre de Credenciais (apenas Admin/Gestor) */}
      {canViewVault && (
        <CofreCredenciais clienteId={clienteId} projetoId={projetoId} />
      )}

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detalhes adicionais serão exibidos aqui...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
