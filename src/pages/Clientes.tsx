import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientData, type Cliente } from '@/hooks/useClientData';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OnboardingForm } from '@/components/OnboardingForm';
import { MobileClientCard } from '@/components/MobileClientCard';
import { ClientCard } from '@/components/ClientCard';
import { ClientViewModal } from '@/components/ClientViewModal';
import { ClientTableView } from '@/components/ClientTableView';
import { CreateClientUserForm } from '@/components/CreateClientUserForm';
import { ClientLogoUpload } from '@/components/ClientLogoUpload';
import { InteractiveGuideButton } from '@/components/InteractiveGuideButton';
import { CnpjSearch } from '@/components/CnpjSearch';
import type { CnpjData } from '@/hooks/useCnpjLookup';
import { CredentialsModal } from '@/components/CredentialsModal';
import { useDeviceType } from '@/hooks/useDeviceType';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

// Extended form data interface with additional address fields
interface FormData extends Partial<Cliente> {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
}

const Clientes = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const { 
    clientes, 
    loading, 
    error: clientesError, 
    fetchClientes, 
    createCliente, 
    deleteCliente 
  } = useClientData();
  
  // Add ref to track if component is mounted
  const mountedRef = useRef(true);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', senha: '', nomeCliente: '' });
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    return (localStorage.getItem('clientsViewMode') as 'card' | 'list') || 'card';
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    razao_social: "",
    nome_fantasia: "",
    email: "",
    telefone: "",
    cnpj_cpf: "",
    situacao_cadastral: "",
    cnae_principal: "",
    endereco: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    status: "ativo",
    assinatura_id: "",
    email_login: "",
    senha_temporaria: "",
    criar_conta: true,
    status_conta: "ativo",
    logo_url: ""
  });
  const { toast: toastHook } = useToast();

  useEffect(() => {
    fetchAssinaturas();
    
    // Cleanup function to mark component as unmounted and close all dialogs
    return () => {
      mountedRef.current = false;
      // Close all dialogs/modals when component unmounts
      setShowForm(false);
      setShowOnboarding(false);
      setShowViewModal(false);
      setShowCredentials(false);
      setSelectedCliente(null);
    };
  }, []);

  // Função para criar usuário específico da Agência Bex
  const createAgenciaBexUser = async () => {
    if (!mountedRef.current) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: 'comercial@agenciabex.com.br',
          password: 'TempPass2024!',
          nome: 'Comercial Agência Bex',
          cliente_id: '8c4482fc-4aa1-422c-b1fc-6441c14b6d6a',
          role: 'cliente'
        }
      });

      if (!mountedRef.current) return;

      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast.error(`Erro ao criar usuário: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success('✅ Usuário comercial@agenciabex.com.br criado com sucesso!');
        toast.info(`🔑 Senha: TempPass2024!`);
      } else {
        toast.error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      if (mountedRef.current) {
        toast.error('Erro na requisição');
      }
    }
  };

  const fetchAssinaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setAssinaturas(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const clienteData = {
        nome: formData.nome!,
        email: formData.email || null,
        telefone: formData.telefone || null,
        cnpj_cpf: formData.cnpj_cpf || null,
        endereco: formData.endereco || null,
        status: formData.status! as 'ativo' | 'inativo' | 'pendente' | 'arquivado',
        assinatura_id: (formData.assinatura_id && formData.assinatura_id !== 'none') ? formData.assinatura_id : undefined
      };

      const { data: novoCliente, error } = await createCliente(clienteData);

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast.error('Erro ao criar cliente');
        return;
      }

      // Se deve criar conta de acesso
      if (formData.criar_conta && formData.email_login && novoCliente) {
        try {
          const { data: userData, error: userError } = await supabase.functions.invoke('create-client-user', {
            body: {
              email: formData.email_login,
              password: formData.senha_temporaria,
              nome: formData.nome,
              cliente_id: novoCliente.id,
              role: 'cliente'
            }
          });

          // Check if component is still mounted before updating state
          if (!mountedRef.current) return;

          if (userError) {
            console.error('Erro ao criar usuário:', userError);
            toast.error('Cliente criado, mas houve erro ao criar conta de acesso');
          } else {
            // Mostrar credenciais em modal
            setCredentials({
              email: formData.email_login,
              senha: formData.senha_temporaria!,
              nomeCliente: formData.nome!
            });
            setShowCredentials(true);
          }
        } catch (userError) {
          console.error('Erro ao criar conta:', userError);
          if (mountedRef.current) {
            toast.error('Cliente criado, mas houve erro ao criar conta de acesso');
          }
        }
      } else {
        if (mountedRef.current) {
          toast.success("Cliente cadastrado com sucesso!");
        }
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    }
  };

  // Função para gerar senha aleatória
  const gerarSenha = () => {
    const chars = 'ABCDEFGH23456789';
    return Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // Gerar senha automaticamente quando componente carrega
  useEffect(() => {
    if (!formData.senha_temporaria) {
      setFormData(prev => ({ ...prev, senha_temporaria: gerarSenha() }));
    }
  }, []);

  const resetForm = () => {
    if (!mountedRef.current) return;
    
    setFormData({
      nome: "",
      razao_social: "",
      nome_fantasia: "",
      email: "",
      telefone: "",
      cnpj_cpf: "",
      situacao_cadastral: "",
      cnae_principal: "",
      endereco: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      status: "ativo",
      assinatura_id: "",
      email_login: "",
      senha_temporaria: gerarSenha(),
      criar_conta: true,
      status_conta: "ativo",
      logo_url: ""
    });
    setShowForm(false);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'card' ? 'list' : 'card';
    setViewMode(newMode);
    localStorage.setItem('clientsViewMode', newMode);
  };

  const handleViewCliente = (cliente: Cliente) => {
    if (!mountedRef.current) return;
    setSelectedCliente(cliente);
    setShowViewModal(true);
  };

  const handleEditFromView = () => {
    if (!mountedRef.current) return;
    setShowViewModal(false);
    if (selectedCliente) {
      setFormData({
        ...selectedCliente,
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        email_login: selectedCliente.email || "",
        senha_temporaria: gerarSenha(),
        criar_conta: false,
        status_conta: "ativo"
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro ao excluir cliente');
        return;
      }

      toast.success("Cliente removido com sucesso!");
      await fetchClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleOnboarding = (cliente: Cliente) => {
    if (!clienteTemAssinatura(cliente)) {
      toast.error('Cliente precisa ter uma assinatura para acessar o onboarding');
      return;
    }
    setSelectedCliente(cliente);
    setShowOnboarding(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'arquivado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'pendente': return 'Pendente';
      case 'arquivado': return 'Arquivado';
      default: return status;
    }
  };

  const getAssinaturaNome = (assinaturaId?: string) => {
    if (!assinaturaId) return 'Sem assinatura';
    const assinatura = assinaturas.find(a => a.id === assinaturaId);
    return assinatura ? assinatura.nome : 'Plano não encontrado';
  };

  const clienteTemAssinatura = (cliente: Cliente) => {
    return cliente.assinatura_id && assinaturas.some(a => a.id === cliente.assinatura_id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4 space-y-6' : 'p-6 space-y-8'}`}>
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Clientes"
          description={isMobile ? "Gerencie seus clientes" : "Gerencie informações e relacionamentos com clientes"}
          icon={Users}
          action={{
            label: isMobile ? "Novo" : "Novo Cliente",
            onClick: () => setShowForm(true),
            icon: Plus
          }}
        />
        <InteractiveGuideButton />
      </div>

      {/* Filtros e Busca - Mobile Optimized */}
      <div className={`flex flex-col gap-4 ${isMobile ? 'space-y-3' : 'sm:flex-row'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isMobile ? "Buscar clientes..." : "Pesquisar por nome, empresa ou email..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isMobile ? 'h-12 text-base' : ''}`}
            data-intro="clientes-search"
          />
        </div>
        <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className={isMobile ? 'h-12' : 'w-48'}>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Mais Recentes</SelectItem>
              <SelectItem value="nome">Nome A-Z</SelectItem>
              <SelectItem value="empresa">Empresa A-Z</SelectItem>
              <SelectItem value="projetos">Mais Projetos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={toggleViewMode} className={isMobile ? 'h-12' : ''}>
            {viewMode === 'card' ? (
              <>
                <List className="h-4 w-4 mr-2" />
                Lista
              </>
            ) : (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cartões
              </>
            )}
          </Button>
          <Button variant="outline" className={isMobile ? 'h-12' : ''}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            onClick={createAgenciaBexUser} 
            className={`${isMobile ? 'h-12' : ''} bg-green-500 hover:bg-green-600 text-white`}
          >
            <Users className="h-4 w-4 mr-2" />
            {isMobile ? 'Criar Bex' : 'Criar Usuário Bex'}
          </Button>
        </div>
      </div>

      {/* Formulário de Cadastro - Mobile Optimized */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`${isMobile ? "max-h-[90vh] overflow-y-auto" : "sm:max-w-[800px] max-h-[90vh] overflow-y-auto"}`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CNPJ e Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Dados da Empresa</h3>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ (Consulta Automática) *</Label>
                <CnpjSearch
                  initialValue={formData.cnpj_cpf}
                  onCnpjData={(data) => {
                    setFormData({
                      ...formData,
                      cnpj_cpf: data.cnpj,
                      razao_social: data.razao_social || formData.razao_social,
                      nome_fantasia: data.nome_fantasia || formData.nome_fantasia,
                      nome: data.nome_fantasia || data.razao_social || formData.nome,
                      situacao_cadastral: data.situacao_cadastral || formData.situacao_cadastral,
                      cnae_principal: data.cnae_principal || formData.cnae_principal,
                      endereco: data.endereco ? 
                        `${data.endereco.logradouro || ''} ${data.endereco.numero || ''}, ${data.endereco.bairro || ''} - ${data.endereco.municipio || ''}/${data.endereco.uf || ''} - CEP: ${data.endereco.cep || ''}`.trim() 
                        : formData.endereco,
                      logradouro: data.endereco?.logradouro || formData.logradouro,
                      numero: data.endereco?.numero || formData.numero,
                      bairro: data.endereco?.bairro || formData.bairro,
                      cidade: data.endereco?.municipio || formData.cidade,
                      uf: data.endereco?.uf || formData.uf,
                      cep: data.endereco?.cep || formData.cep
                    });
                  }}
                />
              </div>

              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.razao_social ? "bg-muted/30" : ""}`}
                    placeholder="Preenchido automaticamente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.nome_fantasia ? "bg-muted/30" : ""}`}
                    placeholder="Preenchido automaticamente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome de Exibição no Sistema *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={isMobile ? "h-12 text-base" : ""}
                  placeholder="Nome usado no sistema"
                  required
                />
              </div>

              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="situacao_cadastral">Situação Cadastral</Label>
                  <Input
                    id="situacao_cadastral"
                    value={formData.situacao_cadastral}
                    className={`${isMobile ? "h-12 text-base" : ""} bg-muted/50`}
                    readOnly
                    placeholder="Preenchido automaticamente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnae_principal">CNAE Principal</Label>
                  <Input
                    id="cnae_principal"
                    value={formData.cnae_principal}
                    className={`${isMobile ? "h-12 text-base" : ""} bg-muted/50`}
                    readOnly
                    placeholder="Preenchido automaticamente"
                  />
                </div>
              </div>
            </div>

            {/* Logo da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Logo da Empresa</h3>
              <ClientLogoUpload
                currentLogo={formData.logo_url}
                clientName={formData.nome || "Novo Cliente"}
                onLogoChange={(logoUrl) => setFormData({ ...formData, logo_url: logoUrl || "" })}
                size="lg"
              />
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Contato</h3>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={isMobile ? "h-12 text-base" : ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className={isMobile ? "h-12 text-base" : ""}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Endereço</h3>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <div className={`space-y-2 ${isMobile ? 'col-span-1' : 'col-span-2'}`}>
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.logradouro ? "bg-muted/30" : ""}`}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.numero ? "bg-muted/30" : ""}`}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className={isMobile ? "h-12 text-base" : ""}
                    placeholder="Sala, Apto, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.bairro ? "bg-muted/30" : ""}`}
                    placeholder="Centro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.cep ? "bg-muted/30" : ""}`}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <div className={`space-y-2 ${isMobile ? 'col-span-1' : 'col-span-2'}`}>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.cidade ? "bg-muted/30" : ""}`}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.uf}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                    className={`${isMobile ? "h-12 text-base" : ""} ${formData.uf ? "bg-muted/30" : ""}`}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className={`${isMobile ? "h-12 text-base" : ""} bg-muted/30`}
                  placeholder="Endereço completo (preenchido automaticamente)"
                />
              </div>
            </div>

            {/* Configurações do Sistema */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Configurações do Sistema</h3>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'ativo' | 'inativo' | 'pendente' | 'arquivado' })}
                  >
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assinatura">Plano de Assinatura</Label>
                  <Select 
                    value={formData.assinatura_id || 'none'} 
                    onValueChange={(value) => setFormData({ ...formData, assinatura_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem assinatura</SelectItem>
                      {assinaturas.map((assinatura) => (
                        <SelectItem key={assinatura.id} value={assinatura.id}>
                          {assinatura.nome} - R$ {assinatura.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Credenciais de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Credenciais de Acesso ao Sistema</h3>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="space-y-2">
                    <Label htmlFor="email_login">Email de Login</Label>
                    <Input
                      id="email_login"
                      type="email"
                      value={formData.email_login}
                      onChange={(e) => setFormData({ ...formData, email_login: e.target.value })}
                      className={isMobile ? "h-12 text-base" : ""}
                      placeholder="Email para acesso ao sistema"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="senha_temporaria">Senha Temporária</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, senha_temporaria: gerarSenha() })}
                      >
                        Gerar Nova
                      </Button>
                    </div>
                    <Input
                      id="senha_temporaria"
                      value={formData.senha_temporaria}
                      onChange={(e) => setFormData({ ...formData, senha_temporaria: e.target.value })}
                      className={isMobile ? "h-12 text-base" : ""}
                      placeholder="Senha gerada automaticamente"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="criar_conta"
                      checked={formData.criar_conta}
                      onChange={(e) => setFormData({ ...formData, criar_conta: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="criar_conta" className="text-sm">
                      Criar conta de acesso ao sistema
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_conta">Status da Conta</Label>
                    <Select 
                      value={formData.status_conta} 
                      onValueChange={(value) => setFormData({ ...formData, status_conta: value })}
                    >
                      <SelectTrigger className={isMobile ? "h-12" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
            </div>

            <div className={`flex gap-2 pt-4 ${isMobile ? 'flex-col' : ''}`}>
              <Button type="submit" className={isMobile ? "h-12 text-base" : ""}>
                Cadastrar
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className={isMobile ? "h-12 text-base" : ""}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Clientes ou Lista - Responsive */}
      {viewMode === 'list' ? (
        <ClientTableView
          clientes={filteredClientes}
          onEdit={(cliente) => navigate(`/clientes/${cliente.id}/editar`)}
          onDelete={(cliente) => handleDelete(cliente.id)}
          onView={handleViewCliente}
          onOnboarding={handleOnboarding}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          getAssinaturaNome={getAssinaturaNome}
          clienteTemAssinatura={clienteTemAssinatura}
        />
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredClientes.map((cliente) => (
            isMobile ? (
              <MobileClientCard
                key={cliente.id}
                cliente={cliente}
                onEdit={() => navigate(`/clientes/${cliente.id}/editar`)}
                onDelete={() => handleDelete(cliente.id)}
                onOnboarding={() => handleOnboarding(cliente)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getAssinaturaNome={getAssinaturaNome}
                clienteTemAssinatura={clienteTemAssinatura}
              />
            ) : (
              <ClientCard
                key={cliente.id}
                cliente={cliente}
                onEdit={() => navigate(`/clientes/${cliente.id}/editar`)}
                onDelete={() => handleDelete(cliente.id)}
                onView={() => handleViewCliente(cliente)}
                onOnboarding={() => handleOnboarding(cliente)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getAssinaturaNome={getAssinaturaNome}
                clienteTemAssinatura={clienteTemAssinatura}
              />
            )
          ))}
        </div>
      )}

      {filteredClientes.length === 0 && clientes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seus primeiros clientes
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Visualização */}
      <ClientViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        onEdit={handleEditFromView}
        onOnboarding={() => {
          setShowViewModal(false);
          if (selectedCliente) {
            handleOnboarding(selectedCliente);
          }
        }}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getAssinaturaNome={getAssinaturaNome}
        clienteTemAssinatura={clienteTemAssinatura}
      />

      {/* Modal de Credenciais */}
      <CredentialsModal
        open={showCredentials}
        onOpenChange={setShowCredentials}
        email={credentials.email}
        senha={credentials.senha}
        nomeCliente={credentials.nomeCliente}
      />

      {/* Modal de Onboarding */}
      {selectedCliente && (
        <OnboardingForm
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            setSelectedCliente(null);
          }}
          clienteId={selectedCliente.id}
          cliente={{
            nome: selectedCliente.nome,
            email: selectedCliente.email,
            telefone: selectedCliente.telefone,
            endereco: selectedCliente.endereco
          }}
        />
      )}
    </div>
  );
};

export default Clientes;