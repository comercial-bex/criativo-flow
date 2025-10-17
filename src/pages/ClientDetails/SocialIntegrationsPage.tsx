import { useParams } from 'react-router-dom';
import { SocialIntegrationsCard } from '@/components/SocialIntegrationsCard';

export default function SocialIntegrationsPage() {
  const { clientId } = useParams();
  
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Integração com Redes Sociais</h2>
        <p className="text-muted-foreground">
          Conecte e gerencie as contas de redes sociais do cliente
        </p>
      </div>
      
      <SocialIntegrationsCard clienteId={clientId} />
    </div>
  );
}
