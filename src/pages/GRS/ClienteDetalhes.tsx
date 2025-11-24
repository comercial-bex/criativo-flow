import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClientData } from '@/hooks/useClientData';
import { useClienteOnboarding } from '@/hooks/useClienteOnboarding';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Target,
  Users,
  TrendingUp,
  Briefcase,
  Calendar,
  ArrowLeft,
  Edit,
  Globe,
  Shield,
  Zap,
  AlertTriangle,
  Heart
} from 'lucide-react';

export default function GRSClienteDetalhes() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { data: onboarding, isLoading: loadingOnboarding } = useClienteOnboarding(clienteId);

  // Buscar dados do cliente
  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId
  });

  if (loadingCliente || loadingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clienteId || !cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button onClick={() => navigate('/grs/clientes')} className="mt-4" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'ativo': return 'default';
      case 'inativo': return 'secondary';
      case 'suspenso': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/grs/clientes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-bex-green" />
              {cliente.nome}
            </h1>
            <p className="text-muted-foreground mt-1">
              Informações completas do cliente
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge variant={getStatusColor(cliente.status || 'ativo')}>
            {cliente.status || 'ativo'}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Informações Básicas */}
      <BexCard variant="gaming">
        <BexCardHeader>
          <BexCardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-bex-green" />
            Informações Básicas
          </BexCardTitle>
        </BexCardHeader>
        <BexCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliente.cnpj_cpf && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ/CPF</p>
                  <p className="font-medium">{cliente.cnpj_cpf}</p>
                </div>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              </div>
            )}
            {cliente.endereco && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{cliente.endereco}</p>
                </div>
              </div>
            )}
          </div>
        </BexCardContent>
      </BexCard>

      {/* Tabs com Onboarding e Detalhes */}
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
        </TabsList>

        {/* Tab Onboarding */}
        <TabsContent value="onboarding" className="space-y-4">
          {loadingOnboarding ? (
            <BexCard variant="gaming">
              <BexCardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </BexCardContent>
            </BexCard>
          ) : !onboarding ? (
            <BexCard variant="gaming">
              <BexCardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Onboarding não preenchido</h3>
                <p className="text-muted-foreground mb-4">
                  Complete o onboarding para acessar análises e personas
                </p>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Iniciar Onboarding
                </Button>
              </BexCardContent>
            </BexCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Informações da Empresa */}
              <BexCard variant="gaming">
                <BexCardHeader>
                  <BexCardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-bex-green" />
                    Sobre a Empresa
                  </BexCardTitle>
                </BexCardHeader>
                <BexCardContent className="space-y-3">
                  {onboarding.segmento_atuacao && (
                    <div>
                      <p className="text-sm text-muted-foreground">Segmento</p>
                      <p className="font-medium">{onboarding.segmento_atuacao}</p>
                    </div>
                  )}
                  {onboarding.produtos_servicos && (
                    <div>
                      <p className="text-sm text-muted-foreground">Produtos/Serviços</p>
                      <p className="font-medium">{onboarding.produtos_servicos}</p>
                    </div>
                  )}
                  {onboarding.tempo_mercado && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo no Mercado</p>
                      <p className="font-medium">{onboarding.tempo_mercado}</p>
                    </div>
                  )}
                </BexCardContent>
              </BexCard>

              {/* Público-Alvo */}
              <BexCard variant="gaming">
                <BexCardHeader>
                  <BexCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-bex-green" />
                    Público-Alvo
                  </BexCardTitle>
                </BexCardHeader>
                <BexCardContent className="space-y-3">
                  {onboarding.publico_alvo && onboarding.publico_alvo.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Segmentos</p>
                      <div className="flex flex-wrap gap-2">
                        {onboarding.publico_alvo.map((p: string, i: number) => (
                          <Badge key={i} variant="outline">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {onboarding.dores_problemas && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dores e Problemas</p>
                      <p className="font-medium text-sm">{onboarding.dores_problemas}</p>
                    </div>
                  )}
                  {onboarding.diferenciais && (
                    <div>
                      <p className="text-sm text-muted-foreground">Diferenciais</p>
                      <p className="font-medium text-sm">{onboarding.diferenciais}</p>
                    </div>
                  )}
                </BexCardContent>
              </BexCard>

              {/* Análise SWOT */}
              <BexCard variant="gaming" className="lg:col-span-2">
                <BexCardHeader>
                  <BexCardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-bex-green" />
                    Análise SWOT
                  </BexCardTitle>
                </BexCardHeader>
                <BexCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onboarding.forcas && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <h4 className="font-semibold text-green-500">Forças</h4>
                        </div>
                        <p className="text-sm">{onboarding.forcas}</p>
                      </div>
                    )}
                    {onboarding.fraquezas && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <h4 className="font-semibold text-red-500">Fraquezas</h4>
                        </div>
                        <p className="text-sm">{onboarding.fraquezas}</p>
                      </div>
                    )}
                    {onboarding.oportunidades && (
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <h4 className="font-semibold text-blue-500">Oportunidades</h4>
                        </div>
                        <p className="text-sm">{onboarding.oportunidades}</p>
                      </div>
                    )}
                    {onboarding.ameacas && (
                      <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <h4 className="font-semibold text-orange-500">Ameaças</h4>
                        </div>
                        <p className="text-sm">{onboarding.ameacas}</p>
                      </div>
                    )}
                  </div>
                </BexCardContent>
              </BexCard>

              {/* Links Sociais */}
              {(onboarding.link_instagram || onboarding.link_facebook || onboarding.link_linkedin) && (
                <BexCard variant="gaming" className="lg:col-span-2">
                  <BexCardHeader>
                    <BexCardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-bex-green" />
                      Presença Digital
                    </BexCardTitle>
                  </BexCardHeader>
                  <BexCardContent>
                    <div className="flex flex-wrap gap-2">
                      {onboarding.link_instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={onboarding.link_instagram} target="_blank" rel="noopener noreferrer">
                            Instagram
                          </a>
                        </Button>
                      )}
                      {onboarding.link_facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={onboarding.link_facebook} target="_blank" rel="noopener noreferrer">
                            Facebook
                          </a>
                        </Button>
                      )}
                      {onboarding.link_linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={onboarding.link_linkedin} target="_blank" rel="noopener noreferrer">
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {onboarding.link_site && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={onboarding.link_site} target="_blank" rel="noopener noreferrer">
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </BexCardContent>
                </BexCard>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab Personas */}
        <TabsContent value="personas">
          <BexCard variant="gaming">
            <BexCardContent className="py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Personas em desenvolvimento</h3>
              <p className="text-muted-foreground mb-4">
                Acesse o Plano Editorial para gerar personas com IA
              </p>
              <Button onClick={() => navigate(`/grs/cliente/${clienteId}/planejamentos`)}>
                <Briefcase className="h-4 w-4 mr-2" />
                Ver Planejamentos
              </Button>
            </BexCardContent>
          </BexCard>
        </TabsContent>

        {/* Tab Métricas */}
        <TabsContent value="metricas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BexCard variant="gaming">
              <BexCardHeader>
                <BexCardTitle className="text-sm">Projetos Ativos</BexCardTitle>
              </BexCardHeader>
              <BexCardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">0</span>
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
              </BexCardContent>
            </BexCard>

            <BexCard variant="gaming">
              <BexCardHeader>
                <BexCardTitle className="text-sm">Planejamentos</BexCardTitle>
              </BexCardHeader>
              <BexCardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">0</span>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </BexCardContent>
            </BexCard>

            <BexCard variant="gaming">
              <BexCardHeader>
                <BexCardTitle className="text-sm">Aprovações Pendentes</BexCardTitle>
              </BexCardHeader>
              <BexCardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">0</span>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </BexCardContent>
            </BexCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <BexCard variant="gaming">
        <BexCardHeader>
          <BexCardTitle>Ações Rápidas</BexCardTitle>
        </BexCardHeader>
        <BexCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate(`/grs/cliente/${clienteId}/projetos`)}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Ver Projetos
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate(`/grs/cliente/${clienteId}/planejamentos`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Planejamentos
            </Button>
            <Button
              variant="outline"
              className="justify-start"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Onboarding
            </Button>
          </div>
        </BexCardContent>
      </BexCard>
    </div>
  );
}
