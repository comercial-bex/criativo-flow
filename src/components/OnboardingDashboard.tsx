import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { PlayCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';

interface OnboardingStatus {
  cliente_id: string;
  cliente_nome: string;
  status: 'não_iniciado' | 'em_andamento' | 'concluído';
  progresso: number;
  ultimo_step: number;
  data_inicio?: string;
  data_conclusao?: string;
}

export function OnboardingDashboard() {
  const [clientes, setClientes] = useState<OnboardingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<{ id: string; nome: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      // Buscar todos os clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (clientesError) throw clientesError;

      // Buscar dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('cliente_onboarding')
        .select('*');

      if (onboardingError) throw onboardingError;

      // Mapear status de cada cliente
      const statusList: OnboardingStatus[] = (clientesData || []).map(cliente => {
        const onboarding = onboardingData?.find(o => o.cliente_id === cliente.id);
        
        if (!onboarding) {
          return {
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            status: 'não_iniciado',
            progresso: 0,
            ultimo_step: 0
          };
        }

        // Calcular progresso baseado nos campos preenchidos
        let step = 0;
        let progress = 0;

        // Step 1: Empresa
        if (onboarding.segmento_atuacao && onboarding.produtos_servicos) {
          step = 1;
          progress = 16.67;
        }

        // Step 2: Público
        if (onboarding.publico_alvo?.length && onboarding.dores_problemas) {
          step = 2;
          progress = 33.33;
        }

        // Step 3: Digital
        if (onboarding.presenca_digital?.length && onboarding.tipos_conteudo?.length) {
          step = 3;
          progress = 50;
        }

        // Step 4: SWOT
        if (onboarding.forcas && onboarding.fraquezas && onboarding.oportunidades && onboarding.ameacas) {
          step = 4;
          progress = 66.67;
        }

        // Step 5: Objetivos
        if (onboarding.objetivos_digitais && onboarding.onde_6_meses && onboarding.resultados_esperados?.length) {
          step = 5;
          progress = 83.33;
        }

        // Step 6: Marca
        if (onboarding.valores_principais && onboarding.tom_voz?.length && onboarding.como_lembrada) {
          step = 6;
          progress = 85.71;
        }

        // Step 7: Plano
        if (onboarding.duracao_contrato_meses && onboarding.areas_foco?.length) {
          step = 7;
          progress = 100;
        }

        const status = progress === 100 ? 'concluído' : progress > 0 ? 'em_andamento' : 'não_iniciado';

        return {
          cliente_id: cliente.id,
          cliente_nome: cliente.nome,
          status,
          progresso: progress,
          ultimo_step: step,
          data_inicio: onboarding.created_at,
          data_conclusao: progress === 100 ? onboarding.updated_at : undefined
        };
      });

      setClientes(statusList);
    } catch (error) {
      console.error('Erro ao carregar status de onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnboarding = (cliente: { id: string; nome: string }) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const getStatusIcon = (status: OnboardingStatus['status']) => {
    switch (status) {
      case 'concluído':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'em_andamento':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: OnboardingStatus['status']) => {
    switch (status) {
      case 'concluído':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case 'em_andamento':
        return <Badge variant="default" className="bg-yellow-500">Em Andamento</Badge>;
      default:
        return <Badge variant="outline">Não Iniciado</Badge>;
    }
  };

  const stats = {
    total: clientes.length,
    concluidos: clientes.filter(c => c.status === 'concluído').length,
    emAndamento: clientes.filter(c => c.status === 'em_andamento').length,
    naoIniciados: clientes.filter(c => c.status === 'não_iniciado').length
  };

  const taxaConclusao = stats.total > 0 ? (stats.concluidos / stats.total) * 100 : 0;

  if (loading) {
    return <div className="p-6 animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Clientes</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Concluídos</CardDescription>
            <CardTitle className="text-3xl text-green-500">{stats.concluidos}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Em Andamento</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">{stats.emAndamento}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Conclusão</CardDescription>
            <CardTitle className="text-3xl">{taxaConclusao.toFixed(0)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Onboarding por Cliente</CardTitle>
          <CardDescription>
            Acompanhe o progresso do onboarding de cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <div
                key={cliente.cliente_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(cliente.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{cliente.cliente_nome}</h4>
                        {getStatusBadge(cliente.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {cliente.progresso.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={cliente.progresso} className="h-2" />
                    {cliente.status !== 'não_iniciado' && (
                      <p className="text-xs text-muted-foreground">
                        Último passo concluído: Etapa {cliente.ultimo_step} de 7
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={cliente.status === 'não_iniciado' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStartOnboarding({ id: cliente.cliente_id, nome: cliente.cliente_nome })}
                  className="ml-4"
                >
                  {cliente.status === 'não_iniciado' ? (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Iniciar
                    </>
                  ) : (
                    <>Continuar</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Onboarding */}
      {selectedCliente && (
        <OnboardingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          clienteId={selectedCliente.id}
          clienteNome={selectedCliente.nome}
          onComplete={() => {
            loadOnboardingStatus();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
