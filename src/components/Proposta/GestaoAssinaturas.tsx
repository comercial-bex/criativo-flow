import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { smartToast } from "@/lib/smart-toast";
import { Plus, Mail, Link2, Trash2, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GestaoAssinaturasProps {
  propostaId: string;
}

const statusIcons = {
  pendente: Clock,
  enviado: Mail,
  assinado: CheckCircle2,
  recusado: XCircle,
};

const statusColors = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  enviado: "bg-info/10 text-info border-info/20",
  assinado: "bg-success/10 text-success border-success/20",
  recusado: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
  pendente: "Pendente",
  enviado: "Aguardando",
  assinado: "Assinado",
  recusado: "Recusado",
};

export function GestaoAssinaturas({ propostaId }: GestaoAssinaturasProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome_assinante: "",
    email_assinante: "",
    cargo: "",
  });
  const queryClient = useQueryClient();

  const { data: assinaturas = [], isLoading } = useQuery({
    queryKey: ["proposta_assinaturas", propostaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposta_assinaturas")
        .select("*")
        .eq("proposta_id", propostaId)
        .order("created_at");

      if (error) throw error;
      return data || [];
    },
  });

  const adicionarAssinante = useMutation({
    mutationFn: async (dados: any) => {
      const { error } = await supabase
        .from("proposta_assinaturas")
        .insert({
          proposta_id: propostaId,
          ...dados,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposta_assinaturas", propostaId] });
      smartToast.success("Assinante adicionado com sucesso!");
      setDialogOpen(false);
      setFormData({ nome_assinante: "", email_assinante: "", cargo: "" });
    },
    onError: (error: any) => {
      smartToast.error("Erro ao adicionar assinante", error.message);
    },
  });

  const removerAssinante = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("proposta_assinaturas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposta_assinaturas", propostaId] });
      smartToast.success("Assinante removido!");
    },
    onError: (error: any) => {
      smartToast.error("Erro ao remover assinante", error.message);
    },
  });

  const enviarConvite = useMutation({
    mutationFn: async (assinatura: any) => {
      // Atualizar status para enviado
      const { error } = await supabase
        .from("proposta_assinaturas")
        .update({ 
          status: "enviado",
          data_envio: new Date().toISOString(),
        })
        .eq("id", assinatura.id);

      if (error) throw error;

      // Aqui você pode adicionar lógica para enviar email
      const linkAssinatura = `${window.location.origin}/public/proposta-assinatura/${assinatura.token_assinatura}`;
      
      return linkAssinatura;
    },
    onSuccess: (linkAssinatura) => {
      queryClient.invalidateQueries({ queryKey: ["proposta_assinaturas", propostaId] });
      navigator.clipboard.writeText(linkAssinatura);
      smartToast.success("Convite enviado! Link copiado para área de transferência.");
    },
    onError: (error: any) => {
      smartToast.error("Erro ao enviar convite", error.message);
    },
  });

  const copiarLink = (token: string) => {
    const link = `${window.location.origin}/public/proposta-assinatura/${token}`;
    navigator.clipboard.writeText(link);
    smartToast.success("Link copiado!");
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Assinaturas</h3>
          <p className="text-sm text-muted-foreground">
            {assinaturas.length} {assinaturas.length === 1 ? 'assinante' : 'assinantes'}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Assinante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Assinante</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              adicionarAssinante.mutate(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome_assinante}
                  onChange={(e) => setFormData({ ...formData, nome_assinante: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email_assinante}
                  onChange={(e) => setFormData({ ...formData, email_assinante: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Diretor Comercial"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={adicionarAssinante.isPending}>
                  Adicionar
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {assinaturas.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum assinante adicionado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione assinantes para coletar assinaturas digitais
            </p>
          </Card>
        ) : (
          assinaturas.map((assinatura: any) => {
            const StatusIcon = statusIcons[assinatura.status as keyof typeof statusIcons];
            
            return (
              <Card key={assinatura.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{assinatura.nome_assinante}</CardTitle>
                      <p className="text-sm text-muted-foreground">{assinatura.email_assinante}</p>
                      {assinatura.cargo && (
                        <p className="text-xs text-muted-foreground mt-1">{assinatura.cargo}</p>
                      )}
                    </div>
                    <Badge className={statusColors[assinatura.status as keyof typeof statusColors]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusLabels[assinatura.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {assinatura.data_visualizacao && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        Visualizado em {format(new Date(assinatura.data_visualizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    )}
                    
                    {assinatura.data_assinatura && (
                      <div className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Assinado em {format(new Date(assinatura.data_assinatura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {assinatura.ip_assinatura && ` (IP: ${assinatura.ip_assinatura})`}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {assinatura.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => enviarConvite.mutate(assinatura)}
                          disabled={enviarConvite.isPending}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Enviar Convite
                        </Button>
                      )}
                      
                      {(assinatura.status === 'enviado' || assinatura.status === 'pendente') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copiarLink(assinatura.token_assinatura)}
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Copiar Link
                        </Button>
                      )}
                      
                      {assinatura.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Remover ${assinatura.nome_assinante}?`)) {
                              removerAssinante.mutate(assinatura.id);
                            }
                          }}
                          disabled={removerAssinante.isPending}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
