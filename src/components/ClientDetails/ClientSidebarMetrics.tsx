import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, 
  Mail, 
  Building, 
  MapPin,
  DollarSign,
  FolderKanban,
  Receipt
} from "lucide-react";

interface ClientSidebarMetricsProps {
  clienteId: string;
}

export function ClientSidebarMetrics({ clienteId }: ClientSidebarMetricsProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['client-metrics', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_client_metrics')
        .select('*')
        .eq('cliente_id', clienteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  const getInitials = (nome: string) => {
    return nome
      ?.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '??';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-muted/30 p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-80 border-r bg-muted/30 p-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <Card className="w-80 rounded-none border-r border-t-0 border-b-0 border-l-0 shadow-none">
      <CardContent className="p-6 flex flex-col gap-6">
        {/* Avatar e Info Principal */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={metrics.logo_url} />
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {getInitials(metrics.nome)}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center w-full">
            <h2 className="font-bold text-lg line-clamp-2" title={metrics.nome}>
              {metrics.nome}
            </h2>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(metrics.status)}`}
            >
              {metrics.status}
            </Badge>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-3 text-sm border-t pt-4">
          {metrics.telefone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{metrics.telefone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{metrics.responsavel_nome || 'Sem responsável'}</span>
          </div>

          {metrics.assinatura_nome && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{metrics.assinatura_nome}</span>
            </div>
          )}

          {metrics.endereco && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs line-clamp-2">{metrics.endereco}</span>
            </div>
          )}
        </div>

        {/* Métricas */}
        <div className="space-y-4 border-t pt-4">
          {/* Faturas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Faturas</span>
              </div>
              <span className="text-sm font-bold">
                R$ {Number(metrics.faturas_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress value={Number(metrics.pagamentos_percentual || 0)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Number(metrics.pagamentos_percentual || 0).toFixed(0)}% pago
            </p>
          </div>

          {/* Pagamentos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Pagamentos</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                R$ {Number(metrics.pagamentos_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Projetos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Projetos Ativos</span>
              </div>
              <span className="text-sm font-bold">
                {metrics.projetos_abertos || 0}
              </span>
            </div>
          </div>

          {/* Total de Projetos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Projetos</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {metrics.projetos_totais || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
