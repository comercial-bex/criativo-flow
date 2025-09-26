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
  Film
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Clientes", url: "/clientes", icon: Building2 },
  { title: "Projetos", url: "/clientes/projetos", icon: FileText },
  { title: "Especialistas", url: "/especialistas", icon: UserCheck },
]

const financialItems = [
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Planos", url: "/planos", icon: CreditCard },
  { title: "Categorias", url: "/financeiro/categorias", icon: FileText },
]

const administrativeItems = [
  { title: "Dashboard Admin", url: "/administrativo", icon: Briefcase },
  { title: "Orçamentos", url: "/administrativo/orcamentos", icon: Calculator },
  { title: "Propostas", url: "/administrativo/propostas", icon: Signature },
]

const audiovisualItems = [
  { title: "Dashboard AV", url: "/audiovisual/dashboard", icon: Video },
  { title: "Captações", url: "/audiovisual/captacoes", icon: Camera },
  { title: "Projetos AV", url: "/audiovisual/projetos", icon: Film },
  { title: "Equipamentos", url: "/audiovisual/equipamentos", icon: Settings },
]

const managementItems = [
  { title: "Planejamentos", url: "/planejamentos", icon: Calendar },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Aprovações", url: "/aprovacao", icon: ClipboardCheck },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    // Exact match for some routes
    if (path === "/dashboard" || path === "/crm" || path === "/clientes") {
      return currentPath === path
    }
    // Prefix match for nested routes
    return currentPath.startsWith(path)
  }

  const isMainExpanded = mainItems.some((i) => isActive(i.url))
  const isFinancialExpanded = financialItems.some((i) => isActive(i.url))
  const isAdministrativeExpanded = administrativeItems.some((i) => isActive(i.url))
  const isAudiovisualExpanded = audiovisualItems.some((i) => isActive(i.url))
  const isManagementExpanded = managementItems.some((i) => isActive(i.url))

  const getNavCls = (path: string) =>
    isActive(path) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!false && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!false && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administrativo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {administrativeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!false && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Audiovisual</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {audiovisualItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!false && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!false && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}