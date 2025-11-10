import { useParams, useNavigate } from "react-router-dom";
import { useOrcamento } from "@/hooks/useOrcamento";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Copy,
  Send,
  Building,
  Calendar,
  Download,
  DollarSign
} from "lucide-react";
import { TimelineLog } from "@/components/Admin/TimelineLog";
import { TransacoesVinculadas } from "@/components/Financeiro/TransacoesVinculadas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { smartToast } from "@/lib/smart-toast";
import { gerarPDFOrcamento } from "@/utils/pdfExport";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  enviado: "bg-info/10 text-info border-info/20",
  aprovado: "bg-success/10 text-success border-success/20",
  recusado: "bg-destructive/10 text-destructive border-destructive/20",
  expirado: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export default function OrcamentoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orcamento, loading, converterParaProposta, duplicarOrcamento } = useOrcamento(id);

  const { data: itens = [] } = useQuery({
    queryKey: ["orcamento_itens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_itens")
        .select("*")
        .eq("orcamento_id", id)
        .order("ordem");

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (loading || !orcamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando orçamento...</p>
      </div>
    );
  }

  const handleConverterProposta = () => {
    if (!id) return;
    converterParaProposta(id);
    setTimeout(() => navigate("/administrativo/propostas"), 1000);
  };

  const handleDuplicar = () => {
    if (!id) return;
    duplicarOrcamento(id);
  };

  const handleExportarPDF = async () => {
    try {
      await gerarPDFOrcamento(orcamento, itens);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O arquivo foi baixado automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/administrativo/orcamentos")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{orcamento.titulo}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {orcamento.clientes && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {orcamento.clientes.nome}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(orcamento.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              {orcamento.numero && (
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  #{orcamento.numero}
                </span>
              )}
            </div>
          </div>
          <Badge className={statusColors[orcamento.status || "rascunho"]}>
            {statusLabels[orcamento.status || "rascunho"]}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="condicoes">Condições</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="resumo">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-lg font-semibold">Informações Gerais</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {Number(orcamento.valor_total || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                <p className="font-medium">R$ {Number(orcamento.subtotal || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Impostos</p>
                <p className="font-medium">R$ {Number(orcamento.impostos || 0).toFixed(2)}</p>
              </div>
              {orcamento.outros && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Outros</p>
                  <p className="font-medium">R$ {Number(orcamento.outros).toFixed(2)}</p>
                </div>
              )}
              {orcamento.data_validade && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Validade</p>
                  <p className="font-medium">
                    {format(new Date(orcamento.data_validade), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>

            {orcamento.observacoes && (
              <>
                <Separator className="my-6" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {orcamento.observacoes}
                  </p>
                </div>
              </>
            )}

            <Separator className="my-6" />

            <div className="flex gap-3">
              <Button onClick={() => navigate(`/administrativo/orcamentos/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button variant="outline" onClick={handleConverterProposta}>
                <Send className="w-4 h-4 mr-2" />
                Converter para Proposta
              </Button>

              <Button variant="outline" onClick={handleDuplicar}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>

              <Button variant="outline" onClick={handleExportarPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Itens */}
        <TabsContent value="itens">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Produtos e Serviços ({itens.length})</h3>
            <div className="space-y-2">
              {itens.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto_servico}</p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantidade} x R$ {Number(item.preco_unitario).toFixed(2)}
                      {item.desconto_percentual > 0 && ` (Desc. ${item.desconto_percentual}%)`}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(item.valor_total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {itens.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item adicionado ainda
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Cliente */}
        <TabsContent value="cliente">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
            {orcamento.clientes && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome/Razão Social</p>
                  <p className="font-medium">{orcamento.clientes.nome}</p>
                </div>
                {orcamento.contato_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{orcamento.contato_email}</p>
                  </div>
                )}
                {orcamento.contato_tel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{orcamento.contato_tel}</p>
                  </div>
                )}
                {orcamento.contato_nome && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contato</p>
                    <p className="font-medium">{orcamento.contato_nome}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Condições */}
        <TabsContent value="condicoes">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Condições de Pagamento</h3>
            {orcamento.condicoes_pagamento ? (
              <p className="whitespace-pre-wrap">{orcamento.condicoes_pagamento}</p>
            ) : (
              <p className="text-muted-foreground">Não especificado</p>
            )}

            {orcamento.observacoes && (
              <>
                <Separator className="my-6" />
                <h4 className="font-medium mb-2">Observações</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {orcamento.observacoes}
                </p>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Integração Financeira</h3>
            </div>
            
            {orcamento.status === 'aprovado' ? (
              <TransacoesVinculadas orcamentoId={id!} />
            ) : (
              <Alert>
                <AlertDescription>
                  Transações financeiras serão geradas automaticamente quando o orçamento for aprovado.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <TimelineLog 
            clienteId={orcamento.cliente_id} 
            entidadeTipo="orcamento"
            entidadeId={id}
          />
        </TabsContent>

        {/* Anexos */}
        <TabsContent value="anexos">
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sistema de anexos em desenvolvimento</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
