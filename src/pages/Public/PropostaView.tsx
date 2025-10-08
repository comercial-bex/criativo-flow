import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Eye, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PropostaView() {
  const { link_publico } = useParams();
  const [proposta, setProposta] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProposta();
  }, [link_publico]);

  const loadProposta = async () => {
    try {
      const { data, error } = await supabase
        .from("propostas")
        .select(`
          *,
          clientes (nome, cnpj_cpf, email, telefone),
          proposta_itens (*)
        `)
        .eq("link_publico", link_publico)
        .single();

      if (error) throw error;

      setProposta(data);
      setItens(data.proposta_itens || []);

      // Registrar visualização
      if (!data.visualizado_em) {
        await supabase
          .from("propostas")
          .update({ visualizado_em: new Date().toISOString() })
          .eq("id", data.id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar proposta:", error);
      toast.error("Proposta não encontrada");
      setLoading(false);
    }
  };

  const handleAceitar = async () => {
    if (!proposta) return;
    
    setProcessing(true);
    try {
      // Atualizar status da proposta
      await supabase
        .from("propostas")
        .update({
          assinatura_status: "assinado",
          assinatura_data: new Date().toISOString(),
        })
        .eq("id", proposta.id);

      // Criar log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: proposta.cliente_id,
        p_usuario_id: proposta.responsavel_id,
        p_acao: "aceitar",
        p_entidade_tipo: "proposta",
        p_entidade_id: proposta.id,
        p_descricao: `Proposta ${proposta.numero} aceita pelo cliente`,
        p_metadata: { link_publico },
      });

      toast.success("✅ Proposta aceita com sucesso!");
      loadProposta();
    } catch (error) {
      console.error("Erro ao aceitar proposta:", error);
      toast.error("Erro ao processar aceite");
    } finally {
      setProcessing(false);
    }
  };

  const handleRecusar = async () => {
    if (!proposta || !motivo.trim()) {
      toast.error("Por favor, informe o motivo da recusa");
      return;
    }

    setProcessing(true);
    try {
      await supabase
        .from("propostas")
        .update({
          assinatura_status: "recusado",
          observacoes_cliente: motivo,
        })
        .eq("id", proposta.id);

      // Criar log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: proposta.cliente_id,
        p_usuario_id: proposta.responsavel_id,
        p_acao: "recusar",
        p_entidade_tipo: "proposta",
        p_entidade_id: proposta.id,
        p_descricao: `Proposta ${proposta.numero} recusada pelo cliente`,
        p_metadata: { motivo, link_publico },
      });

      toast.success("Proposta recusada");
      loadProposta();
    } catch (error) {
      console.error("Erro ao recusar proposta:", error);
      toast.error("Erro ao processar recusa");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Proposta não encontrada</CardTitle>
            <CardDescription>
              O link pode estar inválido ou a proposta foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusColor = {
    pendente: "bg-yellow-500/10 text-yellow-500",
    assinado: "bg-green-500/10 text-green-500",
    recusado: "bg-red-500/10 text-red-500",
  }[proposta.assinatura_status] || "bg-gray-500/10 text-gray-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">
                  {proposta.titulo}
                </CardTitle>
                <CardDescription className="text-base">
                  {proposta.clientes?.nome}
                </CardDescription>
              </div>
              <Badge className={statusColor} variant="outline">
                {proposta.assinatura_status === "assinado" && <CheckCircle2 className="w-4 h-4 mr-1" />}
                {proposta.assinatura_status === "recusado" && <XCircle className="w-4 h-4 mr-1" />}
                {proposta.assinatura_status === "pendente" && <Eye className="w-4 h-4 mr-1" />}
                {proposta.assinatura_status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-semibold">{proposta.numero}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Validade</p>
                  <p className="font-semibold">
                    {proposta.validade
                      ? format(new Date(proposta.validade), "dd/MM/yyyy", { locale: ptBR })
                      : "Indefinida"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(proposta.total || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Itens da Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itens.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantidade} {item.unidade}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.subtotal_item || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.preco_unitario || 0)}{" "}
                        / {item.unidade}
                      </p>
                    </div>
                  </div>
                  {idx < itens.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(proposta.subtotal || 0)}
                </span>
              </div>
              {(proposta.descontos || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descontos</span>
                  <span>
                    -
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(proposta.descontos || 0)}
                  </span>
                </div>
              )}
              {(proposta.impostos || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Impostos</span>
                  <span>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(proposta.impostos || 0)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(proposta.total || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condições de Pagamento */}
        {proposta.condicoes_pagamento && (
          <Card>
            <CardHeader>
              <CardTitle>Condições de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{proposta.condicoes_pagamento}</p>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        {proposta.assinatura_status === "pendente" && (
          <Card>
            <CardHeader>
              <CardTitle>Responder à Proposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleAceitar}
                  disabled={processing}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Aceitar Proposta
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Ou informe o motivo da recusa:
                </label>
                <Textarea
                  placeholder="Digite o motivo da recusa..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                />
                <Button
                  variant="destructive"
                  onClick={handleRecusar}
                  disabled={processing || !motivo.trim()}
                  className="w-full"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Recusar Proposta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {proposta.assinatura_status === "assinado" && (
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Proposta Aceita</p>
                  <p className="text-sm text-muted-foreground">
                    Aceita em{" "}
                    {format(new Date(proposta.assinatura_data), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {proposta.assinatura_status === "recusado" && (
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="w-6 h-6" />
                  <p className="font-semibold">Proposta Recusada</p>
                </div>
                {proposta.observacoes_cliente && (
                  <div className="pl-9">
                    <p className="text-sm text-muted-foreground">Motivo:</p>
                    <p className="text-sm">{proposta.observacoes_cliente}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
