import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { AprovacaoKanban } from "@/components/AprovacaoKanban";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Eye } from "lucide-react";

export default function ClienteAprovacoes() {
  const { user } = useAuth();
  const { getProfileById } = useProfileData();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClienteData = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await getProfileById(user.id);
        if (profile && 'cliente_id' in profile && profile.cliente_id) {
          setClienteId(profile.cliente_id as string);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClienteData();
  }, [user?.id, getProfileById]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando aprovações...</p>
        </div>
      </div>
    );
  }

  if (!clienteId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Não foi possível encontrar os dados do cliente. 
              Entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            Central de Aprovações
          </h1>
          <p className="text-muted-foreground">
            Aprove ou reprove as tarefas e materiais da sua conta
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-sm font-medium text-yellow-800">Pendentes</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-800">Em Análise</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-sm font-medium text-green-800">Aprovadas</div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-sm font-medium text-red-800">Reprovadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <AprovacaoKanban clienteId={clienteId} />
    </div>
  );
}