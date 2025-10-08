import { useParams, useNavigate } from "react-router-dom";
import { useProposta } from "@/hooks/useProposta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Send,
  FileSignature,
  Building,
  Calendar,
  Download,
  Copy,
  Link as LinkIcon
} from "lucide-react";
import { TimelineLog } from "@/components/Admin/TimelineLog";
import { StatusWorkflow } from "@/components/Admin/StatusWorkflow";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { smartToast } from "@/lib/smart-toast";
import { gerarPDFProposta } from "@/utils/pdfExport";

const statusColors: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  enviado: "bg-info/10 text-info border-info/20",
  assinado: "bg-success/10 text-success border-success/20",
  recusado: "bg-destructive/10 text-destructive border-destructive/20",
  expirado: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  assinado: "Aceito",
  recusado: "Recusado",
  expirado: "Expirado",
};

export default function PropostaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    proposta, 
    loading, 
    criarNovaVersao, 
    enviarProposta, 
    converterParaContrato 
  } = useProposta(id);

  const { data: itens = [] } = useQuery({
    queryKey: ["proposta_itens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposta_itens")
        .select("*")
        .eq("proposta_id", id)
        .order("ordem");

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: versoes = [] } = useQuery({
    queryKey: ["proposta_versoes", proposta?.numero],
    queryFn: async () => {
      if (!proposta?.numero) return [];

      const { data, error } = await supabase
        .from("propostas")
        .select("id, versao, created_at, assinatura_status")
        .eq("numero", proposta.numero)
        .order("versao", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proposta?.numero,
  });

  if (loading || !proposta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando proposta...</p>
      </div>
    );
  }

  const handleNovaVersao = () => {
    if (!id) return;
    criarNovaVersao(id);
  };

  const handleEnviar = () => {
    if (!id) return;
    enviarProposta(id);
  };

  const handleGerarContrato = () => {
    if (!id) return;
    converterParaContrato(id);
    setTimeout(() => navigate("/admin/contratos"), 1000);
  };

  const handleExportarPDF = () => {
    gerarPDFProposta(proposta, itens);
  };

  const linkPublico = proposta.link_publico 
    ? `${window.location.origin}/public/proposta/${proposta.link_publico}`
    : null;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/administrativo/propostas")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{proposta.titulo}</h1>
              {versoes.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  v{proposta.versao || 1}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {proposta.clientes && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {proposta.clientes.nome}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(proposta.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              {proposta.numero && (
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  #{proposta.numero}
                </span>
              )}
            </div>
          </div>
          <Badge className={statusColors[proposta.assinatura_status]}>
            {statusLabels[proposta.assinatura_status]}
          </Badge>
        </div>
      </div>

      {/* Status Workflow */}
      <Card className="p-6 mb-6">
        <StatusWorkflow currentStatus={proposta.assinatura_status as any} type="proposta" />
      </Card>

      {/* Versões */}
      {versoes.length > 1 && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Copy className="w-4 h-4" />
            <h3 className="font-semibold">Versões ({versoes.length})</h3>
          </div>
          <div className="flex gap-2">
            {versoes.map((v: any) => (
              <Button
                key={v.id}
                variant={v.id === id ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(`/admin/propostas/${v.id}`)}
              >
                v{v.versao}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Link Público */}
      {linkPublico && (
        <Card className="p-4 mb-6 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span className="font-medium">Link Público:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {linkPublico}
              </code>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(linkPublico);
                smartToast.success("Link copiado!");
              }}
            >
              Copiar
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="condicoes">Condições</TabsTrigger>
          <TabsTrigger value="aprovacoes">Aprovações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="resumo">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-lg font-semibold">Informações Gerais</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {Number(proposta.total || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                <p className="font-medium">R$ {Number(proposta.subtotal || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descontos</p>
                <p className="font-medium">R$ {Number(proposta.descontos || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Impostos</p>
                <p className="font-medium">R$ {Number(proposta.impostos || 0).toFixed(2)}</p>
              </div>
              {proposta.validade && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Validade</p>
                  <p className="font-medium">
                    {format(new Date(proposta.validade), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="flex gap-3">
              <Button onClick={() => navigate(`/administrativo/propostas/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button variant="outline" onClick={handleNovaVersao}>
                <Copy className="w-4 h-4 mr-2" />
                Nova Versão
              </Button>

              {proposta.assinatura_status === "pendente" && (
                <Button variant="outline" onClick={handleEnviar}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar ao Cliente
                </Button>
              )}

              {proposta.assinatura_status === "assinado" && (
                <Button variant="outline" onClick={handleGerarContrato}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Gerar Contrato
                </Button>
              )}

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
              {itens.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantidade} x R$ {Number(item.preco_unitario).toFixed(2)}
                      {item.desconto_percent > 0 && ` (Desc. ${item.desconto_percent}%)`}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(item.subtotal_item).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Cliente */}
        <TabsContent value="cliente">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
            {proposta.clientes && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome/Razão Social</p>
                  <p className="font-medium">{proposta.clientes.nome}</p>
                </div>
                {proposta.contato_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{proposta.contato_email}</p>
                  </div>
                )}
                {proposta.contato_tel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{proposta.contato_tel}</p>
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
            {proposta.condicoes_pagamento ? (
              <p className="whitespace-pre-wrap">{proposta.condicoes_pagamento}</p>
            ) : (
              <p className="text-muted-foreground">Não especificado</p>
            )}
          </Card>
        </TabsContent>

        {/* Aprovações */}
        <TabsContent value="aprovacoes">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status de Aprovação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded">
                <div>
                  <p className="font-medium">Status Atual</p>
                  <Badge className={statusColors[proposta.assinatura_status]}>
                    {statusLabels[proposta.assinatura_status]}
                  </Badge>
                </div>
                {proposta.assinatura_data && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Assinado em</p>
                    <p className="font-medium">
                      {format(new Date(proposta.assinatura_data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {proposta.observacoes_cliente && (
                <div className="p-4 bg-muted/50 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Observações do Cliente</p>
                  <p className="text-sm">{proposta.observacoes_cliente}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <TimelineLog 
            clienteId={proposta.cliente_id} 
            entidadeTipo="proposta"
            entidadeId={id}
          />
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Documentos anexados aparecerão aqui</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
