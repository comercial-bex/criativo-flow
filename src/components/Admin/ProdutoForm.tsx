import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProdutosCatalogo, ProdutoTipo } from "@/hooks/useProdutosCatalogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { smartToast } from "@/lib/smart-toast";

export default function ProdutoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createProduto, updateProduto, buscarPorId } = useProdutosCatalogo();
  const [salvando, setSalvando] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: "",
    nome: "",
    descricao: "",
    categoria: "",
    tipo: "produto" as ProdutoTipo,
    unidade: "unidade",
    preco_padrao: "",
    ativo: true,
    // Campos condicionais
    periodo: "",
    posts_mensais: "",
    reels_suporte: false,
    anuncios_facebook: false,
    anuncios_google: false,
    recursos: "",
    slug: "",
    preco_base: "",
    duracao_dias: "",
    requer_briefing: false,
  });

  useEffect(() => {
    const fetchProduto = async () => {
      if (!id) return;
      
      try {
        const data = await buscarPorId(id);

        if (data) {
          setFormData({
            sku: data.sku || "",
            nome: data.nome || "",
            descricao: data.descricao || "",
            categoria: data.categoria || "",
            tipo: data.tipo || "produto",
            unidade: data.unidade || "unidade",
            preco_padrao: data.preco_padrao?.toString() || "",
            ativo: data.ativo ?? true,
            periodo: data.periodo || "",
            posts_mensais: data.posts_mensais?.toString() || "",
            reels_suporte: data.reels_suporte || false,
            anuncios_facebook: data.anuncios_facebook || false,
            anuncios_google: data.anuncios_google || false,
            recursos: data.recursos?.join("\n") || "",
            slug: data.slug || "",
            preco_base: data.preco_base?.toString() || "",
            duracao_dias: data.duracao_dias?.toString() || "",
            requer_briefing: data.requer_briefing || false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        smartToast.error("Erro ao carregar produto");
      }
    };

    fetchProduto();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      smartToast.error("Nome é obrigatório");
      return;
    }

    setSalvando(true);
    
    const produtoData: any = {
      sku: formData.sku,
      nome: formData.nome,
      descricao: formData.descricao || null,
      categoria: formData.categoria || null,
      tipo: formData.tipo,
      unidade: formData.unidade,
      preco_padrao: parseFloat(formData.preco_padrao),
      ativo: formData.ativo,
    };

    // Adicionar campos específicos para planos de assinatura
    if (formData.tipo === 'plano_assinatura') {
      produtoData.periodo = formData.periodo || null;
      produtoData.posts_mensais = formData.posts_mensais ? parseInt(formData.posts_mensais) : null;
      produtoData.reels_suporte = formData.reels_suporte;
      produtoData.anuncios_facebook = formData.anuncios_facebook;
      produtoData.anuncios_google = formData.anuncios_google;
      produtoData.recursos = formData.recursos 
        ? formData.recursos.split('\n').map(r => r.trim()).filter(Boolean) 
        : null;
    }

    // Adicionar campos específicos para pacotes de serviço
    if (formData.tipo === 'pacote_servico') {
      produtoData.slug = formData.slug || null;
      produtoData.preco_base = formData.preco_base ? parseFloat(formData.preco_base) : null;
      produtoData.duracao_dias = formData.duracao_dias ? parseInt(formData.duracao_dias) : null;
      produtoData.requer_briefing = formData.requer_briefing;
    }

    try {
      if (id) {
        updateProduto({ ...produtoData, id });
      } else {
        createProduto(produtoData);
      }
      navigate("/admin/produtos");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setSalvando(false);
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as ProdutoTipo }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="plano_assinatura">Plano de Assinatura</SelectItem>
                    <SelectItem value="pacote_servico">Pacote de Serviço</SelectItem>
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
                  onChange={(e) => setFormData({ ...formData, preco_padrao: e.target.value })}
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo">Produto Ativo</Label>
            </div>

            {/* Campos específicos para Planos de Assinatura */}
            {formData.tipo === 'plano_assinatura' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Select
                      value={formData.periodo}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, periodo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posts_mensais">Posts Mensais</Label>
                    <Input
                      id="posts_mensais"
                      type="number"
                      value={formData.posts_mensais}
                      onChange={(e) => setFormData(prev => ({ ...prev, posts_mensais: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reels_suporte"
                      checked={formData.reels_suporte}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reels_suporte: checked }))}
                    />
                    <Label htmlFor="reels_suporte">Suporte Reels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anuncios_facebook"
                      checked={formData.anuncios_facebook}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anuncios_facebook: checked }))}
                    />
                    <Label htmlFor="anuncios_facebook">Facebook Ads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anuncios_google"
                      checked={formData.anuncios_google}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anuncios_google: checked }))}
                    />
                    <Label htmlFor="anuncios_google">Google Ads</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recursos">Recursos (um por linha)</Label>
                  <Textarea
                    id="recursos"
                    value={formData.recursos}
                    onChange={(e) => setFormData(prev => ({ ...prev, recursos: e.target.value }))}
                    placeholder="Criação de Layout&#10;Elaboração da Linha Editorial&#10;Gerenciador de Conteúdos"
                    className="min-h-[100px]"
                  />
                </div>
              </>
            )}

            {/* Campos específicos para Pacotes de Serviço */}
            {formData.tipo === 'pacote_servico' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (identificador único)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="pacote-social-media"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco_base">Preço Base</Label>
                    <Input
                      id="preco_base"
                      type="number"
                      step="0.01"
                      value={formData.preco_base}
                      onChange={(e) => setFormData(prev => ({ ...prev, preco_base: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao_dias">Duração (dias)</Label>
                    <Input
                      id="duracao_dias"
                      type="number"
                      value={formData.duracao_dias}
                      onChange={(e) => setFormData(prev => ({ ...prev, duracao_dias: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requer_briefing"
                      checked={formData.requer_briefing}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requer_briefing: checked }))}
                    />
                    <Label htmlFor="requer_briefing">Requer Briefing</Label>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar Produto"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/produtos")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
