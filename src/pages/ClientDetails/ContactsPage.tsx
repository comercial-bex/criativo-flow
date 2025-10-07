import { useParams } from "react-router-dom";
import { UsuariosTab } from "@/components/ClientArea/UsuariosTab";

export default function ContactsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <UsuariosTab clienteId={clientId} />;
}
