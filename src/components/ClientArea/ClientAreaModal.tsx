import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  Clock, 
  Info, 
  Users, 
  FolderOpen, 
  FileText, 
  FileCheck, 
  FileSignature, 
  DollarSign 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TimelineTab } from "./TimelineTab";
import { DetalhesTab } from "./DetalhesTab";
import { UsuariosTab } from "./UsuariosTab";
import { ProjetosTab } from "./ProjetosTab";
import { ArquivosTab } from "./ArquivosTab";
import { SolicitacoesTab } from "./SolicitacoesTab";
import { ContratosTab } from "./ContratosTab";
import { FinanceiroTab } from "./FinanceiroTab";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  avatar_url?: string;
}

interface ClientAreaModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente;
  projetoId?: string;
}

const RBAC_TAB_CONFIG = {
  timeline: ['admin', 'gestor', 'grs', 'atendimento', 'designer', 'filmmaker'],
  detalhes: ['admin', 'gestor', 'atendimento'],
  usuarios: ['admin', 'gestor'],
  projetos: ['admin', 'gestor'],
  arquivos: ['admin', 'gestor', 'grs', 'designer', 'filmmaker'],
  solicitacoes: ['admin', 'gestor'],
  contratos: ['admin', 'gestor'],
  financeiro: ['admin', 'gestor'],
} as const;

export function ClientAreaModal({ 
  open, 
  onClose, 
  cliente, 
  projetoId 
}: ClientAreaModalProps) {
  const { role } = usePermissions();

  const canViewTab = (tabKey: keyof typeof RBAC_TAB_CONFIG) => {
    if (!role) return false;
    return RBAC_TAB_CONFIG[tabKey].includes(role as any);
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Left Sidebar - Client Summary */}
          <div className="w-72 border-r bg-muted/30 p-6 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={cliente.avatar_url} />
                <AvatarFallback className="text-lg">
                  {getInitials(cliente.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="font-semibold text-lg">{cliente.nome}</h2>
                {cliente.status && (
                  <Badge variant="outline" className="mt-2">
                    {cliente.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 text-sm">
              {cliente.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium truncate">{cliente.email}</p>
                </div>
              )}
              {cliente.telefone && (
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area with Tabs */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
              <div className="border-b px-6 pt-4">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                  {canViewTab('timeline') && (
                    <TabsTrigger value="timeline" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Linha do tempo
                    </TabsTrigger>
                  )}
                  {canViewTab('detalhes') && (
                    <TabsTrigger value="detalhes" className="gap-2">
                      <Info className="h-4 w-4" />
                      Detalhes
                    </TabsTrigger>
                  )}
                  {canViewTab('usuarios') && (
                    <TabsTrigger value="usuarios" className="gap-2">
                      <Users className="h-4 w-4" />
                      Usuários
                    </TabsTrigger>
                  )}
                  {canViewTab('projetos') && (
                    <TabsTrigger value="projetos" className="gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Projetos
                    </TabsTrigger>
                  )}
                  {canViewTab('arquivos') && (
                    <TabsTrigger value="arquivos" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Arquivos
                    </TabsTrigger>
                  )}
                  {canViewTab('solicitacoes') && (
                    <TabsTrigger value="solicitacoes" className="gap-2">
                      <FileCheck className="h-4 w-4" />
                      Solicitações
                    </TabsTrigger>
                  )}
                  {canViewTab('contratos') && (
                    <TabsTrigger value="contratos" className="gap-2">
                      <FileSignature className="h-4 w-4" />
                      Contratos
                    </TabsTrigger>
                  )}
                  {canViewTab('financeiro') && (
                    <TabsTrigger value="financeiro" className="gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financeiro
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                {canViewTab('timeline') && (
                  <TabsContent value="timeline" className="m-0" forceMount>
                    <TimelineTab clienteId={cliente.id} projetoId={projetoId} />
                  </TabsContent>
                )}
                {canViewTab('detalhes') && (
                  <TabsContent value="detalhes" className="m-0" forceMount>
                    <DetalhesTab clienteId={cliente.id} projetoId={projetoId} />
                  </TabsContent>
                )}
                {canViewTab('usuarios') && (
                  <TabsContent value="usuarios" className="m-0" forceMount>
                    <UsuariosTab clienteId={cliente.id} />
                  </TabsContent>
                )}
                {canViewTab('projetos') && (
                  <TabsContent value="projetos" className="m-0" forceMount>
                    <ProjetosTab clienteId={cliente.id} />
                  </TabsContent>
                )}
                {canViewTab('arquivos') && (
                  <TabsContent value="arquivos" className="m-0" forceMount>
                    <ArquivosTab clienteId={cliente.id} projetoId={projetoId} />
                  </TabsContent>
                )}
                {canViewTab('solicitacoes') && (
                  <TabsContent value="solicitacoes" className="m-0" forceMount>
                    <SolicitacoesTab clienteId={cliente.id} />
                  </TabsContent>
                )}
                {canViewTab('contratos') && (
                  <TabsContent value="contratos" className="m-0" forceMount>
                    <ContratosTab clienteId={cliente.id} />
                  </TabsContent>
                )}
                {canViewTab('financeiro') && (
                  <TabsContent value="financeiro" className="m-0" forceMount>
                    <FinanceiroTab clienteId={cliente.id} />
                  </TabsContent>
                )}
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
