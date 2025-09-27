import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status: string;
  assinatura_id?: string;
}

interface MobileClientCardProps {
  cliente: Cliente;
  onEdit: () => void;
  onDelete: () => void;
  onOnboarding: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getAssinaturaNome: (id?: string) => string;
  clienteTemAssinatura: (cliente: Cliente) => boolean;
}

export function MobileClientCard({ 
  cliente, 
  onEdit, 
  onDelete, 
  onOnboarding,
  getStatusColor,
  getStatusText,
  getAssinaturaNome,
  clienteTemAssinatura
}: MobileClientCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {cliente.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate">
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
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          {cliente.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-3 shrink-0" />
              <span className="truncate">{cliente.email}</span>
            </div>
          )}
          {cliente.telefone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-3 shrink-0" />
              <span className="truncate">{cliente.telefone}</span>
            </div>
          )}
          {cliente.endereco && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-3 shrink-0" />
              <span className="text-xs leading-relaxed">{cliente.endereco}</span>
            </div>
          )}
          {!cliente.email && !cliente.telefone && (
            <div className="text-sm text-muted-foreground italic">
              📊 Dados pessoais protegidos
            </div>
          )}
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant={clienteTemAssinatura(cliente) ? "default" : "secondary"}
            size="sm"
            onClick={onOnboarding}
            disabled={!clienteTemAssinatura(cliente)}
            title={!clienteTemAssinatura(cliente) ? 'Cliente precisa ter uma assinatura para acessar o onboarding' : ''}
            className="w-full h-11 text-sm font-medium"
          >
            <Users className="h-4 w-4 mr-2" />
            {clienteTemAssinatura(cliente) ? "Onboarding" : "Sem Plano"}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex-1 h-10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 h-10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o cliente {cliente.nome}? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
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