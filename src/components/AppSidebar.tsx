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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            ERP Marketing
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
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
                      className={`${
                        isFinanceiroActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Financeiro</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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
                                `flex items-center space-x-2 ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`
                              }
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span>{subItem.title}</span>
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

      <SidebarFooter className="border-t p-4">
        <div className="mb-2 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2 group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}