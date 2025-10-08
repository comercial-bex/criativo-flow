import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProdutos } from "@/hooks/useProdutos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProdutoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { produtos, createProduto, updateProduto } = useProdutos();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: "",
    nome: "",
    descricao: "",
    tipo: "produto" as "produto" | "servico",
    categoria: "",
    unidade: "unidade",
    preco_padrao: 0,
    ativo: true,
  });

  useEffect(() => {
    if (id && produtos) {
      const produto = produtos.find((p) => p.id === id);
      if (produto) {
        setFormData({
          sku: produto.sku || "",
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          tipo: produto.tipo || "produto",
          categoria: produto.categoria || "",
          unidade: produto.unidade || "unidade",
          preco_padrao: produto.preco_padrao || 0,
          ativo: produto.ativo ?? true,
        });
      }
    }
  }, [id, produtos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateProduto({ ...formData, id });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createProduto(formData);
        toast.success("Produto criado com sucesso!");
      }
      navigate("/admin/produtos");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/produtos")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{id ? "Editar Produto" : "Novo Produto"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SKU & Nome */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Código)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ex: PROD-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do produto/serviço"
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada..."
                rows={4}
              />
            </div>

            {/* Tipo & Categoria */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "produto" | "servico") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Design, Marketing, etc."
                />
              </div>
            </div>

            {/* Unidade & Preço */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Select
                  value={formData.unidade}
                  onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="hora">Hora</SelectItem>
                    <SelectItem value="dia">Dia</SelectItem>
                    <SelectItem value="mes">Mês</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_padrao">Preço Padrão (R$)</Label>
                <Input
                  id="preco_padrao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_padrao}
                  onChange={(e) =>
                    setFormData({ ...formData, preco_padrao: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>


            {/* Ativo */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="ativo" className="cursor-pointer">
                  Produto Ativo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Produtos inativos não aparecem nos seletores
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Produto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/produtos")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
