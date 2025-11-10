import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProdutosCatalogo } from "@/hooks/useProdutosCatalogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, Eye, Edit, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { usePermissions } from "@/hooks/usePermissions";

export default function Produtos() {
  const { startTutorial, hasSeenTutorial } = useTutorial('admin-produtos');
  const navigate = useNavigate();
  const { produtos, loading } = useProdutosCatalogo();
  const { role } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("all");

  const filteredProdutos = produtos?.filter((p) => {
    const matchesSearch =
      p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "ativos" && p.ativo) ||
      (activeTab === "inativos" && !p.ativo);

    const matchesTipo = 
      tipoFilter === "all" || p.tipo === tipoFilter;

    return matchesSearch && matchesTab && matchesTipo;
  });

  const stats = {
    total: produtos?.length || 0,
    ativos: produtos?.filter((p) => p.ativo).length || 0,
    inativos: produtos?.filter((p) => !p.ativo).length || 0,
    produtos: produtos?.filter((p) => p.tipo === 'produto').length || 0,
    servicos: produtos?.filter((p) => p.tipo === 'servico').length || 0,
    planos: produtos?.filter((p) => p.tipo === 'plano_assinatura').length || 0,
    pacotes: produtos?.filter((p) => p.tipo === 'pacote_servico').length || 0,
  };

  const canEdit = role === "admin" || role === "gestor";

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" data-tour="kpis">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Ativos</p>
              <p className="text-2xl font-bold">{stats.ativos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Inativos</p>
              <p className="text-2xl font-bold">{stats.inativos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-xs text-muted-foreground mb-1">Produtos</p>
              <p className="text-2xl font-bold">{stats.produtos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-xs text-muted-foreground mb-1">Serviços</p>
              <p className="text-2xl font-bold">{stats.servicos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-xs text-muted-foreground mb-1">Planos</p>
              <p className="text-2xl font-bold">{stats.planos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
              <p className="text-xs text-muted-foreground mb-1">Pacotes</p>
              <p className="text-2xl font-bold">{stats.pacotes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, SKU ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="produto">Produtos</SelectItem>
                <SelectItem value="servico">Serviços</SelectItem>
                <SelectItem value="plano_assinatura">Planos de Assinatura</SelectItem>
                <SelectItem value="pacote_servico">Pacotes de Serviço</SelectItem>
              </SelectContent>
            </Select>
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
                              {produto.tipo === "produto" ? "Produto" : 
                               produto.tipo === "servico" ? "Serviço" :
                               produto.tipo === "plano_assinatura" ? "Plano" :
                               produto.tipo === "pacote_servico" ? "Pacote" : produto.tipo}
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
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/produtos/${produto.id}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {(produto.tipo === 'produto' || produto.tipo === 'servico') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/produtos/${produto.id}/historico`)}
                              title="Histórico de Uso"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          )}
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
