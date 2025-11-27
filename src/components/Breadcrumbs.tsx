import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useClienteResolver,
  useProjetoResolver,
  useRoteiroResolver,
  useContratoResolver,
  useProdutoResolver,
  useOrcamentoResolver,
  usePropostaResolver,
  useColaboradorResolver,
  useTarefaResolver,
  usePlanejamentoResolver,
} from "@/hooks/useBreadcrumbResolvers";
import { DynamicBreadcrumbItem } from "./DynamicBreadcrumbItem";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  isDynamic?: boolean;
  resolvedLabel?: string;
  isLoading?: boolean;
}

// Mapeamento de segmentos de rota para tipos de recursos
const resourceTypeMap: Record<string, string> = {
  "clients": "cliente",
  "clientes": "cliente",
  "projetos": "projeto",
  "projects": "projeto",
  "roteiro-ia": "roteiro",
  "contratos": "contrato",
  "contracts": "contrato",
  "produtos": "produto",
  "products": "produto",
  "orcamentos": "orcamento",
  "propostas": "proposta",
  "colaboradores": "colaborador",
  "tarefa": "tarefa",
  "tarefas": "tarefa",
  "planejamentos": "planejamento",
  "planejamento": "planejamento",
};

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
  "/grs/agenda": { label: "Agenda", icon: "CalendarDays" },
  "/grs/agenda-especialistas": { label: "Agenda Especialistas", icon: "Users" },
  "/grs/mensagens": { label: "Mensagens", icon: "MessageSquare" },
  "/grs/clientes": { label: "Clientes GRS", icon: "Users" },
  "/grs/projetos": { label: "Projetos GRS", icon: "FolderOpen" },
  "/grs/nova-ordem": { label: "Nova Ordem", icon: "FilePlus" },
  "/grs/agendamento-social": { label: "Agendamento Social", icon: "Share2" },
  "/grs/planejamento-estrategico": { label: "Planejamento Estratégico", icon: "Target" },
  "/grs/aprovacoes": { label: "Aprovações", icon: "CheckCircle" },
  "/grs/relatorios": { label: "Relatórios", icon: "FileText" },
  "/grs/cliente": { label: "Cliente", icon: "User" },
  
  // CRM
  "/crm": { label: "CRM", icon: "Target" },
  "/crm/contatos": { label: "Contatos", icon: "Phone" },
  "/crm/historico": { label: "Histórico", icon: "History" },
  
  // Atendimento
  "/atendimento": { label: "Atendimento", icon: "Headphones" },
  "/atendimento/inbox": { label: "Inbox", icon: "Inbox" },
  "/atendimento/dashboard": { label: "Dashboard Atendimento", icon: "LayoutDashboard" },
  
  // Clientes
  "/clientes": { label: "Clientes", icon: "Users" },
  "/clientes/projetos": { label: "Projetos", icon: "FolderOpen" },
  "/clients": { label: "Detalhes do Cliente", icon: "User" },
  
  // Client Details (nested routes)
  "/details": { label: "Detalhes", icon: "Info" },
  "/projects": { label: "Projetos", icon: "FolderOpen" },
  "/contracts": { label: "Contratos", icon: "FileSignature" },
  "/finance": { label: "Financeiro", icon: "DollarSign" },
  "/files": { label: "Arquivos", icon: "FileText" },
  "/timeline": { label: "Timeline", icon: "History" },
  "/contacts": { label: "Contatos", icon: "Phone" },
  "/notes": { label: "Notas", icon: "StickyNote" },
  "/requests": { label: "Solicitações", icon: "MessageSquare" },
  "/social-integrations": { label: "Redes Sociais", icon: "Share2" },
  
  // Financeiro
  "/financeiro": { label: "Financeiro", icon: "DollarSign" },
  "/gestao/dashboard": { label: "Dashboard Financeiro", icon: "TrendingUp" },
  "/financeiro/gestao-contas": { label: "Gestão de Contas", icon: "Wallet" },
  "/financeiro/caixa-bancos": { label: "Caixa & Bancos", icon: "Landmark" },
  "/financeiro/relatorios": { label: "Relatórios", icon: "FileText" },
  "/financeiro/conciliacao": { label: "Conciliação", icon: "CheckCircle" },
  "/financeiro/centros-custo": { label: "Centros de Custo", icon: "FolderTree" },
  "/financeiro/folha": { label: "Folha de Pagamento", icon: "Wallet" },
  "/financeiro/balancete": { label: "Balancete Contábil", icon: "FileSpreadsheet" },
  "/financeiro/balanco-patrimonial": { label: "Balanço Patrimonial", icon: "Scale" },
  "/financeiro/lucratividade-projetos": { label: "Lucratividade Projetos", icon: "TrendingUp" },
  "/financeiro/categorias": { label: "Categorias", icon: "Tags" },
  
  // Admin
  "/admin": { label: "Admin", icon: "Shield" },
  "/admin/painel": { label: "Painel", icon: "LayoutDashboard" },
  "/admin/contratos": { label: "Contratos", icon: "FileSignature" },
  "/admin/contratos/novo": { label: "Novo Contrato", icon: "FilePlus" },
  "/admin/produtos": { label: "Produtos", icon: "Package" },
  "/admin/performance-test": { label: "Testes de Performance", icon: "Gauge" },
  "/admin/security-monitoring": { label: "Monitoramento de Segurança", icon: "Shield" },
  "/admin/produtos/novo": { label: "Novo Produto", icon: "PackagePlus" },
  "/admin/tarefas": { label: "Tarefas", icon: "ClipboardCheck" },
  "/admin/onboarding": { label: "Onboarding", icon: "ClipboardCheck" },
  "/admin/usuarios": { label: "Usuários", icon: "Users" },
  "/admin/logs": { label: "Logs do Sistema", icon: "FileText" },
  "/admin/notificacoes": { label: "Central de Notificações", icon: "Bell" },
  "/admin/system-health": { label: "Saúde do Sistema", icon: "Activity" },
  "/admin/configuracoes-empresa": { label: "Configurações da Empresa", icon: "Building" },
  "/admin/templates": { label: "Templates de Contrato", icon: "FileText" },
  "/admin/templates/novo": { label: "Novo Template", icon: "FilePlus" },
  "/admin/homologacao": { label: "Homologação MVP", icon: "CheckSquare" },
  
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
  "/audiovisual/minhas-tarefas": { label: "Minhas Tarefas", icon: "User" },
  "/audiovisual/captacoes": { label: "Captações", icon: "Camera" },
  "/audiovisual/projetos": { label: "Projetos", icon: "Film" },
  "/audiovisual/equipamentos": { label: "Equipamentos", icon: "Clapperboard" },
  
  // Administrativo
  "/administrativo": { label: "Administrativo", icon: "Briefcase" },
  "/administrativo/dashboard": { label: "Dashboard", icon: "LayoutDashboard" },
  "/administrativo/orcamentos": { label: "Orçamentos", icon: "Calculator" },
  "/administrativo/propostas": { label: "Propostas", icon: "FileText" },
  
  // Cliente Portal
  "/cliente": { label: "Portal do Cliente", icon: "User" },
  "/cliente/painel": { label: "Painel", icon: "LayoutDashboard" },
  "/cliente/painel-v2": { label: "Painel V2", icon: "LayoutDashboard" },
  "/cliente/projetos": { label: "Meus Projetos", icon: "FolderOpen" },
  "/cliente/planejamento-visual": { label: "Planejamento Visual", icon: "Eye" },
  "/cliente/aprovacoes": { label: "Aprovações", icon: "CheckCircle" },
  "/cliente/tarefas": { label: "Tarefas", icon: "CheckSquare" },
  "/cliente/timeline": { label: "Timeline", icon: "History" },
  "/cliente/perfil": { label: "Perfil", icon: "User" },
  "/cliente/editar": { label: "Editar Perfil", icon: "Edit" },
  "/cliente/planos": { label: "Planos", icon: "Package" },
  "/cliente/exportacoes": { label: "Exportações", icon: "Download" },
  "/cliente/social-analytics": { label: "Analytics Social", icon: "BarChart3" },
  
  // RH
  "/rh": { label: "Recursos Humanos", icon: "Users" },
  "/rh/colaboradores": { label: "Colaboradores", icon: "Users" },
  "/rh/folha-ponto": { label: "Folha de Ponto", icon: "Clock" },
  "/rh/pessoas": { label: "Pessoas", icon: "UserCircle" },
  "/rh/ponto": { label: "Ponto", icon: "Timer" },
  
  // Tráfego
  "/trafego": { label: "Tráfego", icon: "TrendingUp" },
  "/trafego/dashboard": { label: "Dashboard Tráfego", icon: "LayoutDashboard" },
  
  // Fornecedores
  "/fornecedores": { label: "Fornecedores", icon: "Truck" },
  "/fornecedor": { label: "Portal Fornecedor", icon: "Package" },
  "/fornecedor/dashboard": { label: "Dashboard", icon: "LayoutDashboard" },
  
  // Gestão
  "/gestao": { label: "Gestão", icon: "Settings" },
  "/gestor": { label: "Gestor", icon: "UserCog" },
  "/gestor/dashboard": { label: "Dashboard Gestor", icon: "LayoutDashboard" },
  
  // Especialistas
  "/especialistas": { label: "Especialistas", icon: "Users" },
  "/especialista": { label: "Especialista", icon: "UserCircle" },
  "/especialista/dashboard": { label: "Dashboard Especialista", icon: "LayoutDashboard" },
  
  // Gamificação
  "/gamificacao": { label: "Gamificação", icon: "Trophy" },
  "/gamificacao/admin": { label: "Admin Gamificação", icon: "Shield" },
  
  // Inventário
  "/inventario": { label: "Inventário", icon: "Archive" },
  
  // Aprovações
  "/aprovacoes": { label: "Aprovações", icon: "CheckCircle" },
  "/aprovacao-job": { label: "Aprovação de Job", icon: "Briefcase" },
  
  // Outros
  "/calendario": { label: "Calendário", icon: "CalendarDays" },
  "/metas": { label: "Metas", icon: "Target" },
  "/minhas-tarefas": { label: "Minhas Tarefas", icon: "CheckSquare" },
  "/relatorios": { label: "Relatórios", icon: "FileText" },
  "/configuracoes": { label: "Configurações", icon: "Settings" },
  "/configuracoes/funcoes": { label: "Funções", icon: "UserCog" },
  "/configuracoes/monitor": { label: "Monitor", icon: "Monitor" },
  "/perfil": { label: "Perfil", icon: "User" },
  "/planos": { label: "Planos", icon: "Package" },
  "/style-guide": { label: "Guia de Estilo", icon: "Palette" },
  "/toast-demo": { label: "Demo de Toasts", icon: "Bell" },
  "/design-system": { label: "Design System", icon: "Component" },
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
    let previousSegment = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Detectar IDs (UUIDs ou números)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      const isNumeric = /^\d+$/.test(segment);
      
      if (isUUID || isNumeric) {
        // Este é um ID - marcar como dinâmico e associar ao tipo de recurso
        const resourceType = resourceTypeMap[previousSegment];
        
        items.push({
          label: segment,
          path: currentPath,
          isDynamic: true,
          resolvedLabel: undefined, // Será resolvido pelo componente
          isLoading: true,
        });
        
        // Armazenar metadata para o componente saber que tipo de recurso é
        (items[items.length - 1] as any).resourceType = resourceType;
        (items[items.length - 1] as any).resourceId = segment;
      } else {
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
      }
      
      previousSegment = segment;
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
        const isDynamic = (item as any).isDynamic;
        const resourceType = (item as any).resourceType;
        const resourceId = (item as any).resourceId;

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
            
            {isDynamic ? (
              <DynamicBreadcrumbItem
                resourceType={resourceType}
                resourceId={resourceId}
                path={item.path}
                isLast={isLast}
                icon={Icon}
                fallbackLabel={item.label}
              />
            ) : isLast ? (
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
