import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status: string;
  assinatura_id?: string;
  valor_personalizado?: number | null;
  logo_url?: string;
  created_at?: string;
}

interface ClientTableViewProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onOnboarding: (cliente: Cliente) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getAssinaturaNome: (id?: string) => string;
  getAssinaturaPreco: (cliente: Cliente) => number | null;
  clienteTemAssinatura: (cliente: Cliente) => boolean;
}

export function ClientTableView({
  clientes,
  onEdit,
  onDelete,
  onView,
  onOnboarding,
  getStatusColor,
  getStatusText,
  getAssinaturaNome,
  getAssinaturaPreco,
  clienteTemAssinatura
}: ClientTableViewProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden lg:table-cell">Assinatura</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id} className="hover:bg-muted/50">
              <TableCell>
                <Avatar className="h-10 w-10">
                  {cliente.logo_url ? (
                    <AvatarImage 
                      src={cliente.logo_url} 
                      alt={`Logo ${cliente.nome}`}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              
              <TableCell>
                <div>
                  <p className="font-medium truncate max-w-[200px]">{cliente.nome}</p>
                  {cliente.email && (
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {cliente.email}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="hidden md:table-cell">
                {cliente.telefone ? (
                  <span className="text-sm">{cliente.telefone}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">🔒 Protegido</span>
                )}
              </TableCell>
              
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-col">
                  <span className="text-sm">{getAssinaturaNome(cliente.assinatura_id)}</span>
                  {getAssinaturaPreco(cliente) && (
                    <span className="text-xs text-muted-foreground">
                      R$ {getAssinaturaPreco(cliente)!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      {cliente.valor_personalizado && (
                        <span className="ml-1 text-orange-500">(custom)</span>
                      )}
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge className={`${getStatusColor(cliente.status)} text-xs`}>
                  {getStatusText(cliente.status)}
                </Badge>
              </TableCell>
              
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatDate(cliente.created_at)}
                </span>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(cliente)}
                    className="h-8 w-8 p-0"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(cliente)}
                    className="h-8 w-8 p-0"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={clienteTemAssinatura(cliente) ? "ghost" : "ghost"}
                    size="sm"
                    onClick={() => onOnboarding(cliente)}
                    disabled={!clienteTemAssinatura(cliente)}
                    className="h-8 w-8 p-0"
                    title={clienteTemAssinatura(cliente) ? "Onboarding" : "Sem plano"}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Excluir"
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
                          onClick={() => onDelete(cliente)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {clientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}