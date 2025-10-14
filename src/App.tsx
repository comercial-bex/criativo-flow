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
import { PWADebugPanel } from "@/components/PWADebugPanel";


import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Core pages
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";

// Inicio pages
import InicioFavoritos from "./pages/Inicio/Favoritos";
import InicioRecentes from "./pages/Inicio/Recentes";

// Inteligencia pages
import Inteligencia from "./pages/Inteligencia";
import InteligenciaAnalises from "./pages/Inteligencia/Analises";
import InteligenciaInsights from "./pages/Inteligencia/Insights";
import InteligenciaPrevisoes from "./pages/Inteligencia/Previsoes";
import InteligenciaMetricas from "./pages/Inteligencia/Metricas";
import CategoriasFinanceiras from "./pages/CategoriasFinanceiras";
import ProdutosFinanceiro from "./pages/Financeiro/Produtos";
import ProdutoHistorico from "./pages/Financeiro/ProdutoHistorico";
import Configuracoes from "./pages/Configuracoes";
import Funcoes from "./pages/Configuracoes/Funcoes";
import Monitor from "./pages/Configuracoes/Monitor";
import Perfil from "./pages/Perfil";
import Relatorios from "./pages/Relatorios";
import Planos from "./pages/Planos";
import Especialistas from "./pages/Especialistas";

// Role-specific pages
import GRSDashboard from "./pages/GRS/Dashboard";
import GRSPainel from "./pages/GRS/Painel";
import GRSPlanejamentos from "./pages/GRS/Planejamentos";
import GRSRelatorios from "./pages/GRS/Relatorios";
import GRSAgendamentoSocial from "./pages/GRS/AgendamentoSocial";
import GRSPlanejamentoDetalhes from "./pages/GRS/PlanejamentoDetalhes";
import GRSPlanejamentoEstrategico from "./pages/GRS/PlanejamentoEstrategico";
import GRSCalendarioEditorial from "./pages/GRS/CalendarioEditorial";
import GRSAprovacoes from "./pages/GRS/Aprovacoes";
import GRSClienteProjetos from "./pages/GRS/ClienteProjetosFluxo";
import GRSClientes from "./pages/GRS/Clientes";
import GRSProjetoTarefas from "./pages/GRS/ProjetoTarefasKanban";
import GRSProjetos from "./pages/GRS/Projetos";
import GRSNovaOrdem from "./pages/GRS/NovaOrdem";
import CRMContatos from "./pages/CRM/Contatos";
import CRMHistorico from "./pages/CRM/Historico";
import AdminLogs from "./pages/Admin/Logs";
import AtendimentoInbox from "./pages/Atendimento/Inbox";
import AtendimentoDashboard from "./pages/Atendimento/Dashboard";
import TrafegoDashboard from "./pages/Trafego/Dashboard";
import FinanceiroDashboard from "./pages/Financeiro/Dashboard";
import FornecedorDashboard from "./pages/Fornecedor/Dashboard";
import GestorDashboard from "./pages/Gestor/Dashboard";
import MinhasTarefas from "./pages/MinhasTarefas";
import GestaoDashboard from "./pages/Gestao/Dashboard";
import TarefasUnificadasGRS from "./pages/GRS/TarefasUnificadas";
import RoteiroIAListPage from "./pages/GRS/RoteiroIA/index";
import NovoRoteiroPage from "./pages/GRS/RoteiroIA/NovoRoteiro";
import EditarRoteiroPage from "./pages/GRS/RoteiroIA/EditarRoteiro";
import EspecialistaDashboard from "./pages/Especialista/Dashboard";
import DesignSystemShowcase from "./pages/DesignSystemShowcase";

// Client pages
import ClientePainel from "./pages/Cliente/Painel";
import ClienteProjetos from "./pages/Cliente/Projetos";
import ClienteDetalheProjetos from "./pages/Cliente/DetalheProjetos";
import ClienteProjetoDetalhes from "./pages/Cliente/ProjetoDetalhes";
import ClientePlanejamentoVisual from "./pages/Cliente/PlanejamentoVisual";
import ClienteEditar from "./pages/Cliente/Editar";
import ClientePerfil from "./pages/Cliente/Perfil";
import ClienteAprovacoes from "./pages/Cliente/Aprovacoes";
import ClientePlanos from "./pages/Cliente/Planos";
import ClienteExportacoes from "./pages/Cliente/Exportacoes";
import Preditiva from "./pages/Inteligencia/Preditiva";

