import { useParams, useNavigate } from "react-router-dom";
import { useContracts } from "@/hooks/useContracts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  FileSignature, 
  DollarSign, 
  FileCheck,
  Building,
  Calendar,
  FileText
} from "lucide-react";
import { StatusWorkflow } from "@/components/Admin/StatusWorkflow";
import { TimelineLog } from "@/components/Admin/TimelineLog";
import { FaturasList } from "@/components/Admin/FaturasList";
import { UploadPDF } from "@/components/Admin/UploadPDF";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { useState } from "react";

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  enviado: "bg-info/10 text-info border-info/20",
  assinado: "bg-warning/10 text-warning border-warning/20",
  vigente: "bg-success/10 text-success border-success/20",
  cancelado: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  assinado: "Assinado",
  vigente: "Vigente",
  cancelado: "Cancelado",
};

export default function ContratoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contracts, loading, updateStatus, uploadContractFile, gerarFaturas } = useContracts();
  const [uploading, setUploading] = useState(false);

  const contrato = contracts.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando contrato...</p>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Contrato não encontrado</p>
        <Button onClick={() => navigate("/admin/contratos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Contratos
        </Button>
      </div>
    );
  }

  const handleGerarFaturas = async () => {
    if (!id) return;
    
    try {
      await gerarFaturas(id);
      smartToast.success("Faturas geradas com sucesso!");
      
      // Log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: contrato.cliente_id,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: "gerar_faturas",
        p_entidade_tipo: "contrato",
        p_entidade_id: id,
        p_descricao: `Faturas geradas para contrato ${contrato.titulo}`,
        p_metadata: { contrato_id: id },
      });
    } catch (error: any) {
      smartToast.error("Erro ao gerar faturas", error.message);
    }
  };

  const handleUploadAssinado = async (file: File): Promise<string> => {
    if (!id) throw new Error("ID do contrato não encontrado");
    
    setUploading(true);
    try {
      const url = await uploadContractFile(file);
      
      await updateStatus({
        id,
        status: "vigente",
        arquivo_assinado_url: url,
      });

      // Log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: contrato.cliente_id,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: "upload",
        p_entidade_tipo: "contrato",
        p_entidade_id: id,
        p_descricao: "PDF assinado enviado - Contrato vigente",
        p_metadata: { arquivo_url: url },
      });

      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleEnviarAssinatura = async () => {
    if (!id) return;
    
    await updateStatus({ id, status: "enviado" });
    
    // Log
    await supabase.rpc("criar_log_atividade", {
      p_cliente_id: contrato.cliente_id,
      p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
      p_acao: "enviar",
      p_entidade_tipo: "contrato",
      p_entidade_id: id,
      p_descricao: "Contrato enviado para assinatura (GOV.br)",
      p_metadata: {},
    });

    smartToast.info("Integração com GOV.br em desenvolvimento");
  };

  const handleFinalizar = async () => {
    if (!id) return;
    
    await updateStatus({ id, status: "vigente" });
    smartToast.success("Contrato finalizado e vigente!");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/contratos")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{contrato.titulo}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {contrato.clientes && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {contrato.clientes.nome}
                </div>
              )}
              {contrato.data_inicio && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(contrato.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                  {contrato.data_fim && ` - ${format(new Date(contrato.data_fim), "dd/MM/yyyy", { locale: ptBR })}`}
                </div>
              )}
            </div>
          </div>
          <Badge className={statusColors[contrato.status]}>
            {statusLabels[contrato.status]}
          </Badge>
        </div>
      </div>

      {/* Status Workflow */}
      <Card className="p-6 mb-6">
        <StatusWorkflow currentStatus={contrato.status} type="contrato" />
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="escopo">Escopo & SLA</TabsTrigger>
          <TabsTrigger value="clausulas">Cláusulas</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Histórico</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="resumo">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tipo de Contrato</p>
                <p className="font-medium capitalize">{contrato.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={statusColors[contrato.status]}>
                  {statusLabels[contrato.status]}
                </Badge>
              </div>
              {contrato.valor_mensal && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Mensal</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(contrato.valor_mensal).toFixed(2)}
                  </p>
                </div>
              )}
              {contrato.valor_recorrente && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Recorrente</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(contrato.valor_recorrente).toFixed(2)}
                  </p>
                </div>
              )}
              {contrato.valor_avulso && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Avulso</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(contrato.valor_avulso).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {contrato.descricao && (
              <>
                <Separator className="my-6" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                  <p className="text-sm whitespace-pre-wrap">{contrato.descricao}</p>
                </div>
              </>
            )}

            <Separator className="my-6" />

            <div className="flex gap-3">
              <Button onClick={() => navigate(`/admin/contratos/${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Contrato
              </Button>
              
              {contrato.status === "rascunho" && (
                <Button variant="outline" onClick={handleEnviarAssinatura}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Enviar para Assinatura
                </Button>
              )}

              {contrato.status === "assinado" && (
                <Button variant="outline" onClick={handleFinalizar}>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Finalizar Contrato
                </Button>
              )}

              {(contrato.status === "vigente" || contrato.status === "assinado") && (
                <Button variant="outline" onClick={handleGerarFaturas}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Gerar Faturas
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Escopo & SLA */}
        <TabsContent value="escopo">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Escopo do Projeto & SLA</h3>
            <p className="text-muted-foreground">
              Informações de escopo serão exibidas aqui (a ser implementado na próxima iteração)
            </p>
          </Card>
        </TabsContent>

        {/* Cláusulas */}
        <TabsContent value="clausulas">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cláusulas Contratuais</h3>
            <p className="text-muted-foreground">
              Cláusulas do contrato serão exibidas aqui (a ser implementado)
            </p>
          </Card>
        </TabsContent>

        {/* Comercial */}
        <TabsContent value="comercial">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Comerciais</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {contrato.valor_mensal && (
                  <Card className="p-4 bg-primary/5">
                    <p className="text-sm text-muted-foreground mb-1">Valor Mensal</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {Number(contrato.valor_mensal).toFixed(2)}
                    </p>
                  </Card>
                )}
                {contrato.valor_recorrente && (
                  <Card className="p-4 bg-success/5">
                    <p className="text-sm text-muted-foreground mb-1">Valor Recorrente</p>
                    <p className="text-2xl font-bold text-success">
                      R$ {Number(contrato.valor_recorrente).toFixed(2)}
                    </p>
                  </Card>
                )}
                {contrato.valor_avulso && (
                  <Card className="p-4 bg-info/5">
                    <p className="text-sm text-muted-foreground mb-1">Valor Avulso</p>
                    <p className="text-2xl font-bold text-info">
                      R$ {Number(contrato.valor_avulso).toFixed(2)}
                    </p>
                  </Card>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                {contrato.data_inicio && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
                    <p className="font-medium">
                      {format(new Date(contrato.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {contrato.data_fim && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data de Término</p>
                    <p className="font-medium">
                      {format(new Date(contrato.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Faturas */}
        <TabsContent value="faturas">
          <FaturasList contratoId={id!} clienteId={contrato.cliente_id} />
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <div className="space-y-6">
            {contrato.arquivo_url && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contrato Original
                </h3>
                <a
                  href={contrato.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visualizar documento
                </a>
              </Card>
            )}

            {contrato.arquivo_assinado_url ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-success" />
                  Contrato Assinado
                </h3>
                <a
                  href={contrato.arquivo_assinado_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visualizar documento assinado
                </a>
                {contrato.assinado_em && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Assinado em: {format(new Date(contrato.assinado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </Card>
            ) : contrato.status === "assinado" || contrato.status === "enviado" ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload do Contrato Assinado</h3>
                <UploadPDF
                  onUpload={handleUploadAssinado}
                  label="Anexar PDF Assinado"
                  accept=".pdf"
                  maxSizeMB={10}
                />
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <TimelineLog 
            clienteId={contrato.cliente_id} 
            entidadeTipo="contrato"
            entidadeId={id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
