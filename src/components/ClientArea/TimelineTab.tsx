import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  FileSignature, 
  DollarSign,
  Lock,
  Eye,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";

interface TimelineTabProps {
  clienteId: string;
  projetoId?: string;
}

interface LogAtividade {
  id: string;
  acao: string;
  entidade_tipo: string;
  entidade_id: string;
  descricao: string;
  data_hora: string;
  metadata: any;
  profiles?: {
    nome: string;
  };
}

const ENTITY_ICONS = {
  credenciais_cliente: Lock,
  arquivo: FileText,
  projeto: FolderOpen,
  aprovacao: CheckCircle,
  contrato: FileSignature,
  fatura: DollarSign,
  tarefa: FileText,
} as const;

const ACTION_ICONS = {
  insert: Plus,
  update: Pencil,
  delete: Trash2,
  reveal: Eye,
  aprovado: CheckCircle,
} as const;

const ACTION_COLORS = {
  insert: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  reveal: "bg-yellow-100 text-yellow-700",
  aprovado: "bg-green-100 text-green-700",
} as const;

export function TimelineTab({ clienteId, projetoId }: TimelineTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs', clienteId, projetoId, debouncedSearch, page],
    queryFn: async () => {
      let query = supabase
        .from('logs_atividade')
        .select(`
          *,
          profiles:usuario_id(nome)
        `)
        .eq('cliente_id', clienteId)
        .order('data_hora', { ascending: false })
        .range(page * 20, (page + 1) * 20 - 1);

      if (projetoId) {
        query = query.eq('metadata->>projeto_id', projetoId);
      }

      if (debouncedSearch) {
        query = query.or(`descricao.ilike.%${debouncedSearch}%,entidade_tipo.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LogAtividade[];
    },
  });

  const getEntityIcon = (tipo: string) => {
    const Icon = ENTITY_ICONS[tipo as keyof typeof ENTITY_ICONS] || FileText;
    return Icon;
  };

  const getActionIcon = (acao: string) => {
    const Icon = ACTION_ICONS[acao as keyof typeof ACTION_ICONS] || Pencil;
    return Icon;
  };

  const getActionColor = (acao: string) => {
    return ACTION_COLORS[acao as keyof typeof ACTION_COLORS] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar na linha do tempo..."
          className="pl-10"
        />
      </div>

      {/* Timeline Items */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando atividades...</p>
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const EntityIcon = getEntityIcon(log.entidade_tipo);
            const ActionIcon = getActionIcon(log.acao);
            const actionColor = getActionColor(log.acao);

            return (
              <div 
                key={log.id} 
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <EntityIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={actionColor}>
                        <ActionIcon className="h-3 w-3 mr-1" />
                        {log.acao}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {log.entidade_tipo.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.data_hora), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <p className="text-sm mb-2">{log.descricao}</p>

                  {/* Metadata */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {log.metadata.plataforma && (
                        <span className="px-2 py-1 bg-muted rounded">
                          📱 {log.metadata.plataforma}
                        </span>
                      )}
                      {log.metadata.motivo && (
                        <span className="px-2 py-1 bg-warning/10 rounded">
                          💡 {log.metadata.motivo}
                        </span>
                      )}
                    </div>
                  )}

                  {/* User */}
                  {log.profiles && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {log.profiles.nome?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {log.profiles.nome}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {logs.length === 20 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
