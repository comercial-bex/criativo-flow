import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BexSkeleton } from "@/components/ui/bex-skeleton";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import React, { useState, useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useDynamicModules } from "@/hooks/useDynamicModules";
import { useAuth } from "@/hooks/useAuth";
import { usePrefetchData } from "@/hooks/usePrefetchData";
import { UserProfileSection } from "./UserProfileSection";
import { UserActionsModule } from "./UserActionsModule";
import { ClientSelector } from "./ClientSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { user } = useAuth();
  const { hasModuleAccess } = usePermissions();
  const { role } = useUserRole();
  const { modules: dbModules, loading } = useDynamicModules();
  const { state } = useSidebar();
  const location = useLocation();
  const [selectedModule, setSelectedModule] = useState<string>("inicio");
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");
  const [prefetchingUrls, setPrefetchingUrls] = useState<Set<string>>(new Set());
  
  // Hook de prefetch inteligente
  const {
    prefetchMinhasTarefas,
    prefetchTarefasStats,
    prefetchDashboardGRS,
    prefetchDashboardSetor,
    prefetchProjetos,
    prefetchClientes,
  } = usePrefetchData();
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    localStorage.getItem('admin_selected_cliente_id')
  );

  // Módulos organizados em 5 categorias principais
  const fallbackModules: Module[] = [
    {
      id: "minha_area",
      title: "Minha Área",
      icon: Icons.LayoutDashboard,
      items: [
        { title: "Dashboard", url: "/inicio", icon: Icons.LayoutDashboard },
        { title: "Minhas Tarefas", url: "/tarefas", icon: Icons.CheckSquare },
        { title: "Calendário", url: "/calendario", icon: Icons.CalendarDays },
        { title: "Favoritos", url: "/inicio/favoritos", icon: Icons.Star },
      ],
      permissions: ["dashboard"]
    },
    {
      id: "projetos",
      title: "Projetos",
      icon: Icons.Briefcase,
      items: [
        { title: "Dashboard", url: "/grs/painel", icon: Icons.LayoutDashboard },
        { title: "Gestão de Projetos", url: "/grs/dashboard", icon: Icons.Folder },
        { title: "Planejamentos", url: "/grs/planejamentos", icon: Icons.Calendar },
        { title: "Roteiro IA", url: "/grs/roteiro-ia", icon: Icons.Film },
        { title: "Calendário Editorial", url: "/grs/calendario-editorial", icon: Icons.CalendarDays },
        { title: "Inteligência", url: "/inteligencia", icon: Icons.Brain },
        { title: "Análise Preditiva", url: "/inteligencia/preditiva", icon: Icons.TrendingUp },
      ],
      permissions: ["grs", "projetos", "inteligencia"]
    },
    {
      id: "design",
      title: "Design",
      icon: Icons.Palette,
      items: [
        { title: "Meus Jobs", url: "/design/dashboard", icon: Icons.Palette },
        { title: "Kanban", url: "/design/minhas-tarefas", icon: Icons.Trello },
        { title: "Aprovações", url: "/design/aprovacoes", icon: Icons.Eye },
        { title: "Biblioteca", url: "/design/biblioteca", icon: Icons.Images },
        { title: "Calendário", url: "/design/calendario", icon: Icons.Calendar },
      ],
      permissions: ["design"]
    },
    {
      id: "audiovisual",
      title: "Audiovisual",
      icon: Icons.Video,
      items: [
        { title: "Dashboard", url: "/audiovisual/dashboard", icon: Icons.Video },
        { title: "Kanban", url: "/audiovisual/minhas-tarefas", icon: Icons.Trello },
        { title: "Agenda Gravações", url: "/audiovisual/captacoes", icon: Icons.Camera },
        { title: "Calendário", url: "/audiovisual/calendario", icon: Icons.Calendar },
      ],
      permissions: ["audiovisual", "filmmaker"]
    },
    {
      id: "comercial",
      title: "Comercial",
      icon: Icons.DollarSign,
      items: [
        { title: "CRM", url: "/crm", icon: Icons.Target },
        { title: "Clientes", url: "/clientes", icon: Icons.Users },
        { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Icons.Calculator },
        { title: "Propostas", url: "/administrativo/propostas", icon: Icons.FileText },
        { title: "Financeiro", url: "/financeiro/gestao-contas", icon: Icons.Landmark },
        { title: "Relatórios", url: "/financeiro/relatorios", icon: Icons.TrendingUp },
      ],
      permissions: ["crm", "financeiro", "administrativo"]
    },
    {
      id: "admin",
      title: "Admin",
      icon: Icons.Settings,
      items: [
        { title: "Painel Admin", url: "/admin/painel", icon: Icons.Shield },
        { title: "Tarefas", url: "/admin/tarefas", icon: Icons.CheckSquare },
        { title: "Usuários", url: "/usuarios", icon: Icons.Users2 },
        { title: "Produtos", url: "/admin/produtos", icon: Icons.Package },
        { title: "Contratos", url: "/admin/contratos", icon: Icons.FileSignature },
        { title: "Notificações", url: "/admin/notificacoes", icon: Icons.Bell },
        { title: "Sistema", url: "/admin/system-health", icon: Icons.Activity },
        { title: "Monitor", url: "/configuracoes/monitor", icon: Icons.Wifi },
        { title: "Visão Cliente", url: "/cliente/painel", icon: Icons.UserCheck },
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
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // 1. Match EXATO primeiro (prioridade máxima)
    for (const module of displayModules) {
      if (module.items.some(item => currentPath === item.url)) {
        return module.id;
      }
    }
    
    // 2. Match por MAIOR especificidade (mais segmentos = melhor match)
    let bestMatch: { moduleId: string; segments: number } | null = null;
    
    for (const module of displayModules) {
      for (const item of module.items) {
        if (currentPath.startsWith(item.url) && item.url !== '/') {
          const itemSegments = item.url.split('/').filter(Boolean).length;
          if (!bestMatch || itemSegments > bestMatch.segments) {
            bestMatch = { moduleId: module.id, segments: itemSegments };
          }
        }
      }
    }
    
    if (bestMatch) return bestMatch.moduleId;
    
    // 3. Fallback: Match por prefixo do MÓDULO (não do item)
    // Mapear rotas para módulos diretamente
    const routeModuleMap: Record<string, string> = {
      'admin': 'admin',
      'grs': 'projetos',
      'design': 'design',
      'audiovisual': 'audiovisual',
      'financeiro': 'comercial',
      'crm': 'comercial',
      'cliente': 'admin',
      'inteligencia': 'projetos',
      'configuracoes': 'admin',
      'usuarios': 'admin',
    };
    
    const firstSegment = pathSegments[0];
    if (firstSegment && routeModuleMap[firstSegment]) {
      return routeModuleMap[firstSegment];
    }
    
    return "minha_area";
  };

  // Atualizar módulo selecionado quando a localização, rotas ou role mudarem
  React.useEffect(() => {
    setSelectedModule(detectCurrentModule());
  }, [location.pathname, routesIndex, role]);

  const currentModule = displayModules.find(m => m.id === selectedModule);
  const isActive = (path: string) => location.pathname.startsWith(path);

  if (loading) {
    return (
      <Sidebar 
        className={cn(
          "h-screen bg-bex-dark border-r border-bex-green/20",
          "w-[280px]"
        )} 
        collapsible="icon"
      >
        <SidebarContent className="p-4 space-y-4">
          <div className="space-y-3">
            <BexSkeleton className="h-12 w-12 rounded-full" />
            <BexSkeleton className="h-6 w-3/4" />
            <BexSkeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <BexSkeleton 
                key={i} 
                className="h-10 w-full rounded-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
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
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedModule(module.id)}
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                      "backdrop-blur-md",
                      isSelected 
                        ? 'bg-bex-dark text-bex-green shadow-lg shadow-bex/30 scale-105' 
                        : 'bg-bex-green/90 text-bex-dark hover:bg-white/90 hover:scale-110 hover:shadow-md'
                    )}
                  >
                    <Icon size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="bg-bex text-bex-dark font-medium border-bex-green/20"
                >
                  <p>{module.title}</p>
                </TooltipContent>
              </Tooltip>
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
                const isPrefetching = prefetchingUrls.has(item.url);
                
                // Função para fazer prefetch baseado na rota
                const handlePrefetch = async () => {
                  if (!user?.id || isPrefetching) return;
                  
                  setPrefetchingUrls(prev => new Set(prev).add(item.url));
                  
                  try {
                    // Prefetch baseado na URL de destino
                    if (item.url.includes('/grs/minhas-tarefas')) {
                      await Promise.all([
                        prefetchMinhasTarefas(user.id),
                        prefetchTarefasStats(user.id)
                      ]);
                    } else if (item.url.includes('/grs/dashboard')) {
                      await prefetchDashboardGRS(user.id);
                    } else if (item.url.includes('/grs/projetos') || item.url.includes('/grs/cliente-projetos')) {
                      await Promise.all([
                        prefetchProjetos(),
                        prefetchClientes()
                      ]);
                    } else if (item.url.includes('/audiovisual/minhas-tarefas')) {
                      await prefetchDashboardSetor(user.id, 'Audiovisual');
                    } else if (item.url.includes('/design/minhas-tarefas')) {
                      await prefetchDashboardSetor(user.id, 'Criativo');
                    } else if (item.url.includes('/audiovisual') || item.url.includes('/design')) {
                      await prefetchProjetos();
                    }
                  } finally {
                    // Remove do set após 500ms
                    setTimeout(() => {
                      setPrefetchingUrls(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(item.url);
                        return newSet;
                      });
                    }, 500);
                  }
                };
                
                const navLinkContent = (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={(e) => handleClientModuleClick(item.url, e)}
                    onMouseEnter={handlePrefetch}
                    onFocus={handlePrefetch}
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 mb-1 text-sm rounded-lg transition-all duration-300 relative overflow-hidden",
                      "hover:translate-x-1",
                      isActive
                        ? 'bg-gradient-to-r from-bex/10 to-transparent text-bex-green border-l-4 border-bex shadow-lg shadow-bex/30 font-medium'
                        : 'text-sidebar-foreground hover:bg-bex-green/5 hover:text-bex-green hover:border-l-2 hover:border-bex-green/50'
                    )}
                  >
                    {isPrefetching && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bex-green/10 to-transparent animate-shimmer" 
                             style={{
                               backgroundSize: '200% 100%',
                               animation: 'shimmer 1.5s infinite'
                             }}
                        />
                      </div>
                    )}
                    <Icon className={cn("mr-3 h-4 w-4 relative z-10", isPrefetching && "animate-pulse")} />
                    <span className="relative z-10">{item.title}</span>
                  </NavLink>
                );

                // Se sidebar está colapsada (ícone only mode), não renderizar itens expandidos
                // pois o usuário só vê os ícones dos módulos na coluna esquerda
                return navLinkContent;
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
    </TooltipProvider>
  );
}
