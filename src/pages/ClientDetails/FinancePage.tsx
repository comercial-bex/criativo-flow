import { useParams } from "react-router-dom";
import { FinanceiroTab } from "@/components/ClientArea/FinanceiroTab";

export default function FinancePage() {
  const { clientId } = useParams<{ clientId: string }>();
  
  if (!clientId) return null;

  return <FinanceiroTab clienteId={clientId} />;
}
