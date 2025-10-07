import { useParams } from "react-router-dom";
import { TimelineTab } from "@/components/ClientArea/TimelineTab";

export default function TimelinePage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <TimelineTab clienteId={clientId} />;
}
