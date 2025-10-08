import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign, Eye, Edit } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const statusColors = {
  rascunho: "bg-gray-100 text-gray-800",
  enviado: "bg-blue-100 text-blue-800",
  assinado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  vigente: "bg-emerald-100 text-emerald-800",
};

const statusLabels = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  assinado: "Assinado",
  cancelado: "Cancelado",
  vigente: "Vigente",
};

export default function Contratos() {
  const navigate = useNavigate();
  const { contracts, loading } = useContracts();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "todos" || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    vigentes: contracts.filter((c) => c.status === "vigente").length,
    rascunho: contracts.filter((c) => c.status === "rascunho").length,
    valorTotal: contracts.reduce((acc, c) => acc + (c.valor_mensal || c.valor_avulso || 0), 0),
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerencie contratos e termos de serviço</p>
        </div>
        <Button onClick={() => navigate("/admin/contratos/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.vigentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rascunho}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar contratos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="todos">Todos os status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Nenhum contrato encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/contratos/${contract.id}`)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {contract.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {contract.clientes && (
                        <span className="font-medium">{contract.clientes.nome}</span>
                      )}
                      {contract.valor_mensal && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {contract.valor_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                        </div>
                      )}
                      {contract.data_inicio && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(contract.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                          {contract.data_fim && ` - ${format(new Date(contract.data_fim), "dd/MM/yyyy", { locale: ptBR })}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                    {statusLabels[contract.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
