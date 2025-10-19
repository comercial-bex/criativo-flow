import { useState } from "react";
import { useFornecedores } from "@/hooks/useFornecedores";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { FornecedorDialog } from "./FornecedorDialog";
import type { Fornecedor } from "@/hooks/useFornecedores";

export function FornecedoresTable() {
  const { fornecedores, isLoading, deleteFornecedor } = useFornecedores();
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum fornecedor cadastrado
                </TableCell>
              </TableRow>
            ) : (
              fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.razao_social}</TableCell>
                  <TableCell>{fornecedor.cpf_cnpj || "-"}</TableCell>
                  <TableCell>{fornecedor.telefone || "-"}</TableCell>
                  <TableCell>{fornecedor.email || "-"}</TableCell>
                  <TableCell>{fornecedor.categoria || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                      {fornecedor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingFornecedor(fornecedor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este fornecedor?")) {
                          deleteFornecedor(fornecedor.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingFornecedor && (
        <FornecedorDialog
          open={!!editingFornecedor}
          onOpenChange={(open) => !open && setEditingFornecedor(null)}
          fornecedor={editingFornecedor}
        />
      )}
    </>
  );
}
