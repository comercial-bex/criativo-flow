import { NavLink, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import React, { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useDynamicModules } from "@/hooks/useDynamicModules";
import { UserProfileSection } from "./UserProfileSection";
import { UserActionsModule } from "./UserActionsModule";
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Função auxiliar para mapear nome de ícone para componente Lucide
const getIconComponent = (iconName: string): LucideIcon => {
  const icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
  return icon || Icons.Circle;
};

// Interface para módulos
interface ModuleItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface Module {
  id: string;
  title: string;
  icon: LucideIcon;
  items: ModuleItem[];
  permissions?: string[];
  roles?: string[];
}

export function AppSidebar() {
  const { hasModuleAccess } = usePermissions();
  const { role } = useUserRole();
  const { modules: dbModules, loading } = useDynamicModules();
  const { state } = useSidebar();
  const location = useLocation();
  const [selectedModule, setSelectedModule] = useState<string>("inicio");

  // Módulos fallback (7 hubs principais)
  const fallbackModules: Module[] = [
    {
      id: "inicio",
      title: "Início",
      icon: Icons.Home,
      items: [
        { title: "Meu Resumo", url: "/inicio", icon: Icons.LayoutDashboard },
        { title: "Favoritos", url: "/inicio/favoritos", icon: Icons.Star },
        { title: "Recentes", url: "/inicio/recentes", icon: Icons.Clock },
      ],
      permissions: ["dashboard"]
    },
    {
      id: "inteligencia",
      title: "Inteligência Operacional",
      icon: Icons.Brain,
      items: [
        { title: "Calendário Multidisciplinar", url: "/inteligencia/calendario", icon: Icons.CalendarDays },
        { title: "Análises", url: "/inteligencia/analises", icon: Icons.BarChart3 },
        { title: "Insights", url: "/inteligencia/insights", icon: Icons.Lightbulb },
        { title: "Previsões", url: "/inteligencia/previsoes", icon: Icons.TrendingUp },
        { title: "Métricas", url: "/inteligencia/metricas", icon: Icons.Activity },
      ],
      permissions: ["inteligencia", "calendario"]
    },
    {
      id: "operacoes",
      title: "Operacional (GRS)",
      icon: Icons.Globe,
      items: [
        { title: "Projetos", url: "/grs/projetos", icon: Icons.Briefcase },
        { title: "Planejamentos", url: "/grs/planejamentos", icon: Icons.Calendar },
        { title: "Tarefas", url: "/grs/tarefas", icon: Icons.CheckSquare },
        { title: "Kanban", url: "/operacoes/kanban", icon: Icons.Columns },
        { title: "Calendário", url: "/grs/calendario-editorial", icon: Icons.CalendarDays },
        { title: "Relatórios", url: "/grs/relatorios", icon: Icons.FileText },
      ],
      permissions: ["grs", "projetos"]
    },
    {
      id: "crm",
      title: "CRM",
      icon: Icons.Users,
      items: [
        { title: "Funil de Vendas", url: "/crm", icon: Icons.Target },
        { title: "Contatos", url: "/crm/contatos", icon: Icons.Phone },
        { title: "Histórico", url: "/crm/historico", icon: Icons.History },
      ],
      permissions: ["crm"]
    },
    {
      id: "financeiro",
      title: "Contratos & Financeiro",
      icon: Icons.Building2,
      items: [
        { title: "Dashboard", url: "/gestao/dashboard", icon: Icons.TrendingUp },
        { title: "Contratos", url: "/admin/contratos", icon: Icons.FileSignature },
        { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Icons.Calculator },
        { title: "Propostas", url: "/administrativo/propostas", icon: Icons.FileText },
        { title: "Pessoas", url: "/rh/pessoas", icon: Icons.Users },
        { title: "Folha", url: "/financeiro/folha", icon: Icons.Wallet },
        { title: "Relatórios", url: "/relatorios", icon: Icons.FileText },
      ],
      permissions: ["financeiro", "administrativo", "rh"]
    },
    {
      id: "audiovisual",
      title: "Audiovisual",
      icon: Icons.Video,
      items: [
        { title: "Dashboard", url: "/audiovisual/dashboard", icon: Icons.Video },
        { title: "Minhas Tarefas", url: "/audiovisual/tarefas", icon: Icons.CheckSquare },
        { title: "Captações", url: "/audiovisual/captacoes", icon: Icons.Camera },
        { title: "Projetos", url: "/audiovisual/projetos", icon: Icons.Film },
      ],
      permissions: ["audiovisual"]
    },
    {
      id: "admin",
      title: "Admin",
      icon: Icons.Shield,
      items: [
        { title: "Painel", url: "/admin/painel", icon: Icons.Shield },
        { title: "Notificações", url: "/admin/central-notificacoes", icon: Icons.Bell },
        { title: "Tarefas", url: "/admin/tarefas", icon: Icons.ClipboardCheck },
        { title: "Usuários", url: "/usuarios", icon: Icons.Users2 },
        { title: "Equipamentos", url: "/inventario", icon: Icons.Package },
        { title: "Sistema", url: "/admin/system-health", icon: Icons.Settings },
        { title: "Relatórios", url: "/relatorios", icon: Icons.FileText },
        { title: "Homologação", url: "/admin/homologacao-mvp", icon: Icons.ClipboardList },
        { title: "Logs", url: "/admin/logs", icon: Icons.Activity },
      ],
      permissions: [],
      roles: ["admin"]
    },
  ];

  // Filtrar módulos por permissões e roles
  const getVisibleModules = (): Module[] => {
    if (role === 'admin') {
      return fallbackModules; // Admin vê tudo
    }

    return fallbackModules.filter((module) => {
      // Se o módulo requer roles específicos
      if (module.roles && module.roles.length > 0) {
        return module.roles.includes(role || "");
      }
      // Caso contrário, verificar permissões - usar module.id como ModulePermissions
      return module.permissions?.some(p => hasModuleAccess(p as any)) || false;
    });
  };

  // USAR MÓDULOS DINÂMICOS DO BANCO (já populados via migration)
  const displayModules = dbModules.length > 0 
    ? dbModules.map(mod => ({
        id: mod.slug,
        title: mod.nome,
        icon: getIconComponent(mod.icone),
        items: mod.submodulos.map(sub => ({
          title: sub.nome,
          url: sub.rota,
          icon: getIconComponent(sub.icone)
        }))
      })) 
    : getVisibleModules(); // Fallback apenas se banco estiver vazio

  // Detectar módulo atual baseado na rota
  const detectCurrentModule = () => {
    const currentPath = location.pathname;
    for (const module of displayModules) {
      if (module.items.some(item => currentPath.startsWith(item.url))) {
        return module.id;
      }
    }
    return "inicio";
  };

  // Atualizar módulo selecionado quando a localização mudar
  React.useEffect(() => {
    setSelectedModule(detectCurrentModule());
  }, [location.pathname]);

  const currentModule = displayModules.find(m => m.id === selectedModule);
  const isActive = (path: string) => location.pathname.startsWith(path);

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando módulos...
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar 
      className={cn(
        "h-screen bg-bex-dark border-r border-bex-green/20 transition-all duration-300 ease-in-out",
        state === "collapsed" ? "w-[56px]" : "w-[280px]"
      )} 
      collapsible="icon"
    >
      <div className="flex h-full">
        {/* Coluna Esquerda - Módulos (Verde) */}
        <div className={cn(
          "bg-bex-green flex flex-col items-center py-4 space-y-2 relative z-50",
          state === "collapsed" ? "w-full" : "w-16"
        )}>
          {displayModules.map((module, index) => {
            const isSelected = selectedModule === module.id;
            const Icon = module.icon;
            
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                  isSelected 
                    ? 'bg-bex-dark text-bex-green shadow-lg' 
                    : 'bg-bex-green/90 text-bex-dark hover:bg-white/90'
                )}
                title={module.title}
              >
                <Icon size={20} />
              </button>
            );
          })}

          {/* User Actions - Bottom */}
          <div className="mt-auto pb-4">
            <UserActionsModule />
          </div>
        </div>

        {/* Coluna Direita - Funções (Escuro) */}
        {state === "expanded" && (
          <div className="flex-1 bg-bex-dark flex flex-col relative z-40">
            {/* User Profile Section */}
            <UserProfileSection />

            {/* Módulo Ativo */}
            {currentModule && (
              <div className="px-4 py-3 mx-4 mb-4 bg-bex-green rounded-lg">
                <div className="flex items-center justify-between text-bex-dark">
                  <div className="flex items-center">
                    <currentModule.icon className="mr-2 h-4 w-4" />
                    <span className="font-medium text-sm">{currentModule.title}</span>
                  </div>
                  {role === 'admin' && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 px-2 overflow-y-auto">
              {currentModule?.items.map((item, index) => {
                const isItemActive = isActive(item.url);
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={`flex items-center px-4 py-3 mb-1 text-sm rounded-lg transition-all duration-300 ${
                      isItemActive
                        ? 'bg-sidebar-accent text-bex-green border-l-2 border-bex-green'
                        : 'text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
