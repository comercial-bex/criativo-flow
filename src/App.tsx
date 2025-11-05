import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SmartRedirect } from "@/components/SmartRedirect";
import { SpecialistGuard } from "@/components/SpecialistGuard";
import { DeprecatedRouteRedirect } from "@/components/DeprecatedRouteRedirect";
import { BexThemeProvider } from "@/contexts/BexThemeContext";
import { Suspense, lazy, useEffect } from "react";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logWebVitals } from "@/lib/web-vitals";
import { analytics } from "@/lib/analytics";
import { TeamChatWidget } from "@/components/TeamChat/TeamChatWidget";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Critical pages (loaded immediately)
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AuthCallback from "./pages/AuthCallback";

// Lazy-loaded pages (code-splitting)
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CRM = lazy(() => import("./pages/CRM"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const InicioFavoritos = lazy(() => import("./pages/Inicio/Favoritos"));
const InicioRecentes = lazy(() => import("./pages/Inicio/Recentes"));
const Inteligencia = lazy(() => import("./pages/Inteligencia"));
const InteligenciaAnalises = lazy(() => import("./pages/Inteligencia/Analises"));
const InteligenciaInsights = lazy(() => import("./pages/Inteligencia/Insights"));
const InteligenciaPrevisoes = lazy(() => import("./pages/Inteligencia/Previsoes"));
const InteligenciaMetricas = lazy(() => import("./pages/Inteligencia/Metricas"));
const CategoriasFinanceiras = lazy(() => import("./pages/CategoriasFinanceiras"));
const ProdutosFinanceiro = lazy(() => import("./pages/Financeiro/Produtos"));
const ProdutoHistorico = lazy(() => import("./pages/Financeiro/ProdutoHistorico"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Funcoes = lazy(() => import("./pages/Configuracoes/Funcoes"));
const Monitor = lazy(() => import("./pages/Configuracoes/Monitor"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Planos = lazy(() => import("./pages/Planos"));
const Especialistas = lazy(() => import("./pages/Especialistas"));
const GRSDashboard = lazy(() => import("./pages/GRS/Dashboard"));
const GRSPainel = lazy(() => import("./pages/GRS/Painel"));
const GRSPlanejamentos = lazy(() => import("./pages/GRS/Planejamentos"));
const GRSRelatorios = lazy(() => import("./pages/GRS/Relatorios"));
const GRSAgendamentoSocial = lazy(() => import("./pages/GRS/AgendamentoSocial"));
const GRSPlanejamentoDetalhes = lazy(() => import("./pages/GRS/PlanejamentoDetalhes"));
const GRSPlanejamentoEstrategico = lazy(() => import("./pages/GRS/PlanejamentoEstrategico"));
const GRSCalendarioEditorial = lazy(() => import("./pages/GRS/CalendarioEditorial"));
const GRSAprovacoes = lazy(() => import("./pages/GRS/Aprovacoes"));
const GRSClienteProjetos = lazy(() => import("./pages/GRS/ClienteProjetosFluxo"));
const GRSClientes = lazy(() => import("./pages/GRS/Clientes"));
const AgendaEspecialistas = lazy(() => import("./pages/GRS/AgendaEspecialistas")); // ✅ SPRINT 4
const GRSProjetoTarefas = lazy(() => import("./pages/GRS/ProjetoTarefasKanban"));
const GRSProjetos = lazy(() => import("./pages/GRS/Projetos"));
const GRSNovaOrdem = lazy(() => import("./pages/GRS/NovaOrdem"));
const CRMContatos = lazy(() => import("./pages/CRM/Contatos"));
const CRMHistorico = lazy(() => import("./pages/CRM/Historico"));
const AdminLogs = lazy(() => import("./pages/Admin/Logs"));
const AtendimentoInbox = lazy(() => import("./pages/Atendimento/Inbox"));
const AtendimentoDashboard = lazy(() => import("./pages/Atendimento/Dashboard"));
const TrafegoDashboard = lazy(() => import("./pages/Trafego/Dashboard"));
const FinanceiroDashboard = lazy(() => import("./pages/Financeiro/Dashboard"));
const GestaoContas = lazy(() => import("./pages/Financeiro/GestaoContas"));
const RelatoriosGerenciais = lazy(() => import("./pages/Financeiro/RelatoriosGerenciais"));
const CaixaBancos = lazy(() => import("./pages/Financeiro/CaixaBancos"));
const CentrosCusto = lazy(() => import("./pages/Financeiro/CentrosCusto"));
const Conciliacao = lazy(() => import("./pages/Financeiro/Conciliacao"));
const LucratividadeProjetos = lazy(() => import("./pages/Financeiro/LucratividadeProjetos")); // ✅ SPRINT 3
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const FornecedorDashboard = lazy(() => import("./pages/Fornecedor/Dashboard"));
const GestorDashboard = lazy(() => import("./pages/Gestor/Dashboard"));
const MinhasTarefas = lazy(() => import("./pages/MinhasTarefas"));
const GestaoDashboard = lazy(() => import("./pages/Gestao/Dashboard"));
const TarefasUnificadasGRS = lazy(() => import("./pages/GRS/TarefasUnificadas"));
const RoteiroIAListPage = lazy(() => import("./pages/GRS/RoteiroIA/index"));
const NovoRoteiroPage = lazy(() => import("./pages/GRS/RoteiroIA/NovoRoteiro"));
const EditarRoteiroPage = lazy(() => import("./pages/GRS/RoteiroIA/EditarRoteiro"));
const EspecialistaDashboard = lazy(() => import("./pages/Especialista/Dashboard"));
const DesignSystemShowcase = lazy(() => import("./pages/DesignSystemShowcase"));
const ClientePainel = lazy(() => import("./pages/Cliente/Painel"));
const ClientePainelV2 = lazy(() => import("./pages/Cliente/PainelV2"));
const ClienteProjetos = lazy(() => import("./pages/Cliente/Projetos"));
const ClienteDetalheProjetos = lazy(() => import("./pages/Cliente/DetalheProjetos"));
const ClienteProjetoDetalhes = lazy(() => import("./pages/Cliente/ProjetoDetalhes"));
const ClientePlanejamentoVisual = lazy(() => import("./pages/Cliente/PlanejamentoVisual"));
const ClienteEditar = lazy(() => import("./pages/Cliente/Editar"));
const ClientePerfil = lazy(() => import("./pages/Cliente/Perfil"));
const ClienteAprovacoes = lazy(() => import("./pages/Cliente/Aprovacoes"));
const ClientePlanos = lazy(() => import("./pages/Cliente/Planos"));
const ClienteExportacoes = lazy(() => import("./pages/Cliente/Exportacoes"));
const ClienteProjetoTarefas = lazy(() => import("./pages/Cliente/ProjetoTarefas"));
const ClienteSocialAnalytics = lazy(() => import("./pages/Cliente/SocialAnalytics"));
const Preditiva = lazy(() => import("./pages/Inteligencia/Preditiva"));
const AdminDashboard = lazy(() => import("./pages/Administrativo/Dashboard"));
const Orcamentos = lazy(() => import("./pages/Administrativo/Orcamentos"));
const Propostas = lazy(() => import("./pages/Administrativo/Propostas"));
const Contratos = lazy(() => import("./pages/Admin/Contratos"));
const ContratoForm = lazy(() => import("./pages/Admin/ContratoForm"));
const ContratoDetails = lazy(() => import("./pages/Admin/ContratoDetails"));
const ApresentacaoRelatorio = lazy(() => import("./pages/ApresentacaoRelatorio"));
const ContractTemplates = lazy(() => import("./pages/Admin/ContractTemplates"));
const ContractTemplateForm = lazy(() => import("./pages/Admin/ContractTemplateForm"));
const OrcamentoDetails = lazy(() => import("./pages/Admin/OrcamentoDetails"));
const PropostaDetails = lazy(() => import("./pages/Admin/PropostaDetails"));
const PropostaView = lazy(() => import("./pages/Public/PropostaView"));
const Produtos = lazy(() => import("./pages/Admin/Produtos"));
const ProdutoForm = lazy(() => import("./components/Admin/ProdutoForm"));
const ProdutoDetails = lazy(() => import("./pages/Admin/ProdutoDetails"));
const HomologacaoMVP = lazy(() => import("./pages/Admin/HomologacaoMVP"));
const AudiovisualDashboard = lazy(() => import("./pages/Audiovisual/Dashboard"));
const AudiovisualCaptacoes = lazy(() => import("./pages/Audiovisual/Captacoes"));
const AudiovisualProjetos = lazy(() => import("./pages/Audiovisual/Projetos"));
const AudiovisualEquipamentos = lazy(() => import("./pages/Audiovisual/Equipamentos"));
const TarefasUnificadasAudiovisual = lazy(() => import("./pages/Audiovisual/TarefasUnificadas"));
const AudiovisualMinhasTarefas = lazy(() => import("./pages/Audiovisual/MinhasTarefas"));
const DesignDashboard = lazy(() => import("./pages/Design/Dashboard"));
const DesignCalendario = lazy(() => import("./pages/Design/Calendario"));
const DesignMetas = lazy(() => import("./pages/Design/Metas"));
const DesignBiblioteca = lazy(() => import("./pages/Design/Biblioteca"));
const DesignAprovacoes = lazy(() => import("./pages/Design/Aprovacoes"));
const TarefasUnificadasDesign = lazy(() => import("./pages/Design/TarefasUnificadas"));
const DesignMinhasTarefas = lazy(() => import("./pages/Design/MinhasTarefas"));
const Gamificacao = lazy(() => import("./pages/Gamificacao"));
const GamificacaoAdmin = lazy(() => import("./pages/GamificacaoAdmin"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const Colaboradores = lazy(() => import("./pages/RH/Colaboradores"));
const ColaboradorDetalhes = lazy(() => import("./pages/RH/ColaboradorDetalhes"));
const FolhaPonto = lazy(() => import("./pages/RH/FolhaPonto"));
const FolhaPagamento = lazy(() => import("./pages/Financeiro/FolhaPagamento"));
const Pessoas = lazy(() => import("./pages/RH/Pessoas"));
const Ponto = lazy(() => import("./pages/RH/Ponto"));
const BalanceteContabil = lazy(() => import("./pages/Financeiro/BalanceteContabil"));
const CalendarioUnificado = lazy(() => import("./pages/CalendarioUnificado"));
const Inventario = lazy(() => import("./pages/Inventario"));
const AccessRejectedPage = lazy(() => import("./pages/AccessRejectedPage"));
const AccessSuspendedPage = lazy(() => import("./pages/AccessSuspendedPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const PendingApprovalPage = lazy(() => import("./components/PendingApprovalPage").then(m => ({
  default: m.PendingApprovalPage
})));
const AprovacaoJob = lazy(() => import("./pages/AprovacaoJob"));
const AdminPainel = lazy(() => import("./pages/Admin/Painel"));
const AdminTarefas = lazy(() => import("./pages/Admin/Tarefas"));
const CentralNotificacoes = lazy(() => import("./pages/Admin/CentralNotificacoes"));
const ClienteTarefas = lazy(() => import("./pages/Cliente/Tarefas"));
const ClienteTimeline = lazy(() => import("./pages/Cliente/Timeline"));
const GRSAgenda = lazy(() => import("./pages/GRS/Agenda"));
const GRSMensagens = lazy(() => import("./pages/GRS/Mensagens"));
const Aprovacoes = lazy(() => import("./pages/Aprovacoes"));
const AdminUsuarios = lazy(() => import("./pages/Admin/Usuarios"));
const OnboardingDashboardPage = lazy(() => import("./pages/OnboardingDashboardPage"));
const SystemHealth = lazy(() => import("./pages/Admin/SystemHealth"));
const BalancoPatrimonial = lazy(() => import("./pages/Financeiro/BalancoPatrimonial"));
const ClientDetails = lazy(() => import("./pages/ClientDetails"));
const TimelinePage = lazy(() => import("./pages/ClientDetails/TimelinePage"));
const DetailsPage = lazy(() => import("./pages/ClientDetails/DetailsPage"));
const ContactsPage = lazy(() => import("./pages/ClientDetails/ContactsPage"));
const ProjectsPage = lazy(() => import("./pages/ClientDetails/ProjectsPage"));
const FilesPage = lazy(() => import("./pages/ClientDetails/FilesPage"));
const RequestsPage = lazy(() => import("./pages/ClientDetails/RequestsPage"));
const ContractsPage = lazy(() => import("./pages/ClientDetails/ContractsPage"));
const FinancePage = lazy(() => import("./pages/ClientDetails/FinancePage"));
const NotesPage = lazy(() => import("./pages/ClientDetails/NotesPage"));
const SocialIntegrationsPage = lazy(() => import("./pages/ClientDetails/SocialIntegrationsPage"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      // 10 minutos (otimizado para PWA)
      gcTime: 30 * 60 * 1000,
      // 30 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // ✅ Ativar para PWA
      refetchOnMount: false,
      retry: 2,
      // 2 tentativas
      networkMode: 'offlineFirst' as const // ✅ Suporte offline
    },
    mutations: {
      retry: 2,
      networkMode: 'offlineFirst' as const,
      // ✅ Suporte offline
      onSuccess: () => {}
    }
  }
});

// Defer Web Vitals & Analytics to after mount (non-blocking boot)
const initAnalytics = () => {
  if (import.meta.env.PROD) {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        logWebVitals();
        analytics.trackPageView({
          path: window.location.pathname,
          title: document.title
        });
      });
    } else {
      setTimeout(() => {
        logWebVitals();
        analytics.trackPageView({
          path: window.location.pathname,
          title: document.title
        });
      }, 3000);
    }
  }
};
function App() {
  // Signal React has mounted
  useEffect(() => {
    (window as any).__reactMounted = true;
    initAnalytics();
    // Service Worker cleanup moved to index.html for earlier execution
  }, []);

  // Move PublicRoute inside App component so it has access to AuthProvider context
  const PublicRoute = ({
    children
  }: {
    children: React.ReactNode;
  }) => {
    const {
      user,
      loading
    } = useAuth();
    if (loading) {
      return <FullScreenLoader />;
    }
    if (user) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };
  return <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark" disableTransitionOnChange>
          <BexThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <OfflineIndicator />
              
              <BrowserRouter>
                <AuthProvider>
                  <TeamChatWidget />
                  <Suspense fallback={<FullScreenLoader />}>
                    <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/apresentacao/:link_hash" element={<ApresentacaoRelatorio />} />

                {/* Smart redirect for root path */}
                <Route path="/" element={<SmartRedirect />} />

                {/* Convenience redirects for specialists */}
                <Route path="/grs" element={<Navigate to="/grs/painel" replace />} />
                <Route path="/design" element={<Navigate to="/design/dashboard" replace />} />
                <Route path="/audiovisual" element={<Navigate to="/audiovisual/dashboard" replace />} />
                <Route path="/filmmaker" element={<Navigate to="/audiovisual/dashboard" replace />} />

                {/* Unauthorized access */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes with permissions */}
                <Route path="/dashboard" element={<ProtectedRoute module="dashboard">
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/crm" element={<ProtectedRoute module="crm">
                    <Layout><CRM /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/clientes" element={<ProtectedRoute module="financeiro">
                    <Layout><Clientes /></Layout>
                  </ProtectedRoute>} />
                
                {/* Client Details Routes (nested) */}
                <Route path="/clients/:clientId" element={<ProtectedRoute module="financeiro">
                    <Layout>
                      <ClientDetails />
                    </Layout>
                  </ProtectedRoute>}>
                  <Route path="details" element={<DetailsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="contracts" element={<ContractsPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="social-integrations" element={<SocialIntegrationsPage />} />
                </Route>
                
                <Route path="/categorias-financeiras" element={<ProtectedRoute module="financeiro">
                    <Layout><CategoriasFinanceiras /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/produtos" element={<ProtectedRoute module="financeiro">
                    <Layout><ProdutosFinanceiro /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/produtos/:id/historico" element={<ProtectedRoute module="financeiro">
                    <Layout><ProdutoHistorico /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/planos" element={<ProtectedRoute module="planos">
                    <Layout><Planos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/configuracoes" element={<ProtectedRoute module="configuracoes">
                    <Layout><Configuracoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/configuracoes/funcoes" element={<ProtectedRoute module="configuracoes" action="canEdit" requiredRole="admin">
                    <Layout><Funcoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/configuracoes/monitor" element={<ProtectedRoute module="configuracoes" requiredRole="admin">
                    <Layout><Monitor /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/perfil" element={<ProtectedRoute>
                    <Layout><Perfil /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/relatorios" element={<ProtectedRoute module="relatorios">
                    <Layout><Relatorios /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/especialistas" element={<ProtectedRoute module="especialistas">
                    <Layout><Especialistas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/gamificacao" element={<ProtectedRoute>
                    <Layout><Gamificacao /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/gamificacao/admin" element={<ProtectedRoute requiredRole="admin">
                    <Layout><GamificacaoAdmin /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/style-guide" element={<ProtectedRoute>
                    <Layout><StyleGuide /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inventario" element={<ProtectedRoute module="inventario">
                    <Layout><Inventario /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia" element={<ProtectedRoute module="inteligencia">
                    <Layout><Inteligencia /></Layout>
                  </ProtectedRoute>} />
                
                {/* Agenda Unificada */}
                <Route path="/agenda" element={<ProtectedRoute>
                    <Layout><GRSAgenda /></Layout>
                  </ProtectedRoute>} />
                
                {/* GRS routes */}
                <Route path="/grs" element={<Navigate to="/grs/painel" replace />} />
                
                <Route path="/grs/dashboard" element={<ProtectedRoute requiredRole="grs">
                    <Layout className="px-[71px]"><GRSDashboard /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/painel" element={<ProtectedRoute requiredRole="grs">
                    <Layout className="px-[71px]"><GRSPainel /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/planejamentos" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentos /></Layout>
                  </ProtectedRoute>} />
                
                {/* Redirect /grs/planejamento (sem ID) para lista */}
                <Route path="/grs/planejamento" element={<Navigate to="/grs/planejamentos" replace />} />
                
                <Route path="/grs/planejamento/:id" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentoDetalhes /></Layout>
                  </ProtectedRoute>} />
                
                {/* Alias: /grs/cliente/:clienteId/planejamento/:id */}
                <Route path="/grs/cliente/:clienteId/planejamento/:id" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentoDetalhes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/cliente" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSClientes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/cliente/:clienteId/planejamentos" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/cliente/:clienteId/projetos" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSClienteProjetos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/cliente/:clienteId/projeto/:projetoId/tarefas" element={<ProtectedRoute requiredRole="grs">
                    <Layout className="px-[71px]"><GRSProjetoTarefas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/cliente/:clienteId/nova-ordem" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSNovaOrdem /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/:clienteId/projetos" element={<ProtectedRoute>
                    <Layout><ClienteProjetos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/:clienteId/planejamento-visual/:projetoId" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanejamentoVisual /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/planejamento-estrategico" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentoEstrategico /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/calendario-editorial" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSCalendarioEditorial /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/aprovacoes" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSAprovacoes /></Layout>
                  </ProtectedRoute>} />

                <Route path="/grs/relatorios" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSRelatorios /></Layout>
                  </ProtectedRoute>} />

                <Route path="/minhas-tarefas" element={<ProtectedRoute>
                    <Layout><MinhasTarefas /></Layout>
                  </ProtectedRoute>} />

                {/* Inicio Routes */}
                <Route path="/inicio/favoritos" element={<ProtectedRoute>
                    <Layout><InicioFavoritos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inicio/recentes" element={<ProtectedRoute>
                    <Layout><InicioRecentes /></Layout>
                  </ProtectedRoute>} />

                {/* Inteligencia Routes */}
                <Route path="/inteligencia" element={<ProtectedRoute>
                    <Layout><Inteligencia /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia/preditiva" element={<ProtectedRoute allowedRoles={['admin', 'gestor', 'grs']}>
                    <Layout><Preditiva /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia/analises" element={<ProtectedRoute>
                    <Layout><InteligenciaAnalises /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia/insights" element={<ProtectedRoute>
                    <Layout><InteligenciaInsights /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia/previsoes" element={<ProtectedRoute>
                    <Layout><InteligenciaPrevisoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/inteligencia/metricas" element={<ProtectedRoute>
                    <Layout><InteligenciaMetricas /></Layout>
                  </ProtectedRoute>} />

                <Route path="/grs/agendamento-social" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSAgendamentoSocial /></Layout>
                  </ProtectedRoute>} />

                <Route path="/grs/projeto/:projetoId/tarefas" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSProjetoTarefas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/projetos" element={<ProtectedRoute requiredRole="grs" module="grs" action="canView">
                    <Layout><GRSDashboard /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/meus-projetos" element={<Navigate to="/grs/painel" replace />} />
                
                {/* CRM routes */}
                <Route path="/crm/contatos" element={<ProtectedRoute module="crm">
                    <Layout><CRMContatos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/crm/historico" element={<ProtectedRoute module="crm">
                    <Layout><CRMHistorico /></Layout>
                  </ProtectedRoute>} />
                
                {/* Especialista routes */}
                <Route path="/especialista/dashboard" element={<ProtectedRoute>
                    <Layout><EspecialistaDashboard /></Layout>
                  </ProtectedRoute>} />
                
                {/* Gestão & Finanças routes */}
                <Route path="/gestao/dashboard" element={<ProtectedRoute module="financeiro">
                    <Layout><GestaoDashboard /></Layout>
                  </ProtectedRoute>} />
                
                {/* Administrative routes */}
                <Route path="/administrativo/dashboard" element={<ProtectedRoute module="administrativo">
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/administrativo/orcamentos" element={<ProtectedRoute module="administrativo">
                    <Layout><Orcamentos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/administrativo/propostas" element={<ProtectedRoute module="administrativo">
                    <Layout><Propostas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos" element={<ProtectedRoute module="administrativo">
                    <Layout><Contratos /></Layout>
                  </ProtectedRoute>} />
                
                {/* Templates DEVEM vir ANTES de /admin/contratos/:id */}
                <Route path="/admin/contratos/templates" element={<ProtectedRoute module="administrativo">
                    <Layout><ContractTemplates /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos/templates/new" element={<ProtectedRoute module="administrativo">
                    <Layout><ContractTemplateForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos/templates/:templateId" element={<ProtectedRoute module="administrativo">
                    <Layout><ContractTemplateForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos/new" element={<ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos/:id" element={<ProtectedRoute module="administrativo">
                    <Layout><ContratoDetails /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/contratos/:id/edit" element={<ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/orcamentos/:id" element={<ProtectedRoute module="administrativo">
                    <Layout><OrcamentoDetails /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/propostas/:id" element={<ProtectedRoute module="administrativo">
                    <Layout><PropostaDetails /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/produtos" element={<ProtectedRoute module="administrativo">
                    <Layout><Produtos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/produtos/new" element={<ProtectedRoute module="administrativo">
                    <Layout><ProdutoForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/produtos/:id" element={<ProtectedRoute module="administrativo">
                    <Layout><ProdutoDetails /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/produtos/:id/edit" element={<ProtectedRoute module="administrativo">
                    <Layout><ProdutoForm /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/homologacao-mvp" element={<ProtectedRoute requiredRole="admin">
                    <Layout><HomologacaoMVP /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/logs" element={<ProtectedRoute requiredRole="admin">
                    <Layout><AdminLogs /></Layout>
                  </ProtectedRoute>} />
                
                {/* Design System Showcase */}
                <Route path="/design-system" element={<ProtectedRoute>
                    <Layout><DesignSystemShowcase /></Layout>
                  </ProtectedRoute>} />
                
                {/* Aliases */}
                <Route path="/inicio" element={<Navigate to="/dashboard" replace />} />
                <Route path="/inteligencia/calendario" element={<Navigate to="/calendario" replace />} />
                
                <Route path="/public/proposta/:link_publico" element={<PropostaView />} />
                
                {/* Access Control Routes */}
                <Route path="/aguardando-aprovacao" element={<PendingApprovalPage />} />
                <Route path="/acesso-reprovado" element={<AccessRejectedPage />} />
                <Route path="/acesso-suspenso" element={<AccessSuspendedPage />} />
                <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

                {/* Audiovisual routes (protected by SpecialistGuard) */}
                <Route path="/audiovisual/dashboard" element={<SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualDashboard /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                {/* Redirecionar /audiovisual/tarefas para /audiovisual/minhas-tarefas */}
                <Route path="/audiovisual/tarefas" element={<Navigate to="/audiovisual/minhas-tarefas" replace />} />
                
                <Route path="/audiovisual/minhas-tarefas" element={<SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualMinhasTarefas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/audiovisual/tarefas-unificadas" element={<SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><TarefasUnificadasAudiovisual /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/audiovisual/projetos" element={<SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualProjetos /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/audiovisual/captacoes" element={<SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualCaptacoes /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                {/* Redirecionar equipamentos antigos para inventário */}
                <Route path="/audiovisual/equipamentos" element={<Navigate to="/inventario" replace />} />
                
                {/* Design routes (protected by SpecialistGuard) */}
                <Route path="/design/dashboard" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignDashboard /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                {/* Redirecionar /design/tarefas para /design/minhas-tarefas */}
                <Route path="/design/tarefas" element={<Navigate to="/design/minhas-tarefas" replace />} />
                
                <Route path="/design/minhas-tarefas" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignMinhasTarefas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/design/biblioteca" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignBiblioteca /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/design/calendario" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignCalendario /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/design/metas" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignMetas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                <Route path="/design/aprovacoes" element={<SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout className="px-[71px]"><DesignAprovacoes /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>} />
                
                {/* Calendário Multidisciplinar Unificado */}
                <Route path="/calendario" element={<ProtectedRoute allowedRoles={['admin', 'gestor', 'grs', 'filmmaker', 'designer']}>
                    <Layout className="px-[71px]"><CalendarioUnificado /></Layout>
                  </ProtectedRoute>} />

                {/* Inventário */}
                <Route path="/inventario" element={<ProtectedRoute module="inventario">
                    <Layout><Inventario /></Layout>
                  </ProtectedRoute>} />


                {/* Client routes */}
                <Route path="/cliente/painel" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePainelV2 /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/painel-legacy" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePainel /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/perfil" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePerfil /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/projeto/:projetoId/tarefas" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteProjetoTarefas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/clientes/:clienteId/editar" element={<ProtectedRoute module="clientes">
                    <Layout><ClienteEditar /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/projetos" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteProjetos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/projeto-detalhes/:id" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteProjetoDetalhes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/clientes/:clienteId/social-analytics" element={<ProtectedRoute module="clientes">
                    <Layout><ClienteSocialAnalytics /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/detalhe-projetos" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteDetalheProjetos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/planejamento-visual" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanejamentoVisual /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/tarefas" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteTarefas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/aprovacoes" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteAprovacoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/planos" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/exportacoes" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteExportacoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/cliente/timeline" element={<ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteTimeline /></Layout>
                  </ProtectedRoute>} />
                
                {/* GRS integrated routes (formerly Atendimento) */}
                <Route path="/grs/inbox" element={<ProtectedRoute requiredRole="grs">
                    <Layout><AtendimentoInbox /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/tarefas" element={<ProtectedRoute requiredRole="grs">
                    <Layout className="px-[71px]"><TarefasUnificadasGRS /></Layout>
                  </ProtectedRoute>} />

                <Route path="/grs/roteiro-ia" element={<ProtectedRoute requiredRole="grs">
                    <Layout><RoteiroIAListPage /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/roteiro-ia/novo" element={<ProtectedRoute requiredRole="grs">
                    <Layout><NovoRoteiroPage /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/roteiro-ia/:id" element={<ProtectedRoute requiredRole="grs">
                    <Layout><EditarRoteiroPage /></Layout>
                  </ProtectedRoute>} />

                <Route path="/grs/agenda" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSAgenda /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/grs/mensagens" element={<ProtectedRoute requiredRole="grs">
                    <Layout><GRSMensagens /></Layout>
                  </ProtectedRoute>} />
                
                {/* ✅ SPRINT 4: Agenda de Especialistas com detecção de conflitos */}
                <Route path="/grs/agenda-especialistas" element={<ProtectedRoute requiredRole="grs">
                    <Layout><AgendaEspecialistas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/aprovacoes" element={<ProtectedRoute allowedRoles={['admin', 'gestor', 'grs']}>
                    <Layout><Aprovacoes /></Layout>
                  </ProtectedRoute>} />

                {/* Legacy redirects */}
                <Route path="/atendimento/inbox" element={<Navigate to="/grs/inbox" replace />} />
                <Route path="/atendimento/dashboard" element={<Navigate to="/grs/dashboard" replace />} />

                {/* Trafego routes */}
                <Route path="/trafego/dashboard" element={<ProtectedRoute requiredRole="trafego">
                    <Layout><TrafegoDashboard /></Layout>
                  </ProtectedRoute>} />

                {/* Financeiro routes */}
                <Route path="/financeiro/dashboard" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><FinanceiroDashboard /></Layout>
                  </ProtectedRoute>} />
                
                {/* NEW: Gestão de Contas (unifica Contas a Pagar/Receber, Dívidas, Inadimplência) */}
                <Route path="/financeiro/gestao-contas" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><GestaoContas /></Layout>
                  </ProtectedRoute>} />
                
                {/* NEW: Relatórios Gerenciais (unifica DRE, Custos por Projeto, Fluxo de Caixa) */}
                <Route path="/financeiro/relatorios" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><RelatoriosGerenciais /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/caixa-bancos" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><CaixaBancos /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/centros-custo" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><CentrosCusto /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/conciliacao" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><Conciliacao /></Layout>
                  </ProtectedRoute>} />
                
                {/* ✅ SPRINT 3: Dashboard de Lucratividade de Projetos */}
                <Route path="/financeiro/lucratividade" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><LucratividadeProjetos /></Layout>
                  </ProtectedRoute>} />
                
                {/* Redirects para manter compatibilidade com URLs antigas */}
                <Route path="/financeiro/contas-pagar" element={<Navigate to="/financeiro/gestao-contas?tab=pagar" replace />} />
                <Route path="/financeiro/contas-receber" element={<Navigate to="/financeiro/gestao-contas?tab=receber" replace />} />
                <Route path="/financeiro/gestor-dividas" element={<Navigate to="/financeiro/gestao-contas?tab=dividas" replace />} />
                <Route path="/relatorios/inadimplencia" element={<Navigate to="/financeiro/gestao-contas?tab=inadimplencia" replace />} />
                <Route path="/relatorios/dre" element={<Navigate to="/financeiro/relatorios?tab=dre" replace />} />
                <Route path="/relatorios/custos-projeto" element={<Navigate to="/financeiro/relatorios?tab=custos" replace />} />
                <Route path="/relatorios/fluxo-caixa" element={<Navigate to="/financeiro/relatorios?tab=fluxo" replace />} />
                <Route path="/relatorios/mapa-dividas" element={<Navigate to="/financeiro/gestao-contas?tab=dividas" replace />} />
                
                <Route path="/fornecedores" element={<ProtectedRoute requiredRole="financeiro">
                    <Layout><Fornecedores /></Layout>
                  </ProtectedRoute>} />
                
                {/* RH routes */}
                <Route path="/rh/pessoas" element={<ProtectedRoute module="rh" action="canView">
                    <Layout><Pessoas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/rh/ocorrencias" element={<ProtectedRoute module="rh" action="canView">
                    <Layout><Ponto /></Layout>
                  </ProtectedRoute>} />
                
                {/* DEPRECATED: Rotas legadas com redirecionamento automático */}
                <Route path="/rh/colaboradores" element={<>
                    <DeprecatedRouteRedirect />
                    <ProtectedRoute module="rh" action="canView">
                      <Layout><Colaboradores /></Layout>
                    </ProtectedRoute>
                  </>} />
                
                <Route path="/rh/colaboradores/:id" element={<>
                    <DeprecatedRouteRedirect />
                    <ProtectedRoute module="rh" action="canView">
                      <Layout><ColaboradorDetalhes /></Layout>
                    </ProtectedRoute>
                  </>} />
                
                <Route path="/rh/ponto" element={<ProtectedRoute module="rh" action="canView">
                    <Layout><FolhaPonto /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/folha" element={<ProtectedRoute module="rh" action="canView">
                    <Layout><FolhaPagamento /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/rh/balancete" element={<ProtectedRoute module="rh" action="canView">
                    <Layout><BalanceteContabil /></Layout>
                  </ProtectedRoute>} />

                {/* Fornecedor routes */}
                <Route path="/fornecedor/dashboard" element={<ProtectedRoute requiredRole="fornecedor">
                    <Layout><FornecedorDashboard /></Layout>
                  </ProtectedRoute>} />

                {/* Gestor routes */}
                <Route path="/gestor/dashboard" element={<ProtectedRoute requiredRole="gestor">
                    <Layout><GestorDashboard /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/aprovacao-job" element={<ProtectedRoute>
                    <Layout><AprovacaoJob /></Layout>
                  </ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/painel" element={<ProtectedRoute requiredRole="admin">
                    <Layout><AdminPainel /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/tarefas" element={<ProtectedRoute requiredRole="admin">
                    <Layout><AdminTarefas /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/central-notificacoes" element={<ProtectedRoute requiredRole="admin">
                    <Layout><CentralNotificacoes /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/system-health" element={<ProtectedRoute requiredRole="admin">
                    <Layout><SystemHealth /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/usuarios" element={<Navigate to="/admin/usuarios" replace />} />
                
                <Route path="/admin/usuarios" element={<ProtectedRoute module="configuracoes" action="canEdit" requiredRole="admin">
                    <Layout><AdminUsuarios /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/admin/onboarding" element={<ProtectedRoute module="financeiro" requiredRole="admin">
                    <Layout><OnboardingDashboardPage /></Layout>
                  </ProtectedRoute>} />
                
                <Route path="/financeiro/balanco-patrimonial" element={<ProtectedRoute module="financeiro">
                    <Layout><BalancoPatrimonial /></Layout>
                  </ProtectedRoute>} />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
        </BexThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>;
}
export default App;