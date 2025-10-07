import { useParams } from "react-router-dom";
import { ArquivosTab } from "@/components/ClientArea/ArquivosTab";

export default function FilesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <ArquivosTab clienteId={clientId} />;
}
