import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Share, Signature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Orcamento {
  id: string;
  titulo: string;
  valor_final: number;
  cliente_nome?: string;
}

interface PropostaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento;
}

export function PropostaModal({ isOpen, onClose, orcamento }: PropostaModalProps) {
  const [formData, setFormData] = useState({
    titulo: `Proposta - ${orcamento.titulo}`,
  });
  const [loading, setLoading] = useState(false);
  const [propostaId, setPropostaId] = useState<string | null>(null);
  const [assinaturaStatus, setAssinaturaStatus] = useState("pendente");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGerarProposta = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("propostas")
        .insert({
          orcamento_id: orcamento.id,
          titulo: formData.titulo,
          responsavel_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPropostaId(data.id);
      toast({
        title: "Sucesso!",
        description: "Proposta criada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar proposta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPDF = async () => {
    if (!propostaId) {
      toast({
        title: "Erro",
        description: "Crie a proposta primeiro antes de gerar o PDF.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar dados completos da proposta
      const { data: propostaCompleta, error: propostaError } = await supabase
        .from("propostas")
        .select(`
          *,
          clientes (id, nome, email, telefone, cnpj_cpf, endereco),
          proposta_itens (*)
        `)
        .eq("id", propostaId)
        .single();

      if (propostaError) throw propostaError;

      // Buscar dados da empresa
      const { data: empresa } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .single();

      // Importação dinâmica para reduzir bundle
      const { downloadPropostaPDF } = await import("@/utils/propostaPdfGenerator");
      
      await downloadPropostaPDF({
        proposta: propostaCompleta,
        itens: propostaCompleta.proposta_itens || [],
        empresa: empresa || undefined,
        cliente: propostaCompleta.clientes || undefined,
      });

      toast({
        title: "PDF gerado com sucesso!",
        description: "O arquivo foi baixado automaticamente.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarAssinatura = async () => {
    if (!propostaId) {
      toast({
        title: "Erro",
        description: "Crie a proposta primeiro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Chamar edge function para iniciar processo de assinatura GOV.br
      const { data, error } = await supabase.functions.invoke("iniciar-assinatura-govbr", {
        body: { propostaId },
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Abrir URL de autenticação GOV.br em nova aba
        window.open(data.authUrl, "_blank");
        
        toast({
          title: "Redirecionando para GOV.br",
          description: "Complete a autenticação para assinar digitalmente.",
        });

        setAssinaturaStatus("processando");
      }
    } catch (error: any) {
      console.error("Erro ao enviar para assinatura:", error);
      toast({
        title: "Erro ao enviar para assinatura",
        description: "Funcionalidade em implementação. Por enquanto, use o PDF gerado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompartilhar = () => {
    if (propostaId) {
      navigator.clipboard.writeText(`${window.location.origin}/proposta/${propostaId}`);
      toast({
        title: "Link copiado!",
        description: "Link da proposta copiado para a área de transferência.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assinado": return "bg-green-100 text-green-800";
      case "enviado": return "bg-blue-100 text-blue-800";
      case "recusado": return "bg-red-100 text-red-800";
      case "expirado": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl" height="auto">
        <DialogHeader>
          <DialogTitle>Gerar Proposta Comercial</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do orçamento */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informações do Orçamento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Título:</span>
                <p className="font-medium">{orcamento.titulo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">{orcamento.cliente_nome}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Valor:</span>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(orcamento.valor_final)}
                </p>
              </div>
            </div>
          </div>

          {/* Formulário da proposta */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Proposta</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>
          </div>

          {/* Status da proposta */}
          {propostaId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status da Assinatura:</span>
                <Badge className={getStatusColor(assinaturaStatus)}>
                  {assinaturaStatus}
                </Badge>
              </div>

              {/* Ações da proposta */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGerarPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar PDF
                </Button>
                <Button variant="outline" onClick={handleCompartilhar}>
                  <Share className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
                <Button variant="outline" onClick={handleEnviarAssinatura}>
                  <Signature className="mr-2 h-4 w-4" />
                  Enviar p/ Assinatura
                </Button>
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {/* Informações de acompanhamento */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Acompanhamento</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>✅ Proposta criada</p>
                  <p>🔄 Aguardando geração de PDF</p>
                  <p>⏳ Aguardando envio para assinatura</p>
                </div>
              </div>
            </div>
          )}

          {/* Ações principais */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {!propostaId && (
              <Button onClick={handleGerarProposta} disabled={loading}>
                {loading ? "Criando..." : "Criar Proposta"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}