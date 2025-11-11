import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProdutosCatalogo } from "@/hooks/useProdutosCatalogo";
import { toast } from "@/hooks/use-toast";

interface Assinatura {
  id?: string;
  nome: string;
  preco_padrao: number;
  periodo: string;
  posts_mensais: number;
  reels_suporte: boolean;
  anuncios_facebook: boolean;
  anuncios_google: boolean;
  recursos: string[];
  ativo: boolean;
}

export default function Planos() {
  const { produtos: assinaturas, loading, createProduto, updateProduto } = useProdutosCatalogo({ 
    tipo: 'plano_assinatura' 
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssinatura, setEditingAssinatura] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    periodo: 'mensal',
    posts_mensais: '',
    reels_suporte: false,
    anuncios_facebook: false,
    anuncios_google: false,
    recursos: '',
    ativo: true
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      preco: '',
      periodo: 'mensal',
      posts_mensais: '',
      reels_suporte: false,
      anuncios_facebook: false,
      anuncios_google: false,
      recursos: '',
      ativo: true
    });
    setEditingAssinatura(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recursos = formData.recursos
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const produtoData = {
        tipo: 'plano_assinatura' as const,
        nome: formData.nome,
        preco_padrao: parseFloat(formData.preco),
        periodo: formData.periodo,
        posts_mensais: parseInt(formData.posts_mensais),
        reels_suporte: formData.reels_suporte,
        anuncios_facebook: formData.anuncios_facebook,
        anuncios_google: formData.anuncios_google,
        recursos,
        ativo: formData.ativo,
        // Campos obrigatórios para produtos
        sku: `PLAN-${formData.nome.toUpperCase()}`,
        unidade: 'mensal',
        custo: null,
        imposto_percent: 0,
        categoria: 'Planos de Assinatura'
      };

      if (editingAssinatura?.id) {
        updateProduto({ id: editingAssinatura.id, ...produtoData });
      } else {
        createProduto(produtoData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano de assinatura.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (assinatura: any) => {
    setEditingAssinatura(assinatura);
    setFormData({
      nome: assinatura.nome,
      preco: assinatura.preco_padrao.toString(),
      periodo: assinatura.periodo || 'mensal',
      posts_mensais: assinatura.posts_mensais.toString(),
      reels_suporte: assinatura.reels_suporte,
      anuncios_facebook: assinatura.anuncios_facebook,
      anuncios_google: assinatura.anuncios_google,
      recursos: assinatura.recursos?.join('\n') || '',
      ativo: assinatura.ativo
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "nome",
      label: "Nome do Plano",
    },
    {
      key: "preco_padrao",
      label: "Preço",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: "posts_mensais",
      label: "Posts/Mês",
    },
    {
      key: "reels_suporte",
      label: "Reels",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "anuncios_facebook",
      label: "Facebook Ads",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "anuncios_google",
      label: "Google Ads",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "ativo",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: "Editar",
      onClick: (row: any) => handleEdit(row),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gerenciar Assinaturas"
        description="Cadastre e gerencie os planos de assinatura disponíveis para seus clientes"
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total de {assinaturas.length} planos cadastrados
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAssinatura ? 'Editar' : 'Cadastrar'} Assinatura
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Plano</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posts_mensais">Posts Mensais</Label>
                  <Input
                    id="posts_mensais"
                    type="number"
                    value={formData.posts_mensais}
                    onChange={(e) => setFormData(prev => ({ ...prev, posts_mensais: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reels_suporte">Suporte de Reels</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="reels_suporte"
                      type="checkbox"
                      checked={formData.reels_suporte}
                      onChange={(e) => setFormData(prev => ({ ...prev, reels_suporte: e.target.checked }))}
                    />
                    <Label htmlFor="reels_suporte">Incluir suporte para Reels</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anuncios_facebook">Anúncios Facebook</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="anuncios_facebook"
                      type="checkbox"
                      checked={formData.anuncios_facebook}
                      onChange={(e) => setFormData(prev => ({ ...prev, anuncios_facebook: e.target.checked }))}
                    />
                    <Label htmlFor="anuncios_facebook">Incluir anúncios Facebook</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anuncios_google">Anúncios Google</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="anuncios_google"
                      type="checkbox"
                      checked={formData.anuncios_google}
                      onChange={(e) => setFormData(prev => ({ ...prev, anuncios_google: e.target.checked }))}
                    />
                    <Label htmlFor="anuncios_google">Incluir anúncios Google</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recursos">Recursos Inclusos (um por linha)</Label>
                <Textarea
                  id="recursos"
                  value={formData.recursos}
                  onChange={(e) => setFormData(prev => ({ ...prev, recursos: e.target.value }))}
                  placeholder="Criação de Layout Peças OFF&#10;Elaboração da Linha Editorial&#10;Gerenciador de Conteúdos"
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAssinatura ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Cadastrados</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os planos de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={assinaturas} 
            actions={actions}
            emptyMessage="Nenhuma assinatura cadastrada"
          />
        </CardContent>
      </Card>
    </div>
  );
}