// Administrative pages
import AdminDashboard from "./pages/Administrativo/Dashboard";
import Orcamentos from "./pages/Administrativo/Orcamentos";
import Propostas from "./pages/Administrativo/Propostas";
import Contratos from "./pages/Admin/Contratos";
import ContratoForm from "./pages/Admin/ContratoForm";
import ContratoDetails from "./pages/Admin/ContratoDetails";
import ApresentacaoRelatorio from "./pages/ApresentacaoRelatorio";
import ContractTemplates from "./pages/Admin/ContractTemplates";
import ContractTemplateForm from "./pages/Admin/ContractTemplateForm";
import OrcamentoDetails from "./pages/Admin/OrcamentoDetails";
import PropostaDetails from "./pages/Admin/PropostaDetails";
import PropostaView from "./pages/Public/PropostaView";
import Produtos from "./pages/Admin/Produtos";
import ProdutoForm from "./components/Admin/ProdutoForm";
import ProdutoDetails from "./pages/Admin/ProdutoDetails";
import HomologacaoMVP from "./pages/Admin/HomologacaoMVP";

// Audiovisual pages
import AudiovisualDashboard from "./pages/Audiovisual/Dashboard";
import AudiovisualCaptacoes from "./pages/Audiovisual/Captacoes";
import AudiovisualProjetos from "./pages/Audiovisual/Projetos";
import AudiovisualEquipamentos from "./pages/Audiovisual/Equipamentos";
import TarefasUnificadasAudiovisual from "./pages/Audiovisual/TarefasUnificadas";
import AudiovisualMinhasTarefas from "./pages/Audiovisual/MinhasTarefas";

// Design pages
import DesignDashboard from "./pages/Design/Dashboard";
import DesignCalendario from "./pages/Design/Calendario";
import DesignMetas from "./pages/Design/Metas";
import DesignBiblioteca from "./pages/Design/Biblioteca";
import DesignAprovacoes from "./pages/Design/Aprovacoes";
import TarefasUnificadasDesign from "./pages/Design/TarefasUnificadas";
import DesignMinhasTarefas from "./pages/Design/MinhasTarefas";
import Gamificacao from "./pages/Gamificacao";
import GamificacaoAdmin from "./pages/GamificacaoAdmin";
import StyleGuide from "./pages/StyleGuide";


// RH pages
import Colaboradores from "./pages/RH/Colaboradores";
import ColaboradorDetalhes from "./pages/RH/ColaboradorDetalhes";
import FolhaPonto from "./pages/RH/FolhaPonto";
import FolhaPagamento from "./pages/Financeiro/FolhaPagamento";
import Pessoas from "./pages/RH/Pessoas";
import Ponto from "./pages/RH/Ponto";
import BalanceteContabil from "./pages/Financeiro/BalanceteContabil";
import Calendario from "./pages/Calendario";
import Inventario from "./pages/Inventario";

// Access control pages
import AccessRejectedPage from "./pages/AccessRejectedPage";
import AccessSuspendedPage from "./pages/AccessSuspendedPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { PendingApprovalPage } from "./components/PendingApprovalPage";

import AprovacaoJob from "./pages/AprovacaoJob";
import AdminPainel from "./pages/Admin/Painel";
import AdminTarefas from "./pages/Admin/Tarefas";
import CentralNotificacoes from "./pages/Admin/CentralNotificacoes";
import ClienteTarefas from "./pages/Cliente/Tarefas";
import ClienteTimeline from "./pages/Cliente/Timeline";
import GRSAgenda from "./pages/GRS/Agenda";
import GRSMensagens from "./pages/GRS/Mensagens";
import Aprovacoes from "./pages/Aprovacoes";
import Usuarios from "./pages/Usuarios";
import SystemHealth from "./pages/Admin/SystemHealth";
import BalancoPatrimonial from "./pages/Financeiro/BalancoPatrimonial";

// Client Details Pages
import ClientDetails from "./pages/ClientDetails";
import TimelinePage from "./pages/ClientDetails/TimelinePage";
import DetailsPage from "./pages/ClientDetails/DetailsPage";
import ContactsPage from "./pages/ClientDetails/ContactsPage";
import ProjectsPage from "./pages/ClientDetails/ProjectsPage";
import FilesPage from "./pages/ClientDetails/FilesPage";
import RequestsPage from "./pages/ClientDetails/RequestsPage";
import ContractsPage from "./pages/ClientDetails/ContractsPage";
import FinancePage from "./pages/ClientDetails/FinancePage";
import NotesPage from "./pages/ClientDetails/NotesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos (otimizado para PWA)
      gcTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // ✅ Ativar para PWA
      refetchOnMount: false,
      retry: 2, // 2 tentativas
      networkMode: 'offlineFirst' as const, // ✅ Suporte offline
    },
    mutations: {
      retry: 2,
      networkMode: 'offlineFirst' as const, // ✅ Suporte offline
      onSuccess: () => {},
    },
  },
});

