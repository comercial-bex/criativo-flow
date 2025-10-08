import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { 
  Plus, 
  Search, 
  FileType, 
  Edit, 
  Copy, 
  Trash2,
  FileCode,
  FileText
} from "lucide-react";

export default function ContractTemplates() {
  const navigate = useNavigate();
  const { templates, loading, toggleAtivo, deleteTemplate, duplicateTemplate } = useContractTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                       t.descricao?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchCategoria = categoriaFilter === "todos" || t.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const categorias = ["todos", ...new Set(templates.map(t => t.categoria).filter(Boolean))];

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Contrato</h1>
          <p className="text-muted-foreground">Gerencie templates reutilizáveis</p>
        </div>
        <Button onClick={() => navigate("/admin/contratos/templates/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "todos" ? "Todas Categorias" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Carregando modelos...</p>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileType className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum modelo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoriaFilter !== "todos" 
              ? "Tente ajustar os filtros de busca"
              : "Crie seu primeiro template de contrato"}
          </p>
          <Button onClick={() => navigate("/admin/contratos/templates/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Modelo
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 truncate">{template.nome}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      {template.categoria && (
                        <Badge variant="secondary">{template.categoria}</Badge>
                      )}
                      <Badge variant={template.ativo ? "default" : "outline"}>
                        {template.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={template.ativo}
                    onCheckedChange={() => toggleAtivo({ id: template.id, ativo: !template.ativo })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {template.tipo_original === 'docx' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <FileCode className="w-4 h-4" />
                    )}
                    <span>
                      {template.variaveis_disponiveis?.length || 0} merge tags
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/contratos/templates/${template.id}`)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template.id)}
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
