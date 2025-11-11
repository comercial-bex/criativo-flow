import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Calendar, DollarSign, User, Eye, Edit, Trash2, Signature, Copy, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialButton } from "@/components/TutorialButton";
import { PropostaPreviewMini } from "@/components/Proposta/PropostaPreviewMini";
import { AssinaturasProgress } from "@/components/Proposta/AssinaturasProgress";
import { EnviarPropostaDialog } from "@/components/Proposta/EnviarPropostaDialog";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface Orcamento {
  id: string;
  titulo: string;
  valor_final: number;
  data_validade: string;
  clientes?: {
    id: string;
    nome: string;
    email?: string;
  };
}

interface Proposta {
  id: string;
  titulo: string;
  orcamento_id: string;
  pdf_path?: string;
  pdf_assinado_path?: string;
  assinatura_status: 'pendente' | 'enviado' | 'assinado' | 'recusado' | 'expirado';
  assinatura_url?: string;
  assinatura_data?: string;
  data_envio?: string;
  link_publico: string;
  visualizado_em?: string;
  created_at: string;
  orcamentos?: Orcamento;
}

const statusColors = {
  pendente: "bg-gray-100 text-gray-800",
  enviado: "bg-blue-100 text-blue-800",
  assinado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
  expirado: "bg-orange-100 text-orange-800"
};

const statusLabels = {
  pendente: "Pendente",
  enviado: "Enviado",
  assinado: "Assinado",
  recusado: "Recusado",
  expirado: "Expirado"
};

export default function Propostas() {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogProposta, setEmailDialogProposta] = useState<Proposta | null>(null);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial, isActive } = useTutorial('administrativo-propostas');

  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    orcamento_id: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar propostas
      const { data: propostasData, error: propostasError } = await supabase
        .from('propostas')
        .select(`
          *,
          orcamentos (
            id,
            titulo,
            valor_final,
            data_validade,
            clientes (id, nome, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (propostasError) throw propostasError;

      // Buscar orçamentos disponíveis (aprovados)
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select(`
          id,
          titulo,
          valor_final,
          data_validade,
          clientes (id, nome, email)
        `)
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false });

      if (orcamentosError) throw orcamentosError;

      setPropostas(propostasData as Proposta[] || []);
      setOrcamentos(orcamentosData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fase 1: Buscar TODOS os itens e assinaturas FORA do loop (corrige Hook Rules Violation)
  const { data: todosItens, isLoading: loadingItens } = useQuery({
    queryKey: ["proposta_itens_all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposta_itens")
        .select("*");
      return data || [];
    },
  });

  const { data: todasAssinaturas, isLoading: loadingAssinaturas } = useQuery({
    queryKey: ["proposta_assinaturas_all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposta_assinaturas")
        .select("*");
      return data || [];
    },
  });

  // Fase 3: Memoização para otimizar performance
  const itensPorProposta = useMemo(() => {
    if (!todosItens) return {};
    return todosItens.reduce((acc, item) => {
      if (!acc[item.proposta_id]) acc[item.proposta_id] = [];
      acc[item.proposta_id].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [todosItens]);

  const assinaturasPorProposta = useMemo(() => {
    if (!todasAssinaturas) return {};
    return todasAssinaturas.reduce((acc, assinatura) => {
      if (!acc[assinatura.proposta_id]) acc[assinatura.proposta_id] = [];
      acc[assinatura.proposta_id].push(assinatura);
      return acc;
    }, {} as Record<string, any[]>);
  }, [todasAssinaturas]);

  const resetForm = () => {
    setFormData({
      titulo: "",
      orcamento_id: "",
      observacoes: ""
    });
    setEditingProposta(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const propostaData = {
      ...formData,
      responsavel_id: (await supabase.auth.getUser()).data.user?.id
    };

    try {
      if (editingProposta) {
        const { error } = await supabase
          .from('propostas')
          .update(propostaData)
          .eq('id', editingProposta.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('propostas')
          .insert(propostaData);

        if (error) throw error;
      }

      toast({
        title: editingProposta ? "Proposta atualizada" : "Proposta criada",
        description: "Operação realizada com sucesso!",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (proposta: Proposta) => {
    navigate(`/administrativo/propostas/${proposta.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta proposta?")) return;

    try {
      const { error } = await supabase
        .from('propostas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Proposta excluída",
        description: "Proposta excluída com sucesso!",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fase 4: Loading states
  if (loading || loadingItens || loadingAssinaturas) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Carregando propostas...</span>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propostas Comerciais</h1>
          <p className="text-muted-foreground">Gerencie propostas e assinaturas eletrônicas</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-tour="nova-proposta" onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Proposta
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProposta ? "Editar Proposta" : "Nova Proposta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título da Proposta</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="orcamento">Orçamento Base</Label>
                <Select value={formData.orcamento_id} onValueChange={(value) => setFormData({ ...formData, orcamento_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um orçamento aprovado" />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentos.map((orcamento) => (
                      <SelectItem key={orcamento.id} value={orcamento.id}>
                        {orcamento.titulo} - {orcamento.clientes?.nome} - R$ {orcamento.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais para a proposta..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingProposta ? "Atualizar" : "Criar"} Proposta
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-tour="kpis-propostas">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propostas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinadas</CardTitle>
            <Signature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {propostas.filter(p => p.assinatura_status === 'assinado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {propostas.filter(p => p.assinatura_status === 'pendente' || p.assinatura_status === 'enviado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {propostas.reduce((acc, p) => acc + (p.orcamentos?.valor_final || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Propostas */}
      <div className="grid grid-cols-1 gap-6">
        {propostas.map((proposta) => {
          // Fase 1: Filtrar dados sem usar hooks dentro do loop
          const itens = itensPorProposta[proposta.id] || [];
          const assinaturas = assinaturasPorProposta[proposta.id] || [];

          return (
            <Card key={proposta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {proposta.titulo}
                      </CardTitle>
                      <Badge className={statusColors[proposta.assinatura_status]}>
                        {statusLabels[proposta.assinatura_status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {proposta.orcamentos?.clientes && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {proposta.orcamentos.clientes.nome}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(proposta.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {proposta.orcamentos?.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preview Mini */}
                {itens.length > 0 && <PropostaPreviewMini proposta={proposta} itens={itens} />}

                {/* Progresso de Assinaturas */}
                {assinaturas.length > 0 && <AssinaturasProgress assinaturas={assinaturas} />}

                {/* Ações Rápidas */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => navigate(`/administrativo/propostas/${proposta.id}`)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Ver Detalhes
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/administrativo/propostas/${proposta.id}/edit`)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Editar
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEmailDialogProposta(proposta)}
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    Enviar Email
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const link = `${window.location.origin}/public/proposta/${proposta.link_publico}`;
                      navigator.clipboard.writeText(link);
                      toast({ title: "Link copiado!" });
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copiar Link
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(proposta.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {propostas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma proposta encontrada</h3>
            <p className="text-muted-foreground">Crie sua primeira proposta para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Envio de Email */}
      <EnviarPropostaDialog
        open={!!emailDialogProposta}
        onOpenChange={(open) => !open && setEmailDialogProposta(null)}
        proposta={emailDialogProposta!}
        itens={emailDialogProposta ? itensPorProposta[emailDialogProposta.id] || [] : []}
      />
      </div>
    </ErrorBoundary>
  );
}