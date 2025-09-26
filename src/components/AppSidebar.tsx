import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Building2,
  CreditCard,
  UserCheck,
  Calendar,
  BarChart3,
  ClipboardCheck,
  Calculator,
  Briefcase,
  Signature,
  Video,
  Camera,
  Film,
  Palette,
  FolderOpen,
  Target,
  Eye,
  Home,
  Inbox
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { usePermissions } from "@/hooks/usePermissions";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Clientes", url: "/clientes", icon: Building2 },
  { title: "Especialistas", url: "/especialistas", icon: UserCheck },
]

const financialItems = [
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Planos", url: "/planos", icon: CreditCard },
  { title: "Categorias", url: "/categorias-financeiras", icon: FileText },
]

const administrativeItems = [
  { title: "Dashboard Admin", url: "/administrativo/dashboard", icon: Briefcase },
  { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Calculator },
  { title: "Propostas", url: "/administrativo/propostas", icon: Signature },
]

const audiovisualItems = [
  { title: "Dashboard AV", url: "/audiovisual/dashboard", icon: Video },
  { title: "Captações", url: "/audiovisual/captacoes", icon: Camera },
  { title: "Projetos AV", url: "/audiovisual/projetos", icon: Film },
  { title: "Equipamentos", url: "/audiovisual/equipamentos", icon: Settings },
]

const designItems = [
  { title: "Dashboard Design", url: "/design/dashboard", icon: Palette },
  { title: "Kanban", url: "/design/kanban", icon: ClipboardCheck },
  { title: "Calendário", url: "/design/calendario", icon: Calendar },
  { title: "Biblioteca", url: "/design/biblioteca", icon: FolderOpen },
  { title: "Metas", url: "/design/metas", icon: Target },
  { title: "Aprovações", url: "/design/aprovacoes", icon: Eye },
]

const managementItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation();
  const { hasModuleAccess, role } = usePermissions();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on permissions
  const getVisibleMainItems = () => {
    return mainItems.filter(item => {
      switch (item.url) {
        case '/dashboard':
          return hasModuleAccess('dashboard');
        case '/clientes':
          return hasModuleAccess('clientes');
        case '/crm':
          return hasModuleAccess('crm');
        case '/especialistas':
          return hasModuleAccess('especialistas');
        default:
          return true;
      }
    });
  };

  const getVisibleFinancialItems = () => {
    return financialItems.filter(() => hasModuleAccess('financeiro'));
  };

  const getVisibleAdministrativeItems = () => {
    return administrativeItems.filter(() => hasModuleAccess('administrativo'));
  };

  const getVisibleAudiovisualItems = () => {
    return audiovisualItems.filter(() => hasModuleAccess('audiovisual'));
  };

  const getVisibleDesignItems = () => {
    return designItems.filter(() => hasModuleAccess('design'));
  };

  const getVisibleManagementItems = () => {
    return managementItems.filter(item => {
      if (item.url.startsWith('/relatorios')) {
        return hasModuleAccess('relatorios');
      }
      if (item.url.startsWith('/configuracoes')) {
        return hasModuleAccess('configuracoes');
      }
      return true;
    });
  };

  // Role-specific sections
  const shouldShowSection = (section: string) => {
    switch (section) {
      case 'main':
        return true;
      case 'financial':
        return hasModuleAccess('financeiro');
      case 'administrative':
        return hasModuleAccess('administrativo');
      case 'audiovisual':
        return hasModuleAccess('audiovisual');
      case 'design':
        return hasModuleAccess('design');
      case 'management':
        return hasModuleAccess('relatorios') || hasModuleAccess('configuracoes') || role === 'gestor' || role === 'admin';
      case 'grs':
        return role === 'grs' || role === 'admin';
      case 'atendimento':
        return role === 'atendimento' || role === 'admin';
      case 'cliente':
        return role === 'cliente';
      default:
        return false;
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        {shouldShowSection('main') && getVisibleMainItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Principais</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleMainItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* GRS Section */}
        {shouldShowSection('grs') && (
          <SidebarGroup>
            <SidebarGroupLabel>GRS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/grs/dashboard"
                      className={({ isActive }) =>
                        isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard GRS</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Atendimento Section */}
        {shouldShowSection('atendimento') && (
          <SidebarGroup>
            <SidebarGroupLabel>Atendimento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/atendimento/inbox"
                      className={({ isActive }) =>
                        isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                      }
                    >
                      <Inbox className="mr-2 h-4 w-4" />
                      <span>Inbox</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Cliente Section */}
        {shouldShowSection('cliente') && (
          <SidebarGroup>
            <SidebarGroupLabel>Cliente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/cliente/painel"
                      className={({ isActive }) =>
                        isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                      }
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Meu Painel</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/cliente/projetos"
                      className={({ isActive }) =>
                        isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                      }
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Meus Projetos</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/aprovacao-job"
                      className={({ isActive }) =>
                        isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Aprovações</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowSection('financial') && getVisibleFinancialItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleFinancialItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowSection('administrative') && getVisibleAdministrativeItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrativo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleAdministrativeItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowSection('audiovisual') && getVisibleAudiovisualItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Audiovisual</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleAudiovisualItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowSection('design') && getVisibleDesignItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Design</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleDesignItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {shouldShowSection('management') && getVisibleManagementItems().length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getVisibleManagementItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "border-l-2 border-l-primary bg-muted/50 text-foreground font-medium pl-3" : "hover:bg-muted/30 pl-3"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}