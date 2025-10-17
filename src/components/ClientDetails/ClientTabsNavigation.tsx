import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  Clock, 
  Info, 
  Users, 
  FolderOpen, 
  FileText, 
  FileCheck, 
  FileSignature, 
  DollarSign,
  StickyNote,
  Share2
} from "lucide-react";

interface ClientTabsNavigationProps {
  clienteId: string;
}

const RBAC_TABS = {
  timeline: ['admin', 'gestor', 'grs', 'atendimento', 'designer', 'filmmaker'],
  details: ['admin', 'gestor', 'atendimento'],
  contacts: ['admin', 'gestor'],
  projects: ['admin', 'gestor'],
  files: ['admin', 'gestor', 'grs', 'designer', 'filmmaker'],
  requests: ['admin', 'gestor'],
  contracts: ['admin', 'gestor'],
  finance: ['admin', 'gestor'],
  notes: ['admin', 'gestor', 'grs', 'atendimento'],
  'social-integrations': ['admin', 'gestor', 'grs'],
} as const;

export function ClientTabsNavigation({ clienteId }: ClientTabsNavigationProps) {
  const location = useLocation();
  const { role } = usePermissions();

  const currentTab = location.pathname.split('/').pop() || 'timeline';

  const canViewTab = (tabKey: keyof typeof RBAC_TABS) => {
    if (!role) return false;
    return RBAC_TABS[tabKey].includes(role as any);
  };

  const tabs = [
    { key: 'timeline', label: 'Linha do tempo', icon: Clock },
    { key: 'details', label: 'Detalhes', icon: Info },
    { key: 'contacts', label: 'Usuários', icon: Users },
    { key: 'projects', label: 'Projetos', icon: FolderOpen },
    { key: 'files', label: 'Arquivos', icon: FileText },
    { key: 'requests', label: 'Solicitações', icon: FileCheck },
    { key: 'contracts', label: 'Contratos', icon: FileSignature },
    { key: 'finance', label: 'Financeiro', icon: DollarSign },
    { key: 'notes', label: 'Notas', icon: StickyNote },
    { key: 'social-integrations', label: 'Redes Sociais', icon: Share2 },
  ] as const;

  return (
    <div className="border-b bg-background px-6">
      <Tabs value={currentTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
          {tabs.map(tab => 
            canViewTab(tab.key) && (
              <Link 
                key={tab.key} 
                to={`/clients/${clienteId}/${tab.key}`}
                className="contents"
              >
                <TabsTrigger 
                  value={tab.key} 
                  className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              </Link>
            )
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
