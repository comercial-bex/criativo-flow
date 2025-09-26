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
  Inbox,
  HeadphonesIcon,
  TrendingUp,
  Users2,
  CalendarDays,
  CheckCircle,
  Globe
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import React from "react"
import { usePermissions, type ModulePermissions } from "@/hooks/usePermissions";
import { UserProfileSection } from "./UserProfileSection";
import { UserActionsModule } from "./UserActionsModule";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Modules structure for the new layout
const modules = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Meu Painel", url: "/dashboard", icon: Home },
    ],
    permissions: ["dashboard"]
  },
  {
    id: "crm",
    title: "CRM",
    icon: Users,
    items: [
      { title: "CRM", url: "/crm", icon: Users },
      { title: "Clientes", url: "/clientes", icon: Building2 },
      { title: "Especialistas", url: "/especialistas", icon: UserCheck },
    ],
    permissions: ["crm", "clientes", "especialistas"]
  },
  {
    id: "atendimento",
    title: "Atendimento",
    icon: HeadphonesIcon,
    items: [
      { title: "Atendimentos", url: "/atendimento/inbox", icon: Inbox },
      { title: "Minhas Tarefas", url: "/atendimento/tarefas", icon: ClipboardCheck },
      { title: "Mensagens", url: "/atendimento/mensagens", icon: FileText },
    ],
    permissions: ["atendimento"],
    roles: ["atendimento", "admin"]
  },
  {
    id: "financeiro",
    title: "Financeiro",
    icon: DollarSign,
    items: [
      { title: "Financeiro", url: "/financeiro", icon: DollarSign },
      { title: "Planos", url: "/planos", icon: CreditCard },
      { title: "Categorias", url: "/categorias-financeiras", icon: FileText },
      { title: "Meus Ganhos", url: "/financeiro/ganhos", icon: TrendingUp },
    ],
    permissions: ["financeiro"]
  },
  {
    id: "administrativo", 
    title: "Administrativo",
    icon: Briefcase,
    items: [
      { title: "Dashboard Admin", url: "/administrativo/dashboard", icon: Briefcase },
      { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Calculator },
      { title: "Propostas", url: "/administrativo/propostas", icon: Signature },
    ],
    permissions: ["administrativo"]
  },
  {
    id: "design",
    title: "Design",
    icon: Palette,
    items: [
      { title: "Dashboard Design", url: "/design/dashboard", icon: Palette },
      { title: "Kanban", url: "/design/kanban", icon: ClipboardCheck },
      { title: "Calendário", url: "/design/calendario", icon: Calendar },
      { title: "Biblioteca", url: "/design/biblioteca", icon: FolderOpen },
      { title: "Metas", url: "/design/metas", icon: Target },
      { title: "Aprovações", url: "/design/aprovacoes", icon: Eye },
    ],
    permissions: ["design"]
  },
  {
    id: "audiovisual",
    title: "Audiovisual", 
    icon: Video,
    items: [
      { title: "Dashboard AV", url: "/audiovisual/dashboard", icon: Video },
      { title: "Captações", url: "/audiovisual/captacoes", icon: Camera },
      { title: "Projetos AV", url: "/audiovisual/projetos", icon: Film },
      { title: "Equipamentos", url: "/audiovisual/equipamentos", icon: Settings },
    ],
    permissions: ["audiovisual"]
  },
  {
    id: "grs",
    title: "GRS",
    icon: Globe,
    items: [
      { title: "Dashboard", url: "/grs/dashboard", icon: BarChart3 },
      { title: "Planejamentos", url: "/grs/planejamentos", icon: Calendar },
      { title: "Aprovações", url: "/grs/aprovacoes", icon: CheckCircle },
      { title: "Calendário Editorial", url: "/grs/calendario-editorial", icon: CalendarDays },
    ],
    permissions: ["grs"]
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: Settings,
    items: [
      { title: "Configurações", url: "/configuracoes", icon: Settings },
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
    ],
    permissions: ["configuracoes", "relatorios"]
  },
]

