import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProdutos } from "@/hooks/useProdutos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Package, History, Eye } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

export default function ProdutosFinanceiro() {
  const navigate = useNavigate();
  const { produtos, loading } = useProdutos();
  const { role } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate = role === "admin" || role === "gestor" || role === "financeiro";

  const filteredProdutos = produtos?.filter(
    (p) =>
      p.ativo &&
      (p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos & Serviços</h1>
          <p className="text-muted-foreground">
            Catálogo de produtos para lançamentos financeiros
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/admin/produtos/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando produtos...</p>
          ) : filteredProdutos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente outra busca" : "Comece cadastrando seu primeiro produto"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor Padrão</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      {produto.categoria ? (
                        <Badge variant="outline">{produto.categoria}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.tipo === "servico" ? "default" : "secondary"}>
                        {produto.tipo === "servico" ? "Serviço" : "Produto"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {Number(produto.preco_padrao).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(produto.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/produtos/${produto.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/financeiro/produtos/${produto.id}/historico`)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          Histórico
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
