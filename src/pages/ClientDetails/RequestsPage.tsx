import { useParams } from "react-router-dom";
import { SolicitacoesTab } from "@/components/ClientArea/SolicitacoesTab";

export default function RequestsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <SolicitacoesTab clienteId={clientId} />;
}
