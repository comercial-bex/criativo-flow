import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, FileText, Calendar, DollarSign, Eye, Edit, Trash2, 
  MoreVertical, FileSignature, CheckCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useContracts } from "@/hooks/useContracts";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

const statusColors = {
  rascunho: "bg-gray-100 text-gray-800",
  aprovacao_interna: "bg-yellow-100 text-yellow-800",
  enviado_assinatura: "bg-blue-100 text-blue-800",
  assinado: "bg-green-100 text-green-800",
  vigente: "bg-emerald-100 text-emerald-800",
  encerrado: "bg-red-100 text-red-800",
};

const statusLabels = {
  rascunho: "Rascunho",
  aprovacao_interna: "Aprovação Interna",
  enviado_assinatura: "Enviado p/ Assinatura",
  assinado: "Assinado",
  vigente: "Vigente",
  encerrado: "Encerrado",
};

export default function Contratos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = usePermissions();
  const { contracts, loading } = useContracts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "" });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  // RBAC
  const canSeeValues = role === 'admin' || role === 'gestor' || role === 'financeiro' || role === 'grs';
  const canCreate = role === 'admin' || role === 'gestor';
  const canEdit = role === 'admin' || role === 'gestor';
  const canDelete = role === 'admin' || role === 'gestor';

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.titulo?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      contract.clientes?.nome?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = statusFilter === "todos" || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    vigentes: contracts.filter((c) => c.status === "vigente").length,
    rascunho: contracts.filter((c) => c.status === "rascunho").length,
    valorTotal: canSeeValues ? contracts.reduce((acc, c) => acc + (c.valor_mensal || c.valor_avulso || 0), 0) : 0,
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      smartToast.success("Contrato excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setDeleteDialog({ open: false, id: "" });
    } catch (error: any) {
      smartToast.error("Erro ao excluir contrato", error.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      smartToast.success(`${selectedIds.size} contrato(s) excluído(s)`);
      setSelectedIds(new Set());
      setBulkDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    } catch (error: any) {
      smartToast.error("Erro ao excluir contratos", error.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContracts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContracts.map(c => c.id)));
    }
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
        {canCreate && (
          <Button onClick={() => navigate("/admin/contratos/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        )}
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
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
        {canSeeValues && (
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
        )}
      </div>

      {/* Filtros e Ações em Lote */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar contratos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="todos">Todos os status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        
        {canDelete && selectedIds.size > 0 && (
          <Button 
            variant="destructive" 
            onClick={() => setBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir {selectedIds.size} selecionado(s)
          </Button>
        )}
      </div>

      {/* Seleção de Todos */}
      {canDelete && filteredContracts.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={selectedIds.size === filteredContracts.length && filteredContracts.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 text-center p-6">
            <FileSignature className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {canCreate ? "Comece criando seu primeiro contrato de serviço" : "Nenhum contrato disponível no momento"}
            </p>
            {canCreate && (
              <Button onClick={() => navigate("/admin/contratos/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Contrato
              </Button>
            )}
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {canDelete && (
                      <Checkbox 
                        checked={selectedIds.has(contract.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedIds);
                          if (checked) {
                            newSet.add(contract.id);
                          } else {
                            newSet.delete(contract.id);
                          }
                          setSelectedIds(newSet);
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {contract.titulo}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        {contract.clientes && (
                          <span className="font-medium">{contract.clientes.nome}</span>
                        )}
                        {canSeeValues && contract.valor_mensal && (
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
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                      {statusLabels[contract.status as keyof typeof statusLabels]}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/contratos/${contract.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => navigate(`/admin/contratos/${contract.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canDelete && contract.status !== 'assinado' && contract.status !== 'vigente' && (
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteDialog({ open: true, id: contract.id })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Exclusão Individual */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir este contrato? Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(deleteDialog.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão em Lote */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contratos</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir {selectedIds.size} contrato(s)? Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
