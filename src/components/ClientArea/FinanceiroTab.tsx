import { useState } from "react";
import { useClientFinances } from "@/hooks/useClientFinances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinanceiroTabProps {
  clienteId: string;
}

export function FinanceiroTab({ clienteId }: FinanceiroTabProps) {
  const { transactions, receitas, despesas, loading, registerPayment, summary } =
    useClientFinances(clienteId);
  const [activeTab, setActiveTab] = useState("resumo");

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: { variant: "secondary" as const, label: "Pendente", className: "bg-orange-500/10 text-orange-700" },
      pago: { variant: "outline" as const, label: "Pago", className: "bg-green-500/10 text-green-700" },
      atrasado: { variant: "outline" as const, label: "Atrasado", className: "bg-red-500/10 text-red-700" },
      cancelado: { variant: "outline" as const, label: "Cancelado", className: "bg-gray-500/10 text-gray-700" },
    };
    const config = variants[status as keyof typeof variants] || variants.pendente;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Receitas</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ {summary.totalReceitas.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Despesas</div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              R$ {summary.totalDespesas.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Saldo</div>
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
            <div
              className={`text-2xl font-bold ${
                summary.saldo >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              R$ {summary.saldo.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Pendente</div>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              R$ {summary.pendente.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.titulo}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.tipo === "receita" ? "default" : "secondary"}>
                          {transaction.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.tipo === "receita" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        R$ {Number(transaction.valor).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.data_vencimento), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Receitas</CardTitle>
                <Button size="sm">Adicionar Receita</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receitas.map((receita) => (
                    <TableRow key={receita.id}>
                      <TableCell className="font-medium">{receita.titulo}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        R$ {Number(receita.valor).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(receita.data_vencimento), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(receita.status)}</TableCell>
                      <TableCell>
                        {receita.status === "pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              registerPayment({
                                id: receita.id,
                                data_pagamento: new Date().toISOString(),
                              })
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar Pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Despesas</CardTitle>
                <Button size="sm">Adicionar Despesa</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell className="font-medium">{despesa.titulo}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        R$ {Number(despesa.valor).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(despesa.data_vencimento), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(despesa.status)}</TableCell>
                      <TableCell>
                        {despesa.status === "pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              registerPayment({
                                id: despesa.id,
                                data_pagamento: new Date().toISOString(),
                              })
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar Pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
