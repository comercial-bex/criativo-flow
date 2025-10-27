import { useState } from "react";
import { useClientUsers } from "@/hooks/useClientUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, UserMinus, Mail, CheckCircle, XCircle } from "lucide-react";
import { AddClientUserModal } from "./AddClientUserModal";

interface UsuariosTabProps {
  clienteId: string;
}

export function UsuariosTab({ clienteId }: UsuariosTabProps) {
  const { users, loading, deactivateUser, createUser } = useClientUsers(clienteId);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDeactivate, setUserToDeactivate] = useState<string | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.pessoas.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pessoas.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          onSearch={setSearchTerm}
          placeholder="Buscar por nome ou email..."
          className="max-w-sm"
        />
        <Button onClick={() => setAddUserModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Cliente ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Nenhum usuário encontrado"
              description="Adicione usuários para gerenciar o acesso ao cliente"
              action={{
                label: "Adicionar Primeiro Usuário",
                onClick: () => {},
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.pessoas.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.pessoas.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role_cliente}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.ativo ? (
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.ativo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToDeactivate(user.user_id)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Desativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={!!userToDeactivate}
        onOpenChange={(open) => !open && setUserToDeactivate(null)}
        title="Desativar Usuário"
        description="Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema."
        confirmText="Desativar"
        variant="destructive"
        onConfirm={() => {
          if (userToDeactivate) {
            deactivateUser(userToDeactivate);
            setUserToDeactivate(null);
          }
        }}
      />

      <AddClientUserModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        clienteId={clienteId}
        onSuccess={(userData) => createUser(userData)}
      />
    </div>
  );
}
