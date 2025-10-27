import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import React, { useState, useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useDynamicModules } from "@/hooks/useDynamicModules";
import { UserProfileSection } from "./UserProfileSection";
import { UserActionsModule } from "./UserActionsModule";
import { ClientSelector } from "./ClientSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const navigate = useNavigate();
  const { hasModuleAccess } = usePermissions();
  const { role } = useUserRole();
  const { modules: dbModules, loading } = useDynamicModules();
  const { state } = useSidebar();
  const location = useLocation();
  const [selectedModule, setSelectedModule] = useState<string>("inicio");
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    localStorage.getItem('admin_selected_cliente_id')
  );

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
        { title: "Hub de Inteligência", url: "/inteligencia", icon: Icons.Brain },
        { title: "🔮 Análise Preditiva", url: "/inteligencia/preditiva", icon: Icons.TrendingUp },
        { title: "Calendário Unificado", url: "/calendario", icon: Icons.CalendarDays },
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
          { title: "🎯 Painel GRS", url: "/grs/painel", icon: Icons.LayoutDashboard },
          { title: "Visão de Clientes", url: "/grs/dashboard", icon: Icons.Users },
          { title: "Planejamentos", url: "/grs/planejamentos", icon: Icons.Calendar },
          { title: "Tarefas", url: "/grs/tarefas", icon: Icons.CheckSquare },
          { title: "Calendário Editorial", url: "/grs/calendario-editorial", icon: Icons.CalendarDays },
          { title: "🎬 Roteiro IA", url: "/grs/roteiro-ia", icon: Icons.Film },
          { title: "Calendário Unificado", url: "/calendario", icon: Icons.CalendarClock },
          { title: "Relatórios", url: "/grs/relatorios", icon: Icons.FileText },
          { title: "Cliente (Detalhes)", url: "/grs/cliente", icon: Icons.User },
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
        { title: "Clientes", url: "/clientes", icon: Icons.Users },
        { title: "Contratos", url: "/admin/contratos", icon: Icons.FileSignature },
        { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Icons.Calculator },
        { title: "Propostas", url: "/administrativo/propostas", icon: Icons.FileText },
        { 
          title: "💰 Gestão de Contas", 
          url: "/financeiro/gestao-contas", 
          icon: Icons.DollarSign 
        },
        { title: "🏦 Caixa & Bancos", url: "/financeiro/caixa-bancos", icon: Icons.Landmark },
        { 
          title: "📊 Relatórios Gerenciais", 
          url: "/financeiro/relatorios", 
          icon: Icons.TrendingUp 
        },
        { title: "🔄 Conciliação", url: "/financeiro/conciliacao", icon: Icons.CheckCircle },
        { title: "📂 Centros de Custo", url: "/financeiro/centros-custo", icon: Icons.FolderTree },
        { title: "👥 Fornecedores", url: "/fornecedores", icon: Icons.Users },
        { title: "Pessoas", url: "/rh/pessoas", icon: Icons.Users },
        { title: "Folha", url: "/financeiro/folha", icon: Icons.Wallet },
        { title: "Relatórios", url: "/relatorios", icon: Icons.FileText },
      ],
      permissions: ["financeiro", "administrativo", "rh"]
    },
    {
      id: "design",
      title: "Design / Criativo",
      icon: Icons.Palette,
      items: [
        { title: "🎨 Painel Design", url: "/design/dashboard", icon: Icons.LayoutDashboard },
        { title: "Minhas Tarefas", url: "/design/minhas-tarefas", icon: Icons.CheckSquare },
        { title: "Calendário Unificado", url: "/calendario", icon: Icons.Calendar },
        { title: "Aprovações", url: "/design/aprovacoes", icon: Icons.Eye },
        { title: "Biblioteca", url: "/design/biblioteca", icon: Icons.Images },
        { title: "Metas", url: "/design/metas", icon: Icons.Target },
      ],
      permissions: ["design"]
    },
    {
      id: "audiovisual",
      title: "Audiovisual",
      icon: Icons.Video,
      items: [
        { title: "Dashboard", url: "/audiovisual/dashboard", icon: Icons.Video },
        { title: "Minhas Tarefas", url: "/audiovisual/tarefas", icon: Icons.CheckSquare },
        { title: "Tarefas Unificadas", url: "/audiovisual/tarefas-unificadas", icon: Icons.KanbanSquare },
        { title: "Captações", url: "/audiovisual/captacoes", icon: Icons.Camera },
        { title: "Projetos", url: "/audiovisual/projetos", icon: Icons.Film },
        { title: "Calendário Unificado", url: "/calendario", icon: Icons.CalendarClock },
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
        { title: "🔌 Monitor de Conexões", url: "/configuracoes/monitor", icon: Icons.Activity },
        { title: "Relatórios", url: "/relatorios", icon: Icons.FileText },
        { title: "Homologação", url: "/admin/homologacao-mvp", icon: Icons.ClipboardList },
        { title: "Logs", url: "/admin/logs", icon: Icons.Activity },
      ],
      permissions: [],
      roles: ["admin"]
    },
    {
      id: "cliente_view",
      title: "Visão Cliente",
      icon: Icons.UserCheck,
      items: [
        { title: "Painel Principal", url: "/cliente/painel", icon: Icons.LayoutDashboard },
        { title: "Aprovações", url: "/cliente/painel?tab=approvals", icon: Icons.CheckSquare },
        { title: "Metas", url: "/cliente/painel?tab=goals", icon: Icons.Target },
        { title: "Financeiro", url: "/cliente/painel?tab=finance", icon: Icons.DollarSign },
        { title: "Suporte", url: "/cliente/painel?tab=support", icon: Icons.MessageSquare },
      ],
      permissions: [],
      roles: ["admin"]
    },
  ];

  // Filtrar módulos por permissões e roles
  const getVisibleModules = (): Module[] => {
    if (role === 'admin') {
      return fallbackModules;
    }

    return fallbackModules.filter((module) => {
      // Se o módulo requer roles específicos
      if (module.roles && module.roles.length > 0) {
        return module.roles.includes(role || "");
      }
      
      // Se não tem permissões definidas, não mostrar
      if (!module.permissions || module.permissions.length === 0) {
        return false;
      }
      
      // Verificar se o usuário tem TODAS as permissões necessárias
      return module.permissions.every(p => hasModuleAccess(p as any));
    });
  };

  // USAR MÓDULOS DINÂMICOS DO BANCO (memoized for stable identity)
  const displayModules = useMemo(() => {
    return dbModules.length > 0 
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
      : getVisibleModules();
  }, [dbModules, role]);

  // Create stable index of routes for dependency tracking
  const routesIndex = useMemo(() => 
    displayModules.flatMap(m => m.items.map(i => i.url)).join('|'), 
    [displayModules]
  );

  // Detectar módulo atual baseado na rota
  const handleClientModuleClick = (url: string, e: React.MouseEvent) => {
    if (selectedModule === 'cliente_view' && role === 'admin') {
      e.preventDefault();
      
      const storedClienteId = localStorage.getItem('admin_selected_cliente_id');
      
      if (!storedClienteId) {
        setClientSelectorOpen(true);
        setPendingUrl(url);
      } else {
        navigate(url);
      }
    }
  };

  const handleClientSelect = (clienteId: string | null) => {
    if (clienteId) {
      localStorage.setItem('admin_selected_cliente_id', clienteId);
      setSelectedClienteId(clienteId);
      setClientSelectorOpen(false);
      if (pendingUrl) {
        navigate(pendingUrl);
        setPendingUrl("");
      }
    }
  };

  const detectCurrentModule = () => {
    const currentPath = location.pathname;
    
    // Primeiro: tentar match exato com items.url
    for (const module of displayModules) {
      if (module.items.some(item => currentPath.startsWith(item.url))) {
        return module.id;
      }
    }
    
    // Fallback para rotas dinâmicas (ex: /grs/cliente/{id}/projetos)
    // Extrair prefixo da rota (ex: "/grs/cliente" de "/grs/cliente/123/projetos")
    const pathSegments = currentPath.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      const modulePrefix = `/${pathSegments[0]}/${pathSegments[1]}`; // ex: "/grs/cliente"
      
      for (const module of displayModules) {
        if (module.items.some(item => item.url.startsWith(modulePrefix))) {
          return module.id;
        }
      }
    }
    
    // Match por primeiro segmento (ex: "/grs" em "/grs/qualquer-coisa")
    const firstSegment = `/${pathSegments[0]}`;
    for (const module of displayModules) {
      if (module.items.some(item => item.url.startsWith(firstSegment))) {
        return module.id;
      }
    }
    
    return "inicio";
  };

  // Atualizar módulo selecionado quando a localização, rotas ou role mudarem
  React.useEffect(() => {
    setSelectedModule(detectCurrentModule());
  }, [location.pathname, routesIndex, role]);

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
          "shadow-lg shadow-bex/20",
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
                  "backdrop-blur-md",
                  isSelected 
                    ? 'bg-bex-dark text-bex-green shadow-lg shadow-bex/30 scale-105' 
                    : 'bg-bex-green/90 text-bex-dark hover:bg-white/90 hover:scale-110 hover:shadow-md'
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
            <div className={cn(
              "flex-1 px-2 overflow-y-auto",
              "scrollbar-thin scrollbar-thumb-bex/30 scrollbar-track-transparent",
              "hover:scrollbar-thumb-bex/50 transition-all"
            )}>
              {currentModule?.items.map((item, index) => {
                const isItemActive = isActive(item.url);
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={(e) => handleClientModuleClick(item.url, e)}
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 mb-1 text-sm rounded-lg transition-all duration-300",
                      "hover:translate-x-1",
                      isActive
                        ? 'bg-gradient-to-r from-bex/20 to-transparent text-bex-green border-l-2 border-bex-green shadow-md shadow-bex/20'
                        : 'text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green hover:border-l-2 hover:border-bex/50'
                    )}
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
      
      {/* Modal de Seleção de Cliente */}
      <Dialog open={clientSelectorOpen} onOpenChange={setClientSelectorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Selecione um Cliente para Visualizar</DialogTitle>
          </DialogHeader>
          <ClientSelector
            onClientSelect={handleClientSelect}
            selectedClientId={selectedClienteId || undefined}
            showContext={false}
          />
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
