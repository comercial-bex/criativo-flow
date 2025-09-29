import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Users, Edit, Trash2, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status: string;
  assinatura_id?: string;
  logo_url?: string;
}

interface ClientCardProps {
  cliente: Cliente;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onOnboarding: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getAssinaturaNome: (id?: string) => string;
  clienteTemAssinatura: (cliente: Cliente) => boolean;
}

export function ClientCard({ 
  cliente, 
  onEdit, 
  onDelete, 
  onView,
  onOnboarding,
  getStatusColor,
  getStatusText,
  getAssinaturaNome,
  clienteTemAssinatura
}: ClientCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const hasContactInfo = cliente.email || cliente.telefone || cliente.endereco;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-16 w-16 shrink-0 ring-2 ring-background shadow-sm">
              {cliente.logo_url ? (
                <AvatarImage 
                  src={cliente.logo_url} 
                  alt={`Logo ${cliente.nome}`}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(cliente.nome)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground truncate mb-1">
                {cliente.nome}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {getAssinaturaNome(cliente.assinatura_id)}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(cliente.status)} text-xs font-medium shrink-0`}>
            {getStatusText(cliente.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Contact Info */}
        <div className="space-y-3 mb-6 flex-1">
          {hasContactInfo ? (
            <>
              {cliente.email && (
                <div className="flex items-center text-sm text-muted-foreground group">
                  <Mail className="h-4 w-4 mr-3 shrink-0 text-primary/60" />
                  <span className="truncate group-hover:text-foreground transition-colors">
                    {cliente.email}
                  </span>
                </div>
              )}
              {cliente.telefone && (
                <div className="flex items-center text-sm text-muted-foreground group">
                  <Phone className="h-4 w-4 mr-3 shrink-0 text-primary/60" />
                  <span className="truncate group-hover:text-foreground transition-colors">
                    {cliente.telefone}
                  </span>
                </div>
              )}
              {cliente.endereco && (
                <div className="flex items-center text-sm text-muted-foreground group">
                  <MapPin className="h-4 w-4 mr-3 shrink-0 text-primary/60" />
                  <span className="text-xs leading-relaxed group-hover:text-foreground transition-colors">
                    {cliente.endereco}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-muted-foreground/25 rounded-lg">
              🔒 Dados pessoais protegidos
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant={clienteTemAssinatura(cliente) ? "default" : "secondary"}
            size="sm"
            onClick={onOnboarding}
            disabled={!clienteTemAssinatura(cliente)}
            title={!clienteTemAssinatura(cliente) ? 'Cliente precisa ter uma assinatura para acessar o onboarding' : ''}
            className="w-full h-10 text-sm font-medium"
          >
            <Users className="h-4 w-4 mr-2" />
            {clienteTemAssinatura(cliente) ? "Onboarding" : "Sem Plano"}
          </Button>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView}
              className="h-9 px-2"
              title="Visualizar detalhes"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="h-9 px-2"
              title="Editar cliente"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  title="Excluir cliente"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}