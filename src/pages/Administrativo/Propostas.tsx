import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Calendar, DollarSign, User, Download, Send, Eye, Edit, Trash2, Signature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    setFormData({
      titulo: proposta.titulo,
      orcamento_id: proposta.orcamento_id,
      observacoes: ""
    });
    setEditingProposta(proposta);
    setDialogOpen(true);
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

  const gerarPDF = async (proposta: Proposta) => {
    try {
      toast({
        title: "Gerando PDF",
        description: "PDF da proposta está sendo gerado...",
      });

      // Aqui você implementaria a geração do PDF
      // Por enquanto, apenas simulamos o processo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar o status para enviado
      const { error } = await supabase
        .from('propostas')
        .update({ 
          pdf_path: `/propostas/${proposta.id}.pdf`,
          data_envio: new Date().toISOString()
        })
        .eq('id', proposta.id);

      if (error) throw error;

      toast({
        title: "PDF gerado",
        description: "PDF da proposta foi gerado com sucesso!",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const enviarParaAssinatura = async (proposta: Proposta) => {
    try {
      toast({
        title: "Enviando para assinatura",
        description: "Proposta está sendo enviada para assinatura eletrônica...",
      });

      // Simular integração com GOV.br
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('propostas')
        .update({ 
          assinatura_status: 'enviado',
          assinatura_url: `https://assinador.gov.br/proposal/${proposta.id}`,
          data_envio: new Date().toISOString()
        })
        .eq('id', proposta.id);

      if (error) throw error;

      toast({
        title: "Enviado para assinatura",
        description: "Proposta enviada para assinatura eletrônica via GOV.br!",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar para assinatura",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const criarPrevisaoFinanceira = async (proposta: Proposta) => {
    try {
      const orcamento = proposta.orcamentos;
      if (!orcamento) return;

      const previsaoData = {
        proposta_id: proposta.id,
        valor_mensal: orcamento.valor_final,
        data_inicio: new Date().toISOString().split('T')[0],
        parcelas: 1,
        status: 'confirmado'
      };

      const { error } = await supabase
        .from('financeiro_previsao')
        .insert(previsaoData);

      if (error) throw error;

      toast({
        title: "Previsão financeira criada",
        description: "Receita prevista adicionada ao módulo financeiro!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar previsão financeira",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propostas Comerciais</h1>
          <p className="text-muted-foreground">Gerencie propostas e assinaturas eletrônicas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        {propostas.map((proposta) => (
          <Card key={proposta.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {proposta.titulo}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {proposta.orcamentos?.clientes && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {proposta.orcamentos.clientes.nome}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {proposta.orcamentos?.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {proposta.data_envio && (
                      <div className="flex items-center gap-1">
                        <Send className="h-4 w-4" />
                        Enviado: {format(new Date(proposta.data_envio), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[proposta.assinatura_status]}>
                    {statusLabels[proposta.assinatura_status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!proposta.pdf_path && (
                  <Button variant="outline" size="sm" onClick={() => gerarPDF(proposta)}>
                    <FileText className="mr-1 h-4 w-4" />
                    Gerar PDF
                  </Button>
                )}
                
                {proposta.pdf_path && proposta.assinatura_status === 'pendente' && (
                  <Button variant="outline" size="sm" onClick={() => enviarParaAssinatura(proposta)}>
                    <Signature className="mr-1 h-4 w-4" />
                    Enviar p/ Assinatura
                  </Button>
                )}
                
                {proposta.assinatura_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={proposta.assinatura_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Assinatura
                    </a>
                  </Button>
                )}
                
                {proposta.pdf_assinado_path && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Download PDF Assinado
                  </Button>
                )}
                
                {proposta.assinatura_status === 'assinado' && (
                  <Button variant="outline" size="sm" onClick={() => criarPrevisaoFinanceira(proposta)}>
                    <DollarSign className="mr-1 h-4 w-4" />
                    Criar Previsão Financeira
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={() => handleEdit(proposta)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Editar
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => handleDelete(proposta.id)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Excluir
                </Button>
              </div>
              
              {proposta.visualizado_em && (
                <p className="text-xs text-muted-foreground mt-2">
                  Visualizado em: {format(new Date(proposta.visualizado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
}