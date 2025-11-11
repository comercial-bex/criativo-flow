import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Mail, AlertCircle, FileSignature } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AssinaturasDashboardProps {
  propostaId: string;
  onConverterContrato?: () => void;
}

export function AssinaturasDashboard({ propostaId, onConverterContrato }: AssinaturasDashboardProps) {
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

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando...</div>;
  }

  const total = assinaturas.length;
  const assinadas = assinaturas.filter(a => a.status === 'assinado').length;
  const pendentes = assinaturas.filter(a => a.status === 'pendente').length;
  const enviadas = assinaturas.filter(a => a.status === 'enviado').length;
  const recusadas = assinaturas.filter(a => a.status === 'recusado').length;
  
  const progresso = total > 0 ? (assinadas / total) * 100 : 0;
  const todasAssinadas = total > 0 && assinadas === total;

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progresso de Assinaturas</span>
            <span className="text-sm font-normal text-muted-foreground">
              {assinadas}/{total} concluídas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progresso} className="h-3" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">
                <span className="font-bold">{assinadas}</span> Assinadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-info" />
              <span className="text-sm">
                <span className="font-bold">{enviadas}</span> Enviadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm">
                <span className="font-bold">{pendentes}</span> Pendentes
              </span>
            </div>
            {recusadas > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm">
                  <span className="font-bold">{recusadas}</span> Recusadas
                </span>
              </div>
            )}
          </div>

          {todasAssinadas && onConverterContrato && (
            <div className="pt-4 border-t">
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg mb-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-success">Proposta totalmente assinada!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todas as assinaturas foram coletadas. Você pode converter em contrato agora.
                  </p>
                </div>
              </div>
              <Button onClick={onConverterContrato} className="w-full">
                <FileSignature className="w-4 h-4 mr-2" />
                Converter em Contrato
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {assinaturas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma assinatura registrada
            </p>
          ) : (
            <div className="space-y-4">
              {assinaturas.map((assinatura: any, index: number) => {
                const StatusIcon = assinatura.status === 'assinado' ? CheckCircle2 :
                                 assinatura.status === 'recusado' ? XCircle :
                                 assinatura.status === 'enviado' ? Mail : Clock;
                
                const statusColor = assinatura.status === 'assinado' ? 'text-success' :
                                  assinatura.status === 'recusado' ? 'text-destructive' :
                                  assinatura.status === 'enviado' ? 'text-info' : 'text-warning';
                
                const diasPendente = assinatura.data_envio && assinatura.status === 'enviado'
                  ? differenceInDays(new Date(), new Date(assinatura.data_envio))
                  : 0;
                
                return (
                  <div key={assinatura.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-2 ${statusColor} bg-muted`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      {index < assinaturas.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium">{assinatura.nome_assinante}</p>
                          <p className="text-sm text-muted-foreground">{assinatura.email_assinante}</p>
                          {assinatura.cargo && (
                            <p className="text-xs text-muted-foreground mt-0.5">{assinatura.cargo}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={statusColor}>
                          {assinatura.status === 'assinado' && 'Assinado'}
                          {assinatura.status === 'recusado' && 'Recusado'}
                          {assinatura.status === 'enviado' && 'Aguardando'}
                          {assinatura.status === 'pendente' && 'Pendente'}
                        </Badge>
                      </div>
                      
                      {assinatura.data_assinatura && (
                        <p className="text-xs text-muted-foreground">
                          ✅ Assinado em {format(new Date(assinatura.data_assinatura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                      
                      {assinatura.status === 'enviado' && diasPendente > 3 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-warning">
                          <AlertCircle className="w-3 h-3" />
                          Aguardando há {diasPendente} dias
                        </div>
                      )}
                      
                      {assinatura.observacoes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          "{assinatura.observacoes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
