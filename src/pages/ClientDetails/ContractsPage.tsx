import { useParams } from "react-router-dom";
import { ContratosTab } from "@/components/ClientArea/ContratosTab";

export default function ContractsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <ContratosTab clienteId={clientId} />;
}
