import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Newspaper, 
  Cloud, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Settings,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IntelligenceSettingsDialog } from '@/components/Intelligence/IntelligenceSettingsDialog';

interface IntelligenceData {
  id: string;
  title: string;
  content: string;
  url?: string;
  data_type: string;
  keywords: string[];
  metric_value?: number;
  published_at: string;
  retrieved_at: string;
  source: {
    name: string;
    type: string;
  };
}

interface ConnectorStatus {
  connector_name: string;
  status: string;
  last_success_at?: string;
  last_error_at?: string;
  last_error_message?: string;
  calls_today: number;
}

export default function IntelligenceDashboard() {
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData[]>([]);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntelligenceData();
    fetchConnectorStatus();
  }, []);

  const fetchIntelligenceData = async () => {
    try {
      const { data, error } = await supabase
        .from('intelligence_data')
        .select(`
          *,
          source:intelligence_sources(name, type)
        `)
        .order('retrieved_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setIntelligenceData(data || []);
    } catch (error) {
      console.error('Error fetching intelligence data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de inteligência",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectorStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('connector_status')
        .select('*')
        .order('connector_name');

      if (error) throw error;
      setConnectorStatus(data || []);
    } catch (error) {
      console.error('Error fetching connector status:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Call the intelligence collector edge function
      const { data, error } = await supabase.functions.invoke('intelligence-collector');
      
      if (error) throw error;
      
      toast({
        title: "Dados atualizados",
        description: "Os dados de inteligência foram atualizados com sucesso"
      });
      
      // Refresh the data
      await fetchIntelligenceData();
      await fetchConnectorStatus();
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar os dados",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'social': return <TrendingUp className="h-4 w-4" />;
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'demographics': return <Users className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeData = (type: string) => {
    return intelligenceData.filter(item => item.data_type === type);
  };

  const healthyConnectors = connectorStatus.filter(c => c.status === 'healthy').length;
  const totalConnectors = connectorStatus.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados de inteligência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hub de Inteligência</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de tendências, notícias e insights do mercado
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <IntelligenceSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
      />

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fontes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnectors}</div>
            <p className="text-xs text-muted-foreground">
              {healthyConnectors} funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Coletados</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intelligenceData.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notícias</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTypeData('news').length}</div>
            <p className="text-xs text-muted-foreground">
              Artigos encontrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {getStatusIcon(healthyConnectors === totalConnectors ? 'healthy' : 'warning')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((healthyConnectors / totalConnectors) * 100)}%
            </div>
            <Progress 
              value={(healthyConnectors / totalConnectors) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="news">Notícias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="connectors">Conectores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Recentes</CardTitle>
                <CardDescription>
                  Últimas informações coletadas de todas as fontes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {intelligenceData.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(item.data_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">
                              {item.title}
                            </h4>
                            <Badge variant="outline" className="ml-2 flex-shrink-0">
                              {item.source?.name}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.content}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {item.keywords?.slice(0, 3).map((keyword) => (
                                <Badge key={keyword} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.published_at), 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                              {item.url && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Connector Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Conectores</CardTitle>
                <CardDescription>
                  Monitoramento da saúde das fontes de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {connectorStatus.map((connector) => (
                      <div key={connector.connector_name} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(connector.status)}
                          <div>
                            <h4 className="text-sm font-medium">{connector.connector_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {connector.calls_today} chamadas hoje
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            connector.status === 'healthy' ? 'default' :
                            connector.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {connector.status === 'healthy' ? 'Ativo' :
                             connector.status === 'warning' ? 'Aviso' : 'Erro'}
                          </Badge>
                          {connector.last_success_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Último sucesso: {format(new Date(connector.last_success_at), 'dd/MM HH:mm', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Notícias do Mercado
              </CardTitle>
              <CardDescription>
                Últimas notícias relevantes para o seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {getTypeData('news').map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {item.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.keywords?.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.published_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                            {item.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  Ler mais <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendências Sociais
              </CardTitle>
              <CardDescription>
                Tendências e conteúdo viral nas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {getTypeData('social').map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {item.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.keywords?.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.published_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                            {item.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  Ver vídeo <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Conectores</CardTitle>
              <CardDescription>
                Gerencie as fontes de dados e configure novos conectores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {connectorStatus.map((connector) => (
                  <div key={connector.connector_name} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(connector.status)}
                        <div>
                          <h3 className="font-medium">{connector.connector_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connector.calls_today} chamadas realizadas hoje
                          </p>
                          {connector.last_error_message && (
                            <p className="text-sm text-red-500 mt-1">
                              Erro: {connector.last_error_message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          connector.status === 'healthy' ? 'default' :
                          connector.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {connector.status === 'healthy' ? 'Ativo' :
                           connector.status === 'warning' ? 'Aviso' : 'Erro'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Configurar
                        </Button>
                      </div>
                    </div>
                    {connector.last_success_at && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Última coleta bem-sucedida: {format(new Date(connector.last_success_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}