import { useParams, Outlet, Navigate, useLocation } from "react-router-dom";
import { ClientSidebarMetrics } from "@/components/ClientDetails/ClientSidebarMetrics";
import { ClientHeader } from "@/components/ClientDetails/ClientHeader";
import { ClientTabsNavigation } from "@/components/ClientDetails/ClientTabsNavigation";

export default function ClientDetails() {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();

  if (!clientId) {
    return <Navigate to="/clientes" replace />;
  }

  // Redirect base path to timeline
  if (location.pathname === `/clients/${clientId}`) {
    return <Navigate to={`/clients/${clientId}/timeline`} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Esquerda - Fixa */}
      <ClientSidebarMetrics clienteId={clientId} />
      
      {/* Conteúdo Principal - Direita */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header + Breadcrumb */}
        <ClientHeader clienteId={clientId} />
        
        {/* Tabs Navegáveis */}
        <ClientTabsNavigation clienteId={clientId} />
        
        {/* Conteúdo da Tab Ativa */}
        <div className="flex-1 overflow-auto bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
