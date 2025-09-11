import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import CategoriasFinanceiras from "./pages/CategoriasFinanceiras";
import NotFound from "./pages/NotFound";

// Páginas específicas por perfil
import GRSDashboard from "./pages/GRS/Dashboard";
import AtendimentoInbox from "./pages/Atendimento/Inbox";
import ClientePainel from "./pages/Cliente/Painel";
import ClienteProjetos from "./pages/Cliente/Projetos";
import DetalheProjetos from "./pages/Cliente/DetalheProjetos";
import ClienteCadastro from "./pages/Cliente/Cadastro";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";


import AprovacaoJob from "./pages/AprovacaoJob";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/crm" element={
              <ProtectedRoute>
                <Layout>
                  <CRM />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes/projetos" element={
              <ProtectedRoute>
                <Layout>
                  <ClienteProjetos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId/detalhes" element={
              <ProtectedRoute>
                <Layout>
                  <DetalheProjetos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes/cadastro" element={
              <ProtectedRoute>
                <Layout>
                  <ClienteCadastro />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Layout>
                  <Financeiro />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro/categorias" element={
              <ProtectedRoute>
                <Layout>
                  <CategoriasFinanceiras />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Rotas específicas por perfil */}
            <Route path="/planejamentos" element={
              <ProtectedRoute>
                <Layout>
                  <GRSDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <Layout>
                  <AtendimentoInbox />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cliente-painel" element={
              <ProtectedRoute>
                <Layout>
                  <ClientePainel />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Novas rotas */}
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout>
                  <Configuracoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Layout>
                  <Relatorios />
                </Layout>
            </ProtectedRoute>
            } />
            
            <Route path="/aprovacao" element={
              <ProtectedRoute>
                <Layout>
                  <AprovacaoJob />
                </Layout>
              </ProtectedRoute>
            } />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
