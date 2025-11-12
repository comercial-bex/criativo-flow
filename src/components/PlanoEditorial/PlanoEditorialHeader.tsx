import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface PlanoEditorialHeaderProps {
  planejamento: any;
  onUpdate: () => void;
}

export function PlanoEditorialHeader({ planejamento, onUpdate }: PlanoEditorialHeaderProps) {
  const [statusPlano, setStatusPlano] = useState(planejamento.status_plano || 'em_andamento');

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('planejamentos')
        .update({ status_plano: newStatus })
        .eq('id', planejamento.id);

      if (error) throw error;
      setStatusPlano(newStatus);
      toast.success('Status atualizado com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      em_andamento: { label: 'Em Andamento', icon: Clock, color: 'bg-yellow-500' },
      em_revisao: { label: 'Em Revisão', icon: AlertCircle, color: 'bg-blue-500' },
      aprovado: { label: 'Aprovado', icon: CheckCircle, color: 'bg-green-500' }
    };
    const config = configs[status as keyof typeof configs] || configs.em_andamento;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="mx-6 mt-4 p-6 rounded-2xl shadow-md bg-gradient-to-br from-background to-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Cliente</label>
          <p className="text-lg font-bold text-foreground mt-1">
            {planejamento.clientes?.nome || 'Sem cliente'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período
          </label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Responsável
          </label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {planejamento.responsavel?.nome || 'Não atribuído'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <div className="mt-1">
            <Select value={statusPlano} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Em Andamento
                  </div>
                </SelectItem>
                <SelectItem value="em_revisao">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Em Revisão
                  </div>
                </SelectItem>
                <SelectItem value="aprovado">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Aprovado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Data de Criação: {new Date(planejamento.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        {getStatusBadge(statusPlano)}
      </div>
    </Card>
  );
}
