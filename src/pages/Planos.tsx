import { useState } from "react";
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

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  posts_mensais: number;
  reels_suporte: number;
  anuncios_facebook: number;
  anuncios_google: number;
  recursos: string[];
  status: 'ativo' | 'inativo';
  created_at: string;
}

const mockAssinaturas: Assinatura[] = [
  {
    id: '1',
    nome: 'Plano 90º',
    preco: 997,
    periodo: 'mensal',
    posts_mensais: 12,
    reels_suporte: 3,
    anuncios_facebook: 4,
    anuncios_google: 1,
    recursos: [
      'Criação de Layout Peças OFF',
      'Elaboração da Linha Editorial',
      'Gerenciador de Conteúdos'
    ],
    status: 'ativo',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Plano 180º',
    preco: 1497,
    periodo: 'mensal',
    posts_mensais: 16,
    reels_suporte: 6,
    anuncios_facebook: 10,
    anuncios_google: 3,
    recursos: [
      'Criação de Layout Peças OFF',
      'Elaboração da Linha Editorial',
      'Gerenciador de Conteúdos',
      'Suporte Full & Gestão de Crises',
      'Estratégias de Captação de Leads (Landing Page)'
    ],
    status: 'ativo',
    created_at: '2024-01-15'
  },
  {
    id: '3',
    nome: 'Plano 360º',
    preco: 2197,
    periodo: 'mensal',
    posts_mensais: 24,
    reels_suporte: 8,
    anuncios_facebook: 15,
    anuncios_google: 5,
    recursos: [
      'Criação de Layout Peças OFF',
      'Elaboração da Linha Editorial',
      'Gerenciador de Conteúdos',
      'Suporte Full & Gestão de Crises',
      'Estratégias de Captação de Leads (Landing Page)',
      'Consultoria em Branding'
    ],
    status: 'ativo',
    created_at: '2024-01-15'
  }
];

export default function Planos() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>(mockAssinaturas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssinatura, setEditingAssinatura] = useState<Assinatura | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    periodo: 'mensal',
    posts_mensais: '',
    reels_suporte: '',
    anuncios_facebook: '',
    anuncios_google: '',
    recursos: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      preco: '',
      periodo: 'mensal',
      posts_mensais: '',
      reels_suporte: '',
      anuncios_facebook: '',
      anuncios_google: '',
      recursos: '',
      status: 'ativo'
    });
    setEditingAssinatura(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assinaturaData: Assinatura = {
      id: editingAssinatura?.id || Date.now().toString(),
      nome: formData.nome,
      preco: parseFloat(formData.preco),
      periodo: formData.periodo,
      posts_mensais: parseInt(formData.posts_mensais),
      reels_suporte: parseInt(formData.reels_suporte),
      anuncios_facebook: parseInt(formData.anuncios_facebook),
      anuncios_google: parseInt(formData.anuncios_google),
      recursos: formData.recursos.split('\n').filter(r => r.trim()),
      status: formData.status,
      created_at: editingAssinatura?.created_at || new Date().toISOString().split('T')[0]
    };

    if (editingAssinatura) {
      setAssinaturas(prev => prev.map(a => a.id === editingAssinatura.id ? assinaturaData : a));
    } else {
      setAssinaturas(prev => [...prev, assinaturaData]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (assinatura: Assinatura) => {
    setEditingAssinatura(assinatura);
    setFormData({
      nome: assinatura.nome,
      preco: assinatura.preco.toString(),
      periodo: assinatura.periodo,
      posts_mensais: assinatura.posts_mensais.toString(),
      reels_suporte: assinatura.reels_suporte.toString(),
      anuncios_facebook: assinatura.anuncios_facebook.toString(),
      anuncios_google: assinatura.anuncios_google.toString(),
      recursos: assinatura.recursos.join('\n'),
      status: assinatura.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAssinaturas(prev => prev.filter(a => a.id !== id));
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
    },
    {
      key: "anuncios_facebook",
      label: "Facebook Ads",
    },
    {
      key: "anuncios_google",
      label: "Google Ads",
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
                  <Input
                    id="reels_suporte"
                    type="number"
                    value={formData.reels_suporte}
                    onChange={(e) => setFormData(prev => ({ ...prev, reels_suporte: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anuncios_facebook">Anúncios Facebook</Label>
                  <Input
                    id="anuncios_facebook"
                    type="number"
                    value={formData.anuncios_facebook}
                    onChange={(e) => setFormData(prev => ({ ...prev, anuncios_facebook: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anuncios_google">Anúncios Google</Label>
                  <Input
                    id="anuncios_google"
                    type="number"
                    value={formData.anuncios_google}
                    onChange={(e) => setFormData(prev => ({ ...prev, anuncios_google: e.target.value }))}
                    required
                  />
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