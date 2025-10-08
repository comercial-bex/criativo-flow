import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Edit,
  Upload,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";

interface TimelineLogProps {
  clienteId: string;
  entidadeTipo?: string;
  entidadeId?: string;
}

const iconMap: Record<string, any> = {
  insert: FileText,
  update: Edit,
  delete: XCircle,
  aceitar: CheckCircle,
  recusar: XCircle,
  enviar: Send,
  upload: Upload,
  gerar_faturas: DollarSign,
  assinar: CheckCircle,
  finalizar: CheckCircle,
  criar: FileText,
  convidar: Users,
};

const colorMap: Record<string, string> = {
  insert: "text-blue-500",
  update: "text-orange-500",
  delete: "text-red-500",
  aceitar: "text-green-500",
  recusar: "text-red-500",
  enviar: "text-blue-500",
  upload: "text-purple-500",
  gerar_faturas: "text-green-500",
  assinar: "text-green-500",
  finalizar: "text-green-500",
  criar: "text-blue-500",
  convidar: "text-cyan-500",
};

export function TimelineLog({ clienteId, entidadeTipo, entidadeId }: TimelineLogProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["logs_atividade", clienteId, entidadeTipo, entidadeId],
    queryFn: async () => {
      let query = supabase
        .from("logs_atividade")
        .select(`
          *,
          profiles:usuario_id (nome, avatar_url)
        `)
        .eq("cliente_id", clienteId)
        .order("data_hora", { ascending: false });

      if (entidadeTipo) {
        query = query.eq("entidade_tipo", entidadeTipo);
      }

      if (entidadeId) {
        query = query.eq("entidade_id", entidadeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando histórico...</div>;
  }

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma atividade registrada ainda</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {logs.map((log: any) => {
          const Icon = iconMap[log.acao] || FileText;
          const colorClass = colorMap[log.acao] || "text-gray-500";

          return (
            <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className={`mt-1 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{log.descricao}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {log.profiles?.nome && (
                          <span className="font-medium">{log.profiles.nome}</span>
                        )}
                        <span>•</span>
                        <time>
                          {format(new Date(log.data_hora), "dd 'de' MMMM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
