import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Shield,
  Heart,
  Lightbulb,
  Users,
  Palette,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  endereco: string;
  status: string;
  created_at: string;
}

interface ClienteOnboarding {
  nome_empresa: string;
  segmento_atuacao: string;
  produtos_servicos: string;
  tempo_mercado: string;
  localizacao: string;
  estrutura_atual: string;
  canais_contato: string;
  concorrentes_diretos: string;
  diferenciais: string;
  fatores_crise: string;
  area_atendimento: string;
  tipos_clientes: string;
  midia_tradicional: string[];
  objetivos_digitais: string;
  forcas: string;
  fraquezas: string;
  ameacas: string;
  oportunidades: string;
  publico_alvo: string[];
  publico_alvo_outros: string;
  dores_problemas: string;
  valorizado: string;
  frequencia_compra: string;
  ticket_medio: string;
  como_encontram: string[];
  tom_voz: string[];
  valores_principais: string;
  historia_marca: string;
  como_lembrada: string;
  presenca_digital: string[];
  presenca_digital_outros: string;
  tipos_conteudo: string[];
  frequencia_postagens: string;
  relacionamento_clientes: string[];
  canais_atendimento_ativos: string;
  midia_paga: string;
  feiras_eventos: string;
  equipe_vendas_externa: string;
  resultados_esperados: string[];
  onde_6_meses: string;
  materiais_impressos: string[];
  forma_aquisicao: string[];
}

const PerfilCliente: React.FC = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [onboarding, setOnboarding] = useState<ClienteOnboarding | null>(null);

  useEffect(() => {
    if (clienteId) {
      fetchClienteData();
    }
  }, [clienteId]);

  const fetchClienteData = async () => {
    try {
      setLoading(true);

      // Buscar dados do cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (clienteError) throw clienteError;
      setCliente(clienteData);

      // Buscar dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        console.error('Erro ao buscar onboarding:', onboardingError);
      } else {
        setOnboarding(onboardingData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Cliente não encontrado</h3>
            <Button onClick={() => navigate('/clientes')}>
              Voltar para Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{cliente.nome}</h1>
          <p className="text-muted-foreground">Perfil completo do cliente</p>
        </div>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.telefone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.cnpj_cpf}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.endereco}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cliente.status === 'ativo' ? 'default' : 'secondary'}>
                {cliente.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!onboarding ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Onboarding não realizado</h3>
            <p className="text-muted-foreground mb-4">
              Este cliente ainda não completou o processo de onboarding
            </p>
            <Button>
              Iniciar Onboarding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Nome da Empresa</h4>
                  <p>{onboarding.nome_empresa}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Segmento de Atuação</h4>
                  <p>{onboarding.segmento_atuacao}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Tempo no Mercado</h4>
                  <p>{onboarding.tempo_mercado}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Localização</h4>
                  <p>{onboarding.localizacao}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Produtos e Serviços</h4>
                <p className="text-sm">{onboarding.produtos_servicos}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Diferenciais</h4>
                <p className="text-sm">{onboarding.diferenciais}</p>
              </div>
            </CardContent>
          </Card>

          {/* Análise SWOT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análise SWOT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      Forças
                    </h4>
                    <p className="text-sm text-green-700">{onboarding.forcas}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4" />
                      Oportunidades
                    </h4>
                    <p className="text-sm text-blue-700">{onboarding.oportunidades}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Fraquezas
                    </h4>
                    <p className="text-sm text-yellow-700">{onboarding.fraquezas}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Ameaças
                    </h4>
                    <p className="text-sm text-red-700">{onboarding.ameacas}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Público-Alvo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Público-Alvo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Perfis de Público</h4>
                <div className="flex flex-wrap gap-2">
                  {onboarding.publico_alvo?.map((perfil, index) => (
                    <Badge key={index} variant="outline">{perfil}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dores e Problemas</h4>
                <p className="text-sm">{onboarding.dores_problemas}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">O que é Valorizado</h4>
                <p className="text-sm">{onboarding.valorizado}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Frequência de Compra</h4>
                  <p>{onboarding.frequencia_compra}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Ticket Médio</h4>
                  <p>{onboarding.ticket_medio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identidade da Marca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Identidade da Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">História da Marca</h4>
                <p className="text-sm">{onboarding.historia_marca}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Valores Principais</h4>
                <p className="text-sm">{onboarding.valores_principais}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tom de Voz</h4>
                <div className="flex flex-wrap gap-2">
                  {onboarding.tom_voz?.map((tom, index) => (
                    <Badge key={index} variant="secondary">{tom}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Como quer ser lembrada</h4>
                <p className="text-sm">{onboarding.como_lembrada}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estratégia Digital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Estratégia Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Presença Digital</h4>
                <div className="flex flex-wrap gap-2">
                  {onboarding.presenca_digital?.map((canal, index) => (
                    <Badge key={index} variant="outline">{canal}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tipos de Conteúdo</h4>
                <div className="flex flex-wrap gap-2">
                  {onboarding.tipos_conteudo?.map((tipo, index) => (
                    <Badge key={index} variant="secondary">{tipo}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Frequência de Postagens</h4>
                <p>{onboarding.frequencia_postagens}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Objetivos Digitais</h4>
                <p className="text-sm">{onboarding.objetivos_digitais}</p>
              </div>
            </CardContent>
          </Card>

          {/* Resultados Esperados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resultados Esperados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Expectativas</h4>
                <div className="flex flex-wrap gap-2">
                  {onboarding.resultados_esperados?.map((resultado, index) => (
                    <Badge key={index} variant="default">{resultado}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Onde quer estar em 6 meses</h4>
                <p className="text-sm">{onboarding.onde_6_meses}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PerfilCliente;