export function AppSidebar() {
  const location = useLocation();
  const { hasModuleAccess, role } = usePermissions();
  const [selectedModule, setSelectedModule] = useState<string>("dashboard");

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Get visible modules based on permissions and role
  const getVisibleModules = () => {
    return modules.filter(module => {
      // Check role restrictions first
      if (module.roles && !module.roles.includes(role)) {
        return false;
      }
      
      // Check permissions - only check valid module permissions
      return module.permissions.some(permission => {
        const validPermissions = ['dashboard', 'clientes', 'crm', 'financeiro', 'administrativo', 'audiovisual', 'design', 'grs', 'configuracoes', 'planos', 'especialistas', 'relatorios'] as const;
        if (validPermissions.includes(permission as any)) {
          return hasModuleAccess(permission as keyof ModulePermissions);
        }
        return false;
      });
    });
  };

  // Client-specific items for role 'cliente'
  const clientItems = [
    { title: "Meu Painel", url: "/cliente/painel", icon: Home },
    { title: "Meus Projetos", url: "/cliente/projetos", icon: Briefcase },
    { title: "Aprovações", url: "/aprovacao-job", icon: Eye },
  ];

  // GRS specific items
  const grsItems = [
    { title: "Dashboard GRS", url: "/grs/dashboard", icon: BarChart3 },
    { title: "Planejamentos", url: "/grs/planejamentos", icon: FileText },
    { title: "Planejamento Estratégico", url: "/grs/planejamento-estrategico", icon: Target },
    { title: "Calendário Editorial", url: "/grs/calendario", icon: Calendar },
    { title: "Aprovações", url: "/grs/aprovacoes", icon: ClipboardCheck },
  ];

  // Detect current module based on location
  const detectCurrentModule = () => {
    const currentPath = location.pathname;
    for (const module of modules) {
      if (module.items.some(item => currentPath.startsWith(item.url))) {
        return module.id;
      }
    }
    return "dashboard";
  };

  // Update selected module when location changes
  React.useEffect(() => {
    setSelectedModule(detectCurrentModule());
  }, [location.pathname]);

  const visibleModules = getVisibleModules();
  const currentModule = visibleModules.find(m => m.id === selectedModule);

  // Get current module items or fallback items based on role
  const getCurrentItems = () => {
    if (role === 'cliente') {
      return clientItems;
    }
    
    if (role === 'grs') {
      return grsItems;
    }
    
    return currentModule?.items || [];
  };

  return (
    <Sidebar className="h-screen bg-bex-dark border-r border-bex-green/20" collapsible="none">
      <div className="flex h-full">
        {/* Left Column - Modules (Green) */}
        <div className="w-16 bg-bex-green flex flex-col items-center py-4 space-y-2 animate-slide-in relative z-50">
          {visibleModules.map((module, index) => {
            const isSelected = selectedModule === module.id;
            const Icon = module.icon;
            
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 module-hover animate-fade-in ${
                  isSelected 
                    ? 'bg-bex-dark text-bex-green shadow-lg' 
                    : 'bg-bex-green/90 text-bex-dark hover:bg-white/90'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                title={module.title}
              >
                <Icon size={20} />
              </button>
            );
          })}

          {/* User Actions Module - Bottom Left */}
          <div className="mt-auto pb-4">
            <UserActionsModule />
          </div>
        </div>

        {/* Right Column - Functions + User Profile (Dark) */}
        <div className="flex-1 bg-bex-dark flex flex-col animate-scale-in relative z-40">
          {/* Sidebar Controls */}
          <div className="p-4 flex items-center justify-between border-b border-bex-green/20">
            <SidebarTrigger className="text-bex-green hover:text-white hover:bg-bex-green/20 transition-colors" />
          </div>
          
          {/* User Profile Section */}
          <UserProfileSection />

          {/* Active Module Highlight */}
          {currentModule && (
            <div className="px-4 py-3 mx-4 mb-4 bg-bex-green rounded-lg animate-fade-in hover-lift">
              <div className="flex items-center text-bex-dark">
                <currentModule.icon className="mr-2 h-4 w-4" />
                <span className="font-medium text-sm">{currentModule.title}</span>
              </div>
            </div>
          )}

        {/* Navigation Items */}
        <div className="flex-1 px-2">
          {getCurrentItems().map((item, index) => {
            const isItemActive = isActive(item.url);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={`flex items-center px-4 py-3 mb-1 text-sm rounded-lg transition-all duration-300 hover-lift animate-slide-in ${
                  isItemActive
                    ? 'bg-sidebar-accent text-bex-green border-l-2 border-bex-green'
                    : 'text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span>{item.title}</span>
                {item.url.includes('/ganhos') && (
                  <span className="ml-auto text-xs bg-bex-green text-bex-dark px-2 py-1 rounded">→</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-xs text-sidebar-foreground/50 border-t border-sidebar-border animate-fade-in">
          <p>Agência Bex Ltda. Admin Dashboard</p>
          <p>© 2025 Todos os Direitos Reservados</p>
        </div>
        </div>
      </div>
    </Sidebar>
  );
}