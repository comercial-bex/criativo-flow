import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  posts_mensais: number;
  reels_suporte: boolean;
  anuncios_facebook: boolean;
  anuncios_google: boolean;
  recursos: string[];
  status: string;
  created_at?: string;
  updated_at?: string;
}

export default function Planos() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssinatura, setEditingAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    periodo: 'mensal',
    posts_mensais: '',
    reels_suporte: false,
    anuncios_facebook: false,
    anuncios_google: false,
    recursos: '',
    status: 'ativo'
  });

  // Carregar assinaturas do banco
  useEffect(() => {
    fetchAssinaturas();
  }, []);

  const fetchAssinaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssinaturas(data || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos de assinatura.",
        variant: "destructive"
      });
    }
  };

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
      status: 'ativo'
    });
    setEditingAssinatura(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const recursos = formData.recursos
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const assinaturaData = {
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        periodo: formData.periodo,
        posts_mensais: parseInt(formData.posts_mensais),
        reels_suporte: formData.reels_suporte,
        anuncios_facebook: formData.anuncios_facebook,
        anuncios_google: formData.anuncios_google,
        recursos,
        status: formData.status
      };

      if (editingAssinatura) {
        // Atualizar assinatura existente
        const { error } = await supabase
          .from('assinaturas')
          .update(assinaturaData)
          .eq('id', editingAssinatura.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Plano de assinatura atualizado com sucesso."
        });
      } else {
        // Criar nova assinatura
        const { error } = await supabase
          .from('assinaturas')
          .insert(assinaturaData as any);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Novo plano de assinatura criado com sucesso."
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAssinaturas(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano de assinatura.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assinatura: Assinatura) => {
    setEditingAssinatura(assinatura);
    setFormData({
      nome: assinatura.nome,
      preco: assinatura.preco.toString(),
      periodo: assinatura.periodo,
      posts_mensais: assinatura.posts_mensais.toString(),
      reels_suporte: assinatura.reels_suporte,
      anuncios_facebook: assinatura.anuncios_facebook,
      anuncios_google: assinatura.anuncios_google,
      recursos: assinatura.recursos.join('\n'),
      status: assinatura.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assinaturas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano de assinatura removido com sucesso."
      });
      
      fetchAssinaturas(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o plano de assinatura.",
        variant: "destructive"
      });
    }
  };

  const columns = [
    {
      key: "nome",
      label: "Nome do Plano",
    },
    {
      key: "preco",
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
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === 'ativo' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: "Editar",
      onClick: (row: Assinatura) => handleEdit(row),
      variant: 'outline' as const
    },
    {
      label: "Excluir",
      onClick: (row: Assinatura) => handleDelete(row.id),
      variant: 'destructive' as const
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
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : editingAssinatura ? 'Atualizar' : 'Cadastrar'}
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