import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Building2, 
  CreditCard,
  FileText,
  Edit,
  Users
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status: string;
  assinatura_id?: string;
  logo_url?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj_cpf?: string;
  situacao_cadastral?: string;
  cnae_principal?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onEdit: () => void;
  onOnboarding: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getAssinaturaNome: (id?: string) => string;
  clienteTemAssinatura: (cliente: Cliente) => boolean;
}

export function ClientViewModal({
  isOpen,
  onClose,
  cliente,
  onEdit,
  onOnboarding,
  getStatusColor,
  getStatusText,
  getAssinaturaNome,
  clienteTemAssinatura
}: ClientViewModalProps) {
  if (!cliente) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const hasContactInfo = cliente.email || cliente.telefone || cliente.endereco;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
              {cliente.logo_url ? (
                <AvatarImage 
                  src={cliente.logo_url} 
                  alt={`Logo ${cliente.nome}`}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(cliente.nome)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{cliente.nome}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getStatusColor(cliente.status)} text-xs`}>
                  {getStatusText(cliente.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getAssinaturaNome(cliente.assinatura_id)}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="flex gap-3">
            <Button onClick={onEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Editar Cliente
            </Button>
            <Button
              variant={clienteTemAssinatura(cliente) ? "default" : "secondary"}
              onClick={onOnboarding}
              disabled={!clienteTemAssinatura(cliente)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Onboarding
            </Button>
          </div>

          <Separator />

          {/* Informações da Empresa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informações da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cliente.razao_social && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                  <p className="text-sm">{cliente.razao_social}</p>
                </div>
              )}
              
              {cliente.nome_fantasia && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                  <p className="text-sm">{cliente.nome_fantasia}</p>
                </div>
              )}
              
              {cliente.cnpj_cpf && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNPJ/CPF</label>
                  <p className="text-sm font-mono">{cliente.cnpj_cpf}</p>
                </div>
              )}
              
              {cliente.situacao_cadastral && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Situação Cadastral</label>
                  <p className="text-sm">{cliente.situacao_cadastral}</p>
                </div>
              )}
              
              {cliente.cnae_principal && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">CNAE Principal</label>
                  <p className="text-sm">{cliente.cnae_principal}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações de Contato
            </h3>
            
            {hasContactInfo ? (
              <div className="space-y-3">
                {cliente.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary/60" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{cliente.email}</p>
                    </div>
                  </div>
                )}
                
                {cliente.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary/60" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-sm">{cliente.telefone}</p>
                    </div>
                  </div>
                )}
                
                {cliente.endereco && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary/60 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <p className="text-sm leading-relaxed">{cliente.endereco}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  🔒 Dados de contato protegidos ou não disponíveis
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Informações do Sistema */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Informações do Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-primary/60" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assinatura</label>
                  <p className="text-sm">{getAssinaturaNome(cliente.assinatura_id)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary/60" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                  <p className="text-sm">{formatDate(cliente.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}