function App() {
  // Move PublicRoute inside App component so it has access to AuthProvider context
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }
    
    if (user) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        forcedTheme="dark"
        disableTransitionOnChange
      >
        <BexThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWADebugPanel />
            <BrowserRouter>
              <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/apresentacao/:link_hash" element={<ApresentacaoRelatorio />} />

                {/* Smart redirect for root path */}
                <Route path="/" element={<SmartRedirect />} />

                {/* Unauthorized access */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes with permissions */}
                <Route path="/dashboard" element={
                  <ProtectedRoute module="dashboard">
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/crm" element={
                  <ProtectedRoute module="crm">
                    <Layout><CRM /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/clientes" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><Clientes /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Client Details Routes (nested) */}
                <Route path="/clients/:clientId" element={
                  <ProtectedRoute module="financeiro">
                    <Layout>
                      <ClientDetails />
                    </Layout>
                  </ProtectedRoute>
                }>
                  <Route path="details" element={<DetailsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="contracts" element={<ContractsPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                </Route>
                
                <Route path="/categorias-financeiras" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><CategoriasFinanceiras /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/financeiro/produtos" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><ProdutosFinanceiro /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/financeiro/produtos/:id/historico" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><ProdutoHistorico /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/planos" element={
                  <ProtectedRoute module="planos">
                    <Layout><Planos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/configuracoes" element={
                  <ProtectedRoute module="configuracoes">
                    <Layout><Configuracoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/configuracoes/funcoes" element={
                  <ProtectedRoute module="configuracoes" action="canEdit" requiredRole="admin">
                    <Layout><Funcoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/configuracoes/monitor" element={
                  <ProtectedRoute module="configuracoes" requiredRole="admin">
                    <Layout><Monitor /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <Layout><Perfil /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/relatorios" element={
                  <ProtectedRoute module="relatorios">
                    <Layout><Relatorios /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/especialistas" element={
                  <ProtectedRoute module="especialistas">
                    <Layout><Especialistas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/gamificacao" element={
                  <ProtectedRoute>
                    <Layout><Gamificacao /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/gamificacao/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><GamificacaoAdmin /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/style-guide" element={
                  <ProtectedRoute>
                    <Layout><StyleGuide /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventario" element={
                  <ProtectedRoute module="inventario">
                    <Layout><Inventario /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia" element={
                  <ProtectedRoute module="inteligencia">
                    <Layout><Inteligencia /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Agenda Unificada */}
                <Route path="/agenda" element={
                  <ProtectedRoute>
                    <Layout><GRSAgenda /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* GRS routes */}
                <Route path="/grs" element={<Navigate to="/grs/painel" replace />} />
                
                <Route path="/grs/dashboard" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/painel" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSPainel /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/planejamentos" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/planejamento/:id" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentoDetalhes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/cliente" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSClientes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/cliente/:clienteId/planejamentos" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/cliente/:clienteId/projetos" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSClienteProjetos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/cliente/:clienteId/projeto/:projetoId/tarefas" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSProjetoTarefas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/cliente/:clienteId/nova-ordem" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSNovaOrdem /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/:clienteId/projetos" element={
                  <ProtectedRoute>
                    <Layout><ClienteProjetos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/:clienteId/planejamento-visual/:projetoId" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanejamentoVisual /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/planejamento-estrategico" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSPlanejamentoEstrategico /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/calendario-editorial" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSCalendarioEditorial /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/aprovacoes" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSAprovacoes /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/grs/relatorios" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSRelatorios /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/minhas-tarefas" element={
                  <ProtectedRoute>
                    <Layout><MinhasTarefas /></Layout>
                  </ProtectedRoute>
                } />

                {/* Inicio Routes */}
                <Route path="/inicio/favoritos" element={
                  <ProtectedRoute>
                    <Layout><InicioFavoritos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inicio/recentes" element={
                  <ProtectedRoute>
                    <Layout><InicioRecentes /></Layout>
                  </ProtectedRoute>
                } />

                {/* Inteligencia Routes */}
                <Route path="/inteligencia" element={
                  <ProtectedRoute>
                    <Layout><Inteligencia /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia/preditiva" element={
                  <ProtectedRoute allowedRoles={['admin', 'gestor', 'grs']}>
                    <Layout><Preditiva /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia/analises" element={
                  <ProtectedRoute>
                    <Layout><InteligenciaAnalises /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia/insights" element={
                  <ProtectedRoute>
                    <Layout><InteligenciaInsights /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia/previsoes" element={
                  <ProtectedRoute>
                    <Layout><InteligenciaPrevisoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inteligencia/metricas" element={
                  <ProtectedRoute>
                    <Layout><InteligenciaMetricas /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/grs/agendamento-social" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSAgendamentoSocial /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/grs/projeto/:projetoId/tarefas" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSProjetoTarefas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/projetos" element={
                  <ProtectedRoute requiredRole="grs" module="grs" action="canView">
                    <Layout><GRSDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/meus-projetos" element={<Navigate to="/grs/painel" replace />} />
                
                {/* CRM routes */}
                <Route path="/crm/contatos" element={
                  <ProtectedRoute module="crm">
                    <Layout><CRMContatos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/crm/historico" element={
                  <ProtectedRoute module="crm">
                    <Layout><CRMHistorico /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Especialista routes */}
                <Route path="/especialista/dashboard" element={
                  <ProtectedRoute>
                    <Layout><EspecialistaDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Gestão & Finanças routes */}
                <Route path="/gestao/dashboard" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><GestaoDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Administrative routes */}
                <Route path="/administrativo/dashboard" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/administrativo/orcamentos" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><Orcamentos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/administrativo/propostas" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><Propostas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><Contratos /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Templates DEVEM vir ANTES de /admin/contratos/:id */}
                <Route path="/admin/contratos/templates" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContractTemplates /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/templates/new" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContractTemplateForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/templates/:templateId" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContractTemplateForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/new" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/:id" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContratoDetails /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/:id/edit" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/orcamentos/:id" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><OrcamentoDetails /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/propostas/:id" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><PropostaDetails /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/produtos" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><Produtos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/produtos/new" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ProdutoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/produtos/:id" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ProdutoDetails /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/produtos/:id/edit" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ProdutoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/homologacao-mvp" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><HomologacaoMVP /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/logs" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><AdminLogs /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Design System Showcase */}
                <Route path="/design-system" element={
                  <ProtectedRoute>
                    <Layout><DesignSystemShowcase /></Layout>
                  </ProtectedRoute>
                } />
                
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
                <Route path="/audiovisual/dashboard" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualDashboard /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                {/* Redirecionar /audiovisual/tarefas para /audiovisual/minhas-tarefas */}
                <Route path="/audiovisual/tarefas" element={
                  <Navigate to="/audiovisual/minhas-tarefas" replace />
                } />
                
                <Route path="/audiovisual/minhas-tarefas" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualMinhasTarefas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/audiovisual/projetos" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualProjetos /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/audiovisual/captacoes" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="audiovisual">
                      <Layout><AudiovisualCaptacoes /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                {/* Redirecionar equipamentos antigos para inventário */}
                <Route path="/audiovisual/equipamentos" element={
                  <Navigate to="/inventario" replace />
                } />
                
                {/* Design routes (protected by SpecialistGuard) */}
                <Route path="/design/dashboard" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignDashboard /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                {/* Redirecionar /design/tarefas para /design/minhas-tarefas */}
                <Route path="/design/tarefas" element={
                  <Navigate to="/design/minhas-tarefas" replace />
                } />
                
                <Route path="/design/minhas-tarefas" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignMinhasTarefas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/design/biblioteca" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignBiblioteca /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/design/calendario" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignCalendario /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/design/metas" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignMetas /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                <Route path="/design/aprovacoes" element={
                  <SpecialistGuard>
                    <ProtectedRoute module="design">
                      <Layout><DesignAprovacoes /></Layout>
                    </ProtectedRoute>
                  </SpecialistGuard>
                } />
                
                {/* Calendário Multidisciplinar */}
                <Route path="/calendario" element={
                  <ProtectedRoute 
                    allowedRoles={['admin', 'gestor', 'grs', 'filmmaker', 'designer']}
                  >
                    <Layout><Calendario /></Layout>
                  </ProtectedRoute>
                } />

                {/* Inventário */}
                <Route path="/inventario" element={
                  <ProtectedRoute module="inventario">
                    <Layout><Inventario /></Layout>
                  </ProtectedRoute>
                } />


                {/* Client routes */}
                <Route path="/cliente/painel" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePainel /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/perfil" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePerfil /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/clientes/:clienteId/editar" element={
                  <ProtectedRoute module="clientes">
                    <Layout><ClienteEditar /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/projetos" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteProjetos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/projeto-detalhes/:id" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteProjetoDetalhes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/detalhe-projetos" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteDetalheProjetos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/planejamento-visual" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanejamentoVisual /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/tarefas" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteTarefas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/aprovacoes" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteAprovacoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/planos" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClientePlanos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/exportacoes" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteExportacoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/cliente/timeline" element={
                  <ProtectedRoute requiredRole="cliente">
                    <Layout><ClienteTimeline /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* GRS integrated routes (formerly Atendimento) */}
                <Route path="/grs/inbox" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><AtendimentoInbox /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/tarefas" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><TarefasUnificadasGRS /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/grs/roteiro-ia" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><RoteiroIAListPage /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/roteiro-ia/novo" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><NovoRoteiroPage /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/roteiro-ia/:id" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><EditarRoteiroPage /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/grs/agenda" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSAgenda /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/grs/mensagens" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSMensagens /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/aprovacoes" element={
                  <ProtectedRoute allowedRoles={['admin', 'gestor', 'grs']}>
                    <Layout><Aprovacoes /></Layout>
                  </ProtectedRoute>
                } />

                {/* Legacy redirects */}
                <Route path="/atendimento/inbox" element={<Navigate to="/grs/inbox" replace />} />
                <Route path="/atendimento/dashboard" element={<Navigate to="/grs/dashboard" replace />} />

                {/* Trafego routes */}
                <Route path="/trafego/dashboard" element={
                  <ProtectedRoute requiredRole="trafego">
                    <Layout><TrafegoDashboard /></Layout>
                  </ProtectedRoute>
                } />

                {/* Financeiro routes */}
                <Route path="/financeiro/dashboard" element={
                  <ProtectedRoute requiredRole="financeiro">
                    <Layout><FinanceiroDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* RH routes */}
                <Route path="/rh/pessoas" element={
                  <ProtectedRoute module="rh" action="canView">
                    <Layout><Pessoas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/rh/ocorrencias" element={
                  <ProtectedRoute module="rh" action="canView">
                    <Layout><Ponto /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* DEPRECATED: Rotas legadas com redirecionamento automático */}
                <Route path="/rh/colaboradores" element={
                  <>
                    <DeprecatedRouteRedirect />
                    <ProtectedRoute module="rh" action="canView">
                      <Layout><Colaboradores /></Layout>
                    </ProtectedRoute>
                  </>
                } />
                
                <Route path="/rh/colaboradores/:id" element={
                  <>
                    <DeprecatedRouteRedirect />
                    <ProtectedRoute module="rh" action="canView">
                      <Layout><ColaboradorDetalhes /></Layout>
                    </ProtectedRoute>
                  </>
                } />
                
                <Route path="/rh/ponto" element={
                  <ProtectedRoute module="rh" action="canView">
                    <Layout><FolhaPonto /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/financeiro/folha" element={
                  <ProtectedRoute module="rh" action="canView">
                    <Layout><FolhaPagamento /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/rh/balancete" element={
                  <ProtectedRoute module="rh" action="canView">
                    <Layout><BalanceteContabil /></Layout>
                  </ProtectedRoute>
                } />

                {/* Fornecedor routes */}
                <Route path="/fornecedor/dashboard" element={
                  <ProtectedRoute requiredRole="fornecedor">
                    <Layout><FornecedorDashboard /></Layout>
                  </ProtectedRoute>
                } />

                {/* Gestor routes */}
                <Route path="/gestor/dashboard" element={
                  <ProtectedRoute requiredRole="gestor">
                    <Layout><GestorDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/aprovacao-job" element={
                  <ProtectedRoute>
                    <Layout><AprovacaoJob /></Layout>
                  </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin/painel" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><AdminPainel /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/tarefas" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><AdminTarefas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/central-notificacoes" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><CentralNotificacoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/system-health" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout><SystemHealth /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/usuarios" element={
                  <ProtectedRoute module="configuracoes" action="canEdit" requiredRole="admin">
                    <Layout><Usuarios /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/financeiro/balanco-patrimonial" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><BalancoPatrimonial /></Layout>
                  </ProtectedRoute>
                } />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
        </BexThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;