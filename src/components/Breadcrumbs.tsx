import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

// Mapeamento de rotas para configuração de breadcrumbs
const routeConfig: Record<string, { label: string; icon?: string }> = {
  // Início
  "/inicio": { label: "Início", icon: "Home" },
  "/inicio/favoritos": { label: "Favoritos", icon: "Star" },
  "/inicio/recentes": { label: "Recentes", icon: "Clock" },
  
  // Inteligência
  "/inteligencia": { label: "Inteligência", icon: "Brain" },
  "/inteligencia/preditiva": { label: "Análise Preditiva", icon: "TrendingUp" },
  "/inteligencia/analises": { label: "Análises", icon: "BarChart3" },
  "/inteligencia/insights": { label: "Insights", icon: "Lightbulb" },
  "/inteligencia/previsoes": { label: "Previsões", icon: "TrendingUp" },
  "/inteligencia/metricas": { label: "Métricas", icon: "Activity" },
  
  // GRS
  "/grs": { label: "GRS", icon: "Globe" },
  "/grs/painel": { label: "Painel GRS", icon: "LayoutDashboard" },
  "/grs/dashboard": { label: "Dashboard", icon: "LayoutDashboard" },
  "/grs/planejamentos": { label: "Planejamentos", icon: "Calendar" },
  "/grs/tarefas": { label: "Tarefas", icon: "CheckSquare" },
  "/grs/calendario-editorial": { label: "Calendário Editorial", icon: "CalendarDays" },
  "/grs/roteiro-ia": { label: "Roteiro IA", icon: "Film" },
  "/grs/roteiro-ia/novo": { label: "Novo Roteiro", icon: "FilePlus" },
  "/grs/relatorios": { label: "Relatórios", icon: "FileText" },
  "/grs/cliente": { label: "Cliente", icon: "User" },
  
  // CRM
  "/crm": { label: "CRM", icon: "Target" },
  "/crm/contatos": { label: "Contatos", icon: "Phone" },
  "/crm/historico": { label: "Histórico", icon: "History" },
  
  // Clientes
  "/clientes": { label: "Clientes", icon: "Users" },
  "/clientes/projetos": { label: "Projetos", icon: "FolderOpen" },
  
  // Financeiro
  "/financeiro": { label: "Financeiro", icon: "DollarSign" },
  "/gestao/dashboard": { label: "Dashboard Financeiro", icon: "TrendingUp" },
  "/financeiro/gestao-contas": { label: "Gestão de Contas", icon: "Wallet" },
  "/financeiro/caixa-bancos": { label: "Caixa & Bancos", icon: "Landmark" },
  "/financeiro/relatorios": { label: "Relatórios", icon: "FileText" },
  "/financeiro/conciliacao": { label: "Conciliação", icon: "CheckCircle" },
  "/financeiro/centros-custo": { label: "Centros de Custo", icon: "FolderTree" },
  "/financeiro/folha": { label: "Folha de Pagamento", icon: "Wallet" },
  
  // Admin
  "/admin": { label: "Admin", icon: "Shield" },
  "/admin/painel": { label: "Painel", icon: "LayoutDashboard" },
  "/admin/contratos": { label: "Contratos", icon: "FileSignature" },
  "/admin/produtos": { label: "Produtos", icon: "Package" },
  "/admin/tarefas": { label: "Tarefas", icon: "ClipboardCheck" },
  "/admin/onboarding": { label: "Onboarding", icon: "ClipboardCheck" },
  
  // Design
  "/design": { label: "Design", icon: "Palette" },
  "/design/dashboard": { label: "Painel Design", icon: "LayoutDashboard" },
  "/design/minhas-tarefas": { label: "Minhas Tarefas", icon: "CheckSquare" },
  "/design/aprovacoes": { label: "Aprovações", icon: "Eye" },
  "/design/biblioteca": { label: "Biblioteca", icon: "Images" },
  
  // Audiovisual
  "/audiovisual": { label: "Audiovisual", icon: "Video" },
  "/audiovisual/dashboard": { label: "Dashboard", icon: "LayoutDashboard" },
  "/audiovisual/tarefas": { label: "Tarefas", icon: "CheckSquare" },
  "/audiovisual/captacoes": { label: "Captações", icon: "Camera" },
  "/audiovisual/projetos": { label: "Projetos", icon: "Film" },
  
  // Outros
  "/calendario": { label: "Calendário", icon: "CalendarDays" },
  "/metas": { label: "Metas", icon: "Target" },
  "/relatorios": { label: "Relatórios", icon: "FileText" },
  "/configuracoes": { label: "Configurações", icon: "Settings" },
};

const getIconComponent = (iconName: string): LucideIcon => {
  const icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
  return icon || Icons.Circle;
};

export function useBreadcrumbs() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      {
        label: "Home",
        path: "/inicio",
        icon: Home,
      }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Pular segmentos que são IDs (UUIDs ou números)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      const isNumeric = /^\d+$/.test(segment);
      
      if (isUUID || isNumeric) {
        return;
      }

      const config = routeConfig[currentPath];
      
      if (config) {
        items.push({
          label: config.label,
          path: currentPath,
          icon: config.icon ? getIconComponent(config.icon) : undefined,
        });
      } else {
        // Fallback: capitalizar o segmento
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        items.push({
          label,
          path: currentPath,
        });
      }
    });

    return items;
  }, [location.pathname]);

  return breadcrumbs;
}

interface BreadcrumbsProps {
  className?: string;
  maxItems?: number;
}

export function Breadcrumbs({ className, maxItems }: BreadcrumbsProps) {
  const breadcrumbs = useBreadcrumbs();

  // Se houver muitos itens, mostrar apenas os últimos N
  const displayBreadcrumbs = maxItems && breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { label: "...", path: "", icon: undefined } as BreadcrumbItem,
        ...breadcrumbs.slice(-maxItems + 2)
      ]
    : breadcrumbs;

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm", className)}
      aria-label="Breadcrumb"
    >
      {displayBreadcrumbs.map((item, index) => {
        const isLast = index === displayBreadcrumbs.length - 1;
        const Icon = item.icon;
        const isEllipsis = item.label === "...";

        if (isEllipsis) {
          return (
            <div key={`ellipsis-${index}`} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              <span className="text-muted-foreground px-2">...</span>
            </div>
          );
        }

        return (
          <div key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            
            {isLast ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bex/10 text-bex font-medium">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </div>
            ) : (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md",
                  "text-muted-foreground hover:text-bex hover:bg-bex/10",
                  "transition-all duration-200"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
