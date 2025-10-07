import { useParams } from "react-router-dom";
import { ProjetosTab } from "@/components/ClientArea/ProjetosTab";

export default function ProjectsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <ProjetosTab clienteId={clientId} />;
}
