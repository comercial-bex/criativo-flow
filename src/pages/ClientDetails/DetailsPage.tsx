import { useParams } from "react-router-dom";
import { DetalhesTab } from "@/components/ClientArea/DetalhesTab";

export default function DetailsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <DetalhesTab clienteId={clientId} />;
}
