import { 
  BarChart3, Users, FolderOpen, Target, DollarSign, LogOut, ChevronRight, Tags,
  Calendar, Inbox, Palette, Video, Settings, FileText, TrendingUp
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Menu baseado no perfil do usuário
const getMenuByRole = (role: string | null) => {
  const commonItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "CRM / Comercial", url: "/crm", icon: Target },
    { title: "Projetos", url: "/projetos", icon: FolderOpen },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Leads", url: "/leads-list", icon: Target },
    { title: "Audiovisual", url: "/audiovisual", icon: Video },
  ];

  const roleSpecificItems = {
    grs: [
      { title: "Planejamentos", url: "/planejamentos", icon: Calendar },
      { title: "Aprovações Cliente", url: "/aprovacoes", icon: FileText },
    ],
    atendimento: [
      { title: "Inbox Revisões", url: "/inbox", icon: Inbox },
      { title: "Timeline Clientes", url: "/timeline", icon: TrendingUp },
    ],
    designer: [
      { title: "Quadro Tarefas", url: "/tarefas", icon: Palette },
      { title: "Biblioteca", url: "/biblioteca", icon: FolderOpen },
    ],
    filmmaker: [
      { title: "Pipeline Vídeo", url: "/pipeline", icon: Video },
      { title: "Agenda Filmagens", url: "/agenda", icon: Calendar },
    ],
    gestor: [
      { title: "Command Center", url: "/command", icon: BarChart3 },
      { title: "Riscos & Oportunidades", url: "/riscos", icon: TrendingUp },
    ],
    admin: [
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ],
    financeiro: [
      { title: "Contratos", url: "/contratos", icon: FileText },
    ],
    cliente: [
      { title: "Meu Painel", url: "/cliente-painel", icon: BarChart3 },
      { title: "Aprovações", url: "/cliente-aprovacoes", icon: FileText },
      { title: "Financeiro", url: "/cliente-financeiro", icon: DollarSign },
    ]
  } as const;

  if (!role) return commonItems; // fallback com navegação global curta
  
  return [
    ...commonItems,
    ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])
  ];
};

const financeiroSubmenu = [
  {
    title: "Visão Geral",
    url: "/financeiro",
    icon: DollarSign,
  },
  {
    title: "Categorias",
    url: "/financeiro/categorias",
    icon: Tags,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = getMenuByRole(role);
  const isFinanceiroActive = location.pathname.startsWith('/financeiro');
  const showFinanceiro = !role || role === 'admin' || role === 'gestor' || role === 'financeiro';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg text-sidebar-foreground">BEX</span>
            <p className="text-xs text-sidebar-foreground/70">Agência de Marketing</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden font-medium">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Financeiro com submenu - apenas para roles autorizados */}
              {showFinanceiro && (
                <Collapsible defaultOpen={isFinanceiroActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`rounded-lg px-3 py-2 text-sidebar-foreground transition-colors ${
                        isFinanceiroActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <DollarSign className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden font-medium">Financeiro</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden text-sidebar-foreground/70" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {financeiroSubmenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={subItem.url}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 rounded-lg px-3 py-2 ml-4 text-sidebar-foreground/80 transition-colors ${
                                  isActive
                                    ? "bg-primary/20 text-primary"
                                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                }`
                              }
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span className="text-sm">{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="mb-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 bg-sidebar-accent rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-sidebar-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Olá, Vitória</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2 group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}