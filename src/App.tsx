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


import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Core pages
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import CategoriasFinanceiras from "./pages/CategoriasFinanceiras";
import Configuracoes from "./pages/Configuracoes";
import Funcoes from "./pages/Configuracoes/Funcoes";
import Perfil from "./pages/Perfil";
import Relatorios from "./pages/Relatorios";
import Planos from "./pages/Planos";
import Especialistas from "./pages/Especialistas";

// Role-specific pages
import GRSDashboard from "./pages/GRS/Dashboard";
import GRSPlanejamentos from "./pages/GRS/Planejamentos";
import GRSRelatorios from "./pages/GRS/Relatorios";
import GRSAgendamentoSocial from "./pages/GRS/AgendamentoSocial";
import GRSPlanejamentoDetalhes from "./pages/GRS/PlanejamentoDetalhes";
import GRSPlanejamentoEstrategico from "./pages/GRS/PlanejamentoEstrategico";
import GRSCalendarioEditorial from "./pages/GRS/CalendarioEditorial";
import GRSAprovacoes from "./pages/GRS/Aprovacoes";
import GRSClienteProjetos from "./pages/GRS/ClienteProjetosFluxo";
import GRSProjetoTarefas from "./pages/GRS/ProjetoTarefasKanban";
import AtendimentoInbox from "./pages/Atendimento/Inbox";
import AtendimentoDashboard from "./pages/Atendimento/Dashboard";
import TrafegoDashboard from "./pages/Trafego/Dashboard";
import FinanceiroDashboard from "./pages/Financeiro/Dashboard";
import FornecedorDashboard from "./pages/Fornecedor/Dashboard";
import GestorDashboard from "./pages/Gestor/Dashboard";
import MinhasTarefas from "./pages/MinhasTarefas";
import TarefasUnificadasGRS from "./pages/GRS/TarefasUnificadas";
import TarefasUnificadasDesign from "./pages/Design/TarefasUnificadas";
import EspecialistaDashboard from "./pages/Especialista/Dashboard";
import TarefasUnificadasAudiovisual from "./pages/Audiovisual/TarefasUnificadas";

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

// Administrative pages
import AdminDashboard from "./pages/Administrativo/Dashboard";
import Orcamentos from "./pages/Administrativo/Orcamentos";
import Propostas from "./pages/Administrativo/Propostas";
import Contratos from "./pages/Admin/Contratos";
import ContratoForm from "./pages/Admin/ContratoForm";

// Audiovisual pages
import AudiovisualDashboard from "./pages/Audiovisual/Dashboard";
import AudiovisualCaptacoes from "./pages/Audiovisual/Captacoes";
import AudiovisualProjetos from "./pages/Audiovisual/Projetos";
import AudiovisualEquipamentos from "./pages/Audiovisual/Equipamentos";

// Design pages
import DesignDashboard from "./pages/Design/Dashboard";
import DesignKanban from "./pages/Design/Kanban";
import DesignCalendario from "./pages/Design/Calendario";
import DesignMetas from "./pages/Design/Metas";
import DesignBiblioteca from "./pages/Design/Biblioteca";
import DesignAprovacoes from "./pages/Design/Aprovacoes";
import Gamificacao from "./pages/Gamificacao";
import GamificacaoAdmin from "./pages/GamificacaoAdmin";

import AprovacaoJob from "./pages/AprovacaoJob";
import AdminPainel from "./pages/Admin/Painel";
import AdminTarefas from "./pages/Admin/Tarefas";
import ClienteTarefas from "./pages/Cliente/Tarefas";
import IntelligenceDashboard from "./components/IntelligenceDashboard";
import GRSAgenda from "./pages/GRS/Agenda";
import Aprovacoes from "./pages/Aprovacoes";

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
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 0,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
    mutations: {
      // Evitar invalidação global automática
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
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

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
                  <ProtectedRoute module="clientes">
                    <Layout><Clientes /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Client Details Routes (nested) */}
                <Route path="/clients/:clientId" element={
                  <ProtectedRoute module="clientes">
                    <Layout><ClientDetails /></Layout>
                  </ProtectedRoute>
                }>
                  <Route index element={<TimelinePage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="details" element={<DetailsPage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="contracts" element={<ContractsPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="notes" element={<NotesPage />} />
                </Route>
                
                <Route path="/financeiro" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><Financeiro /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/categorias-financeiras" element={
                  <ProtectedRoute module="financeiro">
                    <Layout><CategoriasFinanceiras /></Layout>
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
                
                <Route path="/inteligencia" element={
                  <ProtectedRoute module="inteligencia">
                    <Layout><IntelligenceDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* GRS routes */}
                <Route path="/grs/dashboard" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSDashboard /></Layout>
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
                
                {/* Especialista routes */}
                <Route path="/especialista/dashboard" element={
                  <ProtectedRoute>
                    <Layout><EspecialistaDashboard /></Layout>
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
                
                <Route path="/admin/contratos/new" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/contratos/:id" element={
                  <ProtectedRoute module="administrativo">
                    <Layout><ContratoForm /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Audiovisual routes */}
                <Route path="/audiovisual/dashboard" element={
                  <ProtectedRoute module="audiovisual">
                    <Layout><AudiovisualDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/audiovisual/tarefas" element={
                  <ProtectedRoute module="audiovisual">
                    <Layout><TarefasUnificadasAudiovisual /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/audiovisual/projetos" element={
                  <ProtectedRoute module="audiovisual">
                    <Layout><AudiovisualProjetos /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/audiovisual/captacoes" element={
                  <ProtectedRoute module="audiovisual">
                    <Layout><AudiovisualCaptacoes /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/audiovisual/equipamentos" element={
                  <ProtectedRoute module="audiovisual">
                    <Layout><AudiovisualEquipamentos /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Design routes */}
                <Route path="/design/dashboard" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/tarefas" element={
                  <ProtectedRoute module="design">
                    <Layout><TarefasUnificadasDesign /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/biblioteca" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignBiblioteca /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/kanban" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignKanban /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/calendario" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignCalendario /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/metas" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignMetas /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/design/aprovacoes" element={
                  <ProtectedRoute module="design">
                    <Layout><DesignAprovacoes /></Layout>
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

                <Route path="/grs/agenda" element={
                  <ProtectedRoute requiredRole="grs">
                    <Layout><GRSAgenda /></Layout>
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

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;