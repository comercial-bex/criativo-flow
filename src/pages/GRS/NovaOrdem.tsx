import { useParams } from 'react-router-dom';
import { NovaOrdemServico } from '@/components/Pacotes/NovaOrdemServico';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NovaOrdem() {
  const { clienteId } = useParams();

  if (!clienteId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>Cliente não especificado</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um pacote e preencha o briefing inteligente para gerar automaticamente o projeto e suas tarefas
        </p>
      </div>
      
      <NovaOrdemServico clienteId={clienteId} />
    </div>
  );
}
