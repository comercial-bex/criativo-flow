import { useState } from "react";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { ContaBancariaDialog } from "./ContaBancariaDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import type { ContaBancaria } from "@/hooks/useContasBancarias";

export function ContasBancariasTable() {
  const { contas, isLoading, deleteConta } = useContasBancarias();
  const [editingConta, setEditingConta] = useState<ContaBancaria | null>(null);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <TableSkeleton columns={7} rows={5} />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      caixa: "Caixa",
      conta_corrente: "Conta Corrente",
      poupanca: "Poupança",
      investimento: "Investimento",
    };
    return tipos[tipo] || tipo;
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Agência / Conta</TableHead>
              <TableHead className="text-right">Saldo Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={Wallet}
                    title="Nenhuma conta bancária cadastrada"
                    description="Adicione contas bancárias e caixas para gerenciar suas finanças de forma organizada"
                    actionLabel="Nova Conta"
                    onAction={() => {}}
                  />
                </TableCell>
              </TableRow>
            ) : (
              contas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.nome}</TableCell>
                  <TableCell>{getTipoLabel(conta.tipo)}</TableCell>
                  <TableCell>{conta.banco || "-"}</TableCell>
                  <TableCell>
                    {conta.agencia && conta.conta
                      ? `${conta.agencia} / ${conta.conta}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(conta.saldo_atual)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conta.ativo ? "default" : "secondary"}>
                      {conta.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingConta(conta)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Deseja realmente excluir esta conta?")) {
                          deleteConta(conta.id);
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

      {editingConta && (
        <ContaBancariaDialog
          open={!!editingConta}
          onOpenChange={(open) => !open && setEditingConta(null)}
          conta={editingConta}
        />
      )}
    </>
  );
}
