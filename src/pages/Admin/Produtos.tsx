import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProdutos } from "@/hooks/useProdutos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Eye, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function Produtos() {
  const { startTutorial, hasSeenTutorial } = useTutorial('admin-produtos');
  const navigate = useNavigate();
  const { produtos, loading } = useProdutos();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const filteredProdutos = produtos?.filter((p) => {
    const matchesSearch =
      p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "ativos" && p.ativo) ||
      (activeTab === "inativos" && !p.ativo);

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: produtos?.length || 0,
    ativos: produtos?.filter((p) => p.ativo).length || 0,
    inativos: produtos?.filter((p) => !p.ativo).length || 0,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos & Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos e serviços
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button onClick={() => navigate("/admin/produtos/new")} data-tour="novo-produto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4" data-tour="kpis">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{stats.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold">{stats.inativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, SKU ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card data-tour="tabela">
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} data-tour="categorias">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="ativos">Ativos ({stats.ativos})</TabsTrigger>
              <TabsTrigger value="inativos">Inativos ({stats.inativos})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredProdutos?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProdutos?.map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{produto.nome}</h3>
                          {produto.sku && (
                            <Badge variant="outline" className="text-xs">
                              {produto.sku}
                            </Badge>
                          )}
                          {produto.tipo && (
                            <Badge variant="secondary" className="text-xs">
                              {produto.tipo === "produto" ? "Produto" : "Serviço"}
                            </Badge>
                          )}
                          <Badge
                            variant={produto.ativo ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        {produto.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {produto.descricao}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(produto.preco_padrao || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {produto.unidade || "unidade"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/produtos/${produto.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/produtos/${produto